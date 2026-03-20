// 使用 allorigins 代理伺服器來繞過 CORS 限制
// const TARGET_URL = "https://openapi.twse.com.tw/v1/opendata/t187ap45_L";
// const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(TARGET_URL)}`;

let rawData = []; 

const fetchBtn = document.getElementById('fetchBtn');
const searchInput = document.getElementById('searchInput');
const dataBody = document.getElementById('dataBody');
const loader = document.getElementById('loading');

// 更換為另一個代理服務
const TARGET_URL = "https://openapi.twse.com.tw/v1/opendata/t187ap45_L";
const PROXY_URL = `https://corsproxy.io/?${encodeURIComponent(TARGET_URL)}`;

async function loadData() {
    try {
        loader.classList.remove('d-none');
        dataBody.innerHTML = "";
        
        const response = await fetch(PROXY_URL);
        if (!response.ok) throw new Error("代理伺服器連線失敗");
        
        // 注意：corsproxy.io 會直接回傳原始 API 的 JSON
        // 所以這裡不需要 JSON.parse(result.contents)，直接取用即可！
        rawData = await response.json();
        renderTable(rawData.slice(0, 100)); 
        
    } catch (error) {
        console.error("詳細錯誤資訊:", error);
        dataBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">讀取失敗：${error.message}</td></tr>`;
    } finally {
        loader.classList.add('d-none');
    }
}
// async function loadData() {
    // try {
        顯示載入中動畫
        // loader.classList.remove('d-none');
        // dataBody.innerHTML = "";
        
        // const response = await fetch(PROXY_URL);
        // if (!response.ok) throw new Error("代理伺服器連線失敗");
        
        // const wrapper = await response.json();
        
        重要：allorigins 回傳的是物件，真正的 API 資料在 .contents 裡 (且是字串)
        // if (wrapper.contents) {
            // rawData = JSON.parse(wrapper.contents);
            // renderTable(rawData.slice(0, 100)); 
        // } else {
            // throw new Error("找不到有效的資料內容");
        // }
        
    // } catch (error) {
        // console.error("詳細錯誤資訊:", error);
        // dataBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">讀取失敗：${error.message}<br>請確認網路連線或稍後再試。</td></tr>`;
    // } finally {
        // loader.classList.add('d-none');
    // }
// }

function renderTable(data) {
    if (!data || data.length === 0) {
        dataBody.innerHTML = `<tr><td colspan="5" class="text-center">查無資料</td></tr>`;
        return;
    }

    dataBody.innerHTML = data.map(item => `
        <tr>
            <td><span class="badge bg-secondary">${item["公司代號"]}</span></td>
            <td><strong>${item["公司名稱"]}</strong></td>
            <td>${item["股利年度"] || '-'}</td>
            <td class="text-success">${item["股東配發-盈餘分配之現金股利(元/股)"] || 0} 元</td>
            <td><small class="text-muted">${item["出表日期"] || '-'}</small></td>
        </tr>
    `).join('');
}

// 搜尋功能
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.trim().toLowerCase();
    const filtered = rawData.filter(item => 
        item["公司名稱"].includes(term) || 
        item["公司代號"].includes(term)
    );
    renderTable(filtered.slice(0, 100));
});

fetchBtn.addEventListener('click', loadData);

// 網頁開啟時自動抓取一次
window.addEventListener('DOMContentLoaded', loadData);