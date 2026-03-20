const TARGET_URL = "https://openapi.twse.com.tw/v1/opendata/t187ap45_L";
const PROXY_URL = `https://corsproxy.io/?${encodeURIComponent(TARGET_URL)}`;

let rawData = []; 

// 確保元素存在再綁定
const fetchBtn = document.getElementById('fetchBtn');
const searchInput = document.getElementById('searchInput');
const dataBody = document.getElementById('dataBody');
const loader = document.getElementById('loading');

async function loadData() {
    console.log("開始抓取資料..."); // 除錯點 1
    
    try {
        if (!dataBody || !loader) return;
        
        loader.classList.remove('d-none');
        dataBody.innerHTML = '<tr><td colspan="5" class="text-center">連線中...</td></tr>';
        
        const response = await fetch(PROXY_URL);
        console.log("API 回應狀態:", response.status); // 除錯點 2
        
        if (!response.ok) throw new Error(`HTTP 錯誤: ${response.status}`);
        
        const data = await response.json();
        console.log("原始資料型別:", typeof data, "是否為陣列:", Array.isArray(data));
        
        // 防錯：如果不是陣列，嘗試找尋裡面的陣列欄位
        rawData = Array.isArray(data) ? data : (data.data || []);
        
        renderTable(rawData.slice(0, 100));
        
    } catch (error) {
        console.error("抓取失敗:", error);
        dataBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">錯誤: ${error.message}</td></tr>`;
    } finally {
        loader.classList.add('d-none');
    }
}

function renderTable(data) {
    if (!dataBody) return;
    
    if (!data || data.length === 0) {
        dataBody.innerHTML = `<tr><td colspan="5" class="text-center">目前沒有資料</td></tr>`;
        return;
    }

    const html = data.map(item => `
        <tr>
            <td><span class="badge bg-secondary">${item["公司代號"] || 'N/A'}</span></td>
            <td><strong>${item["公司名稱"] || '未知'}</strong></td>
            <td>${item["股利年度"] || '-'}</td>
            <td class="text-success">${item["股東配發-盈餘分配之現金股利(元/股)"] || 0} 元</td>
            <td><small class="text-muted">${item["出表日期"] || '-'}</small></td>
        </tr>
    `).join('');

    dataBody.innerHTML = html;
}

// 綁定事件處理 (加上防呆)
if (fetchBtn) {
    fetchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadData();
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim().toLowerCase();
        const filtered = rawData.filter(item => 
            String(item["公司名稱"]).includes(term) || 
            String(item["公司代號"]).includes(term)
        );
        renderTable(filtered.slice(0, 100));
    });
}

// 初始化
window.onload = () => {
    console.log("網頁已載入，準備初始化資料...");
    loadData();
};