// 更換為對大檔案較友好的代理服務
const TARGET_URL = "https://openapi.twse.com.tw/v1/opendata/t187ap45_L";
// 使用 allorigins 的 raw 模式，這對大檔案比較穩定
const PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(TARGET_URL)}`;

let rawData = []; 

const fetchBtn = document.getElementById('fetchBtn');
const searchInput = document.getElementById('searchInput');
const dataBody = document.getElementById('dataBody');
const loader = document.getElementById('loading');

async function loadData() {
    console.log("開始抓取資料 (處理大檔案模式)...");
    
    try {
        if (!dataBody || !loader) return;
        
        loader.classList.remove('d-none');
        dataBody.innerHTML = '<tr><td colspan="5" class="text-center">大數據下載中，請稍候（約 3-5 秒）...</td></tr>';
        
        const response = await fetch(PROXY_URL);
        console.log("API 回應狀態:", response.status);
        
        if (!response.ok) {
            if (response.status === 413) throw new Error("檔案太大，代理伺服器拒絕處理");
            throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        
        const data = await response.json();
        rawData = Array.isArray(data) ? data : (data.data || []);
        
        console.log("成功抓取，總筆數:", rawData.length);
        renderTable(rawData.slice(0, 100)); // 先顯示前 100 筆
        
    } catch (error) {
        console.error("抓取失敗:", error);
        dataBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">錯誤: ${error.message}<br><small>建議改用手機網路試試，或檢查 API 存取限制</small></td></tr>`;
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

window.onload = loadData;