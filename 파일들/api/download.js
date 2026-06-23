export default async function handler(req, res) {
  // CORS 보안 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 환경변수 자동 매칭
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: '데이터베이스 연결 정보를 찾을 수 없습니다.' });
  }

  try {
    // 저장소에 쌓인 모든 로그 목록 가져오기 (LRANGE 0부터 -1까지 전체 조회)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['LRANGE', 'samhae_maintenance_logs', '0', '-1'])
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`데이터베이스 조회 실패: ${errorText}`);
    }

    const dbResult = await response.json();
    const rawLogs = dbResult.result || [];

    // 문자열로 압축되어 저장된 데이터를 프론트엔드가 사용할 수 있는 깔끔한 JSON 배열로 복원
    const cleanLogs = rawLogs.map(logStr => {
      try {
        return JSON.parse(logStr);
      } catch (e) {
        return { rawData: logStr, parseError: true };
      }
    });

    // 정제된 전체 데이터 전송
    return res.status(200).json(cleanLogs);
  } catch (error) {
    console.error('Download Error:', error);
    return res.status(500).json({ error: '데이터 조회 실패', details: error.message });
  }
}