import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false, // 不要な解析をスキップ
    externalResolver: true, // 非同期処理を最適化
  },
};

async function retryFetch(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        redirect: 'follow', // リダイレクトを自動処理
      });
      if (res.ok) return res;
    } catch {}
  }
  throw new Error('All retries failed');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    // ランダムエンドポイントで検知回避
    const randomStr = Math.random().toString(36).substring(2, 8);
    if (req.query.redirect !== 'true') {
      res.redirect(`/api/proxy?redirect=true&url=${encodeURIComponent(url)}&r=${randomStr}`);
      return;
    }

    const response = await retryFetch(url);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'text/html');

    const buffer = await response.buffer();
    res.status(response.status).send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Fetch failed' });
  }
}
