// 定義 API 網址 (股利分派)
const API_URL = "https://openapi.twse.com.tw/v1/opendata/t187ap45_L";
let rawData = []; // 用於存放原始數據以供搜尋篩選

// 取得 DOM 元素
const fetchBtn = document.getElementById('fetchBtn');
const searchInput = document.getElementById('searchInput');
const dataBody = document.getElementById('dataBody');
const loader = document.getElementById('loading');

// 抓取資料的函式
async function loadData() {
    try {
        loader.classList.remove('d-none');
        dataBody.innerHTML = "";
        
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("網路請求失敗");
        
        rawData = await response.json();
        renderTable(rawData.slice(0, 100)); // 預設顯示前100筆
        
    } catch (error) {
        console.error("發生錯誤:", error);
        alert("無法讀取證交所資料，請稍後再試。");
    } finally {
        loader.classList.add('d-none');
    }
}

// 渲染表格的函式
function renderTable(data) {
    dataBody.innerHTML = data.map(item => `
        <tr>
            <td><span class="badge bg-secondary">${item["公司代號"]}</span></td>
            <td><strong>${item["公司名稱"]}</strong></td>
            <td>${item["股利年度"] || '-'}</td>
            <td class="text-success">${item["股東配發-盈餘分配之現金股利(元/股)"] || 0} 元</td>
            <td><small class="text-muted">需介接資安API</small></td>
        </tr>
    `).join('');
}

// 搜尋過濾功能
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = rawData.filter(item => 
        item["公司名稱"].includes(term) || 
        item["公司代號"].includes(term)
    );
    renderTable(filtered.slice(0, 100));
});

// 綁定按鈕點擊事件
fetchBtn.addEventListener('click', loadData);

// 初始化加載
window.addEventListener('DOMContentLoaded', loadData);