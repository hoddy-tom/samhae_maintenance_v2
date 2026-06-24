export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      return res.status(500).json({ error: "환경변수가 설정되지 않았습니다." });
    }

    // Upstash REST API 호출 (URL 바로 사용)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['LRANGE', 'samhae_maintenance_logs', '0', '-1'])
    });

    if (!response.ok) {
      return res.status(500).json({ error: "DB 응답 실패" });
    }

    const data = await response.json();
    
    // 결과 처리
    const rawLogs = data.result || [];
    const cleanLogs = rawLogs.map(logStr => {
      try {
        return JSON.parse(logStr);
      } catch (e) { return null; }
    }).filter(item => item !== null);

    return res.status(200).json(cleanLogs);
  } catch (error) {
    return res.status(500).json({ error: "코드 실행 중 오류 발생" });
  }
}