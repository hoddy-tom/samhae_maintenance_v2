// ==========================================
// 💡 [종합 마스터 데이터 설정 콘솔]
// ==========================================
const INSPECTORS = ["김승용", "안지민"];

const CONFIG_DATA = [
    { category: "일일점검표", line: "식탁김 1,2라인", item: "공급기 벨트 이상 유무" },
    { category: "일일점검표", line: "식탁김 1,2라인", item: "커터 칼날 마모 상태 및 정렬 상태" },
    { category: "일일점검표", line: "식탁김 1,2라인", item: "히터 온도 감지기 정상 작동 여부" },
    { category: "일일점검표", line: "식탁김 3,4라인", item: "3,4라인 메인 핀치롤러 압력 상태" },
    { category: "일일점검표", line: "도시락 5,6라인", item: "도시락 성형기 실린더 유압 체크" },
    { category: "일일점검표", line: "도시락 7,8라인", item: "도시락 최종 실링부 가열 상태" },
    { category: "주간점검표", line: "공통 포장 설비", item: "박스 테이핑기 에어 실린더 윤활 상태" },
    { category: "주간점검표", line: "공통 포장 설비", item: "잉크젯 마킹기 헤드 세척 상태" },
    { category: "월간점검표", line: "변전실", item: "특고압 차단기 절연 파괴 여부 검사" },
    { category: "A급설비점검표", line: "", item: "" },
    { category: "B급설비점검표", line: "", item: "" },
    { category: "기타점검일지", line: "", item: "" }
];

let currentState = { inspector: '', category: '', line: '', history: ['login-page'] };
let currentItems = [];

window.addEventListener('DOMContentLoaded', () => {
    initInspectorSelect();
    initDownloadFilters();
});

function initInspectorSelect() {
    const select = document.getElementById('inspector-select');
    select.innerHTML = '<option value="">-- 점검자를 선택하세요 --</option>';
    INSPECTORS.forEach(name => { select.innerHTML += `<option value="${name}">${name}</option>`; });
}

function initDownloadFilters() {
    const inspFilter = document.getElementById('filter-inspector');
    const catFilter = document.getElementById('filter-category');
    const lineFilter = document.getElementById('filter-line');
    const itemFilter = document.getElementById('filter-item');

    INSPECTORS.forEach(name => inspFilter.innerHTML += `<option value="${name}">${name}</option>`);
    const categories = [...new Set(CONFIG_DATA.map(d => d.category).filter(Boolean))];
    categories.forEach(cat => catFilter.innerHTML += `<option value="${cat}">${cat}</option>`);

    catFilter.addEventListener('change', () => {
        const selectedCat = catFilter.value;
        lineFilter.innerHTML = '<option value="전체">전체</option>';
        itemFilter.innerHTML = '<option value="전체">전체</option>';
        if(selectedCat === '전체') return;
        const lines = [...new Set(CONFIG_DATA.filter(d => d.category === selectedCat).map(d => d.line).filter(Boolean))];
        lines.forEach(l => lineFilter.innerHTML += `<option value="${l}">${l}</option>`);
    });

    lineFilter.addEventListener('change', () => {
        const selectedCat = catFilter.value;
        const selectedLine = lineFilter.value;
        itemFilter.innerHTML = '<option value="전체">전체</option>';
        if(selectedLine === '전체') return;
        const items = CONFIG_DATA.filter(d => d.category === selectedCat && d.line === selectedLine).map(d => d.item).filter(Boolean);
        items.forEach(i => itemFilter.innerHTML += `<option value="${i}">${i}</option>`);
    });
}

function verifyInspector() {
    const select = document.getElementById('inspector-select');
    if (!select.value) { alert("점검자를 선택해 주세요."); return; }
    currentState.inspector = select.value;
    renderHomePage();
}

function renderHomePage() {
    const container = document.getElementById('category-list');
    container.innerHTML = '';
    const categories = [...new Set(CONFIG_DATA.map(d => d.category).filter(Boolean))];
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.innerText = cat;
        btn.onclick = () => goPageA(cat);
        container.appendChild(btn);
    });
    showPage('home-page', '점검일지');
}

function goPageA(cat) {
    currentState.category = cat;
    const container = document.getElementById('line-list');
    container.innerHTML = '';
    const lines = [...new Set(CONFIG_DATA.filter(d => d.category === cat).map(d => d.line).filter(Boolean))];
    if (lines.length === 0) { alert("등록된 하위 라인이 없습니다."); return; }
    lines.forEach(line => {
        const btn = document.createElement('button');
        btn.innerText = line;
        btn.onclick = () => goPageB(line);
        container.appendChild(btn);
    });
    showPage('page-a', cat);
}

// B페이지 진입 (특이사항 1, 특이사항 2 입력란 분할 바인딩)
function goPageB(line) {
    currentState.line = line;
    currentItems = CONFIG_DATA.filter(d => d.category === currentState.category && d.line === line).map(d => d.item).filter(Boolean);
    
    const body = document.getElementById('inspection-body');
    body.innerHTML = '';
    
    currentItems.forEach((item, idx) => {
        const row = `<tr>
            <td>${idx + 1}</td>
            <td style="text-align:left;">${item}</td>
            <td><input type="radio" name="item_${idx}" value="이상X"></td>
            <td><input type="radio" name="item_${idx}" value="이상O"></td>
            <td><input type="text" id="remark1_${idx}" placeholder="특이사항 1"></td>
            <td><input type="text" id="remark2_${idx}" placeholder="특이사항 2"></td>
        </tr>`;
        body.innerHTML += row;
    });
    
    showPage('page-b', line);
    document.getElementById('save-btn').classList.remove('hidden');
}

function showPage(pageId, titleText) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    document.getElementById('page-title').innerText = titleText;
    if (currentState.history[currentState.history.length - 1] !== pageId) { currentState.history.push(pageId); }
}

function goBack() {
    if (currentState.history.length > 1) {
        currentState.history.pop();
        const prevPage = currentState.history[currentState.history.length - 1];
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        document.getElementById(prevPage).classList.remove('hidden');
        document.getElementById('save-btn').classList.add('hidden');
        
        if (prevPage === 'login-page' || prevPage === 'home-page') { document.getElementById('page-title').innerText = '점검일지'; }
        else if (prevPage === 'page-a') { document.getElementById('page-title').innerText = currentState.category; }
        else if (prevPage === 'page-b') { document.getElementById('page-title').innerText = currentState.line; document.getElementById('save-btn').classList.remove('hidden'); }
    }
}

function validateSave() {
    let complete = true;
    currentItems.forEach((_, idx) => { if (!document.querySelector(`input[name="item_${idx}"]:checked`)) complete = false; });
    if (!complete) { document.getElementById('alert-modal').classList.remove('hidden'); } else { submitData(); }
}

function closeModal() { document.getElementById('alert-modal').classList.add('hidden'); }
function forceSave() { closeModal(); submitData(); }

// 원격 서버 전송 데이터 구조 확장 (remark1, remark2 추출)
async function submitData() {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')} ${String(now.getMinutes()).padStart(2, '0')}`;

    const newLogs = currentItems.map((item, idx) => ({
        date: formattedDate,
        inspector: currentState.inspector,
        category: currentState.category,
        line: currentState.line,
        item: item,
        status: document.querySelector(`input[name="item_${idx}"]:checked`)?.value || "미입력",
        remark1: document.getElementById(`remark1_${idx}`).value,
        remark2: document.getElementById(`remark2_${idx}`).value
    }));

    try {
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logs: newLogs })
        });
        if (!response.ok) throw new Error();
        alert("저장이 완료되었습니다.");
        currentState.history = ['login-page', 'home-page'];
        goPageA(currentState.category);
    } catch (e) {
        alert("서버 전송에 실패했습니다.");
    }
}

// 엑셀 다운로드 포맷 확장 (특이사항 1, 특이사항 2 분할 추출 엔진)
async function downloadCSV() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const fInspector = document.getElementById('filter-inspector').value;
    const fCategory = document.getElementById('filter-category').value;
    const fLine = document.getElementById('filter-line').value;
    const fItem = document.getElementById('filter-item').value;

    try {
        const response = await fetch('/api/download');
        if (!response.ok) throw new Error();
        const logs = await response.json();
        if (logs.length === 0) { alert('저장된 내역이 없습니다.'); return; }

        const filteredLogs = logs.filter(log => {
            const logDay = log.date.split(' ')[0];
            if (startDate && logDay < startDate) return false;
            if (endDate && logDay > endDate) return false;
            if (fInspector !== '전체' && log.inspector !== fInspector) return false;
            if (fCategory !== '전체' && log.category !== fCategory) return false;
            if (fLine !== '전체' && log.line !== fLine) return false;
            if (fItem !== '전체' && log.item !== fItem) return false;
            return true;
        });

        if (filteredLogs.length === 0) { alert('조건에 맞는 데이터가 없습니다.'); return; }

        let csvContent = "\ufeff"; 
        csvContent += "점검일시,점검자,대분류,중분류,점검항목,점검결과,특이사항 1,특이사항 2\n";

        filteredLogs.forEach(log => {
            // 구 데이터(하나짜리 remark) 하위 호환 예외 처리 포함
            const r1 = log.remark1 !== undefined ? log.remark1 : (log.remark || "");
            const r2 = log.remark2 !== undefined ? log.remark2 : "";

            const row = [
                `"${log.date}"`,
                `"${log.inspector}"`,
                `"${log.category}"`,
                `"${log.line}"`,
                `"${log.item}"`,
                `"${log.status}"`,
                `"${r1.replace(/"/g, '""')}"`,
                `"${r2.replace(/"/g, '""')}"`
            ].join(",");
            csvContent += row + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `점검데이터_추출_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        alert('데이터 연동에 실패했습니다.');
    }
}