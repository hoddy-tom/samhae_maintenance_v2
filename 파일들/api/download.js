// download.js 내부를 아래와 같이 수정
const dbResult = await response.json();
const rawLogs = dbResult.result || [];

const cleanLogs = [];
rawLogs.forEach(logStr => {
  try {
    const parsed = JSON.parse(logStr);
    // [핵심] 저장된 데이터가 {logs: [...]} 구조라면, 내부 배열을 꺼내어 전체 리스트에 추가
    if (parsed.logs && Array.isArray(parsed.logs)) {
      cleanLogs.push(...parsed.logs);
    } else {
      cleanLogs.push(parsed);
    }
  } catch (e) {
    console.error("데이터 파싱 오류", e);
  }
});

return res.status(200).json(cleanLogs);