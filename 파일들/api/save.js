export default async function handler(req, res) {
  // CORS 보안 설정 (어디서나 접근 가능하도록 허용)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 브라우저 사전 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 버셀 KV와 일반 Redis 환경변수 이름을 모두 자동으로 탐색 및 호환
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ 
      error: '데이터베이스 연결 정보(환경변수)를 찾을 수 없습니다. 대시보드 설정을 확인해주세요.' 
    });
  }

  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: '저장할 데이터가 없습니다.' });
    }

    // 데이터에 저장 시간(한국 시간 기준 추적용) 자동 추가
    const logEntry = {
      ...data,
      savedAt: new Date().toISOString()
    };

    // 특수문자나 한글 깨짐을 완전히 방지하기 위해 
    // Upstash/Vercel KV REST API의 가장 안전한 POST Body 방식으로 전송합니다.
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
      throw new Error(`데이터베이스 저장 실패: ${errorText}`);
    }

    return res.status(200).json({ success: true, message: '저장이 완료되었습니다.' });
  } catch (error) {
    console.error('Save Error:', error);
    return res.status(500).json({ error: '서버 내부 에러로 저장 실패', details: error.message });
  }
}