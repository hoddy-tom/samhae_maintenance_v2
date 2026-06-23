export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 여러 가지 환경변수 가능성 탐색
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN;

  // 🔍 [진단 시스템] 버셀 로그에 환경변수 이름들을 강제로 출력합니다. (보안을 위해 값은 숨기고 이름만 출력)
  console.log("🔍 === [데이터베이스 연결 상태 진단] ===");
  console.log("1. URL 데이터 발견 여부:", url ? "⭕ 있음" : "❌ 없음");
  console.log("2. TOKEN 데이터 발견 여부:", token ? "⭕ 있음" : "❌ 없음");
  console.log("3. 현재 발견된 관련 환경변수 이름 목록:", Object.keys(process.env).filter(k => k.includes('KV') || k.includes('REDIS') || k.includes('URL') || k.includes('TOKEN')));
  console.log("=====================================");

  if (!url || !token) {
    return res.status(500).json({ error: '데이터베이스 연결 정보를 찾을 수 없습니다.' });
  }

  try {
    const data = req.body;
    if (!data) return res.status(400).json({ error: '저장할 데이터가 없습니다.' });

    const logEntry = { ...data, savedAt: new Date().toISOString() };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['LPUSH', 'samhae_maintenance_logs', JSON.stringify(logEntry)])
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DB 저장 실패: ${errorText}`);
    }

    return res.status(200).json({ success: true, message: '저장이 완료되었습니다.' });
  } catch (error) {
    console.error('Save Error:', error);
    return res.status(500).json({ error: '서버 에러', details: error.message });
  }
}