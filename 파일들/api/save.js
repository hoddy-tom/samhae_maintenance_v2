export default async function handler(req, res) {
  // POST 요청만 허용 (데이터 저장용)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  try {
    const { logs } = req.body;
    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: '올바르지 않은 데이터 형식입니다.' });
    }

    // 버셀 KV(Redis)에 여러 개의 데이터를 한 번에 밀어 넣기 위한 파이프라인 명령어 생성
    // 'inspection_logs'라는 하나의 데이터 리스트에 차례대로 누적(RPUSH)됩니다.
    const commands = logs.map(log => ["RPUSH", "inspection_logs", JSON.stringify(log)]);

    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(commands)
    });

    if (!response.ok) throw new Error('데이터베이스(KV) 서버 저장 실패');
    
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}