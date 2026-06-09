export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.tokens;
  if (!token) {
    return res.status(404).json({ error: 'tokens 환경변수가 설정되지 않았습니다.' });
  }

  return res.status(200).json({ token });
}
