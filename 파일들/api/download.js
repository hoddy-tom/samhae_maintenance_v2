export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  try {
    // 저장된 모든 데이터 꺼내오기 (0번부터 -1번 끝까지 전체 조회)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(["LRANGE", "inspection_logs", "0", "-1"])
    });

    if (!response.ok) throw new Error('데이터베이스(KV) 서버 조회 실패');
    
    const data = await response.json();
    
    // DB에 문자열로 저장되어 있던 JSON 텍스트들을 다시 깨끗한 오브젝트 배열로 복원
    const logs = (data.result || []).map(item => JSON.parse(item));
    
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}