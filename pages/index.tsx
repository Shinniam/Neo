import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(`/api/proxy?url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button type="submit">Go</button>
    </form>
  );
}
