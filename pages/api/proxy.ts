import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error('Fetch failed with status: ' + response.status);
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'text/html');

    const buffer = await (response as any).buffer(); // 型エラーを回避
    res.status(response.status).send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Fetch failed: ' + (error as Error).message });
  }
}
