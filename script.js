/**
 * 台灣證交所 OpenAPI 股利分派查詢邏輯
 * 使用 corsproxy.io 繞過瀏覽器 CORS 限制
 */

const TARGET_URL = "https://openapi.twse.com.tw/v1/opendata/t187ap45_L";
const PROXY_URL = `https://corsproxy.io/?${encodeURIComponent(TARGET_URL)}`;

let rawData = []; // 儲存原始資料供搜尋使用

// 取得 HTML 元素
const fetchBtn = document.getElementById('fetchBtn');
const searchInput = document.getElementById('searchInput');
const dataBody = document.getElementById('dataBody');
const loader = document.getElementById('loading');

/**
 * 從 API 抓取資料
 */
async function loadData() {
    try {
        // 1. 顯示載入狀態
        loader.classList.remove('d-none');
        dataBody.innerHTML = "";
        
        // 2. 發送請求
        const response = await fetch(PROXY_URL);
        
        if (!response.ok) {
            throw new Error(`伺服器回應錯誤: ${response.status}`);
        }
        
        // 3. 解析 JSON (corsproxy 會直接回傳原始格式)
        rawData = await response.json();
        
        // 4. 渲染表格 (預設顯示前 100 筆)
        renderTable(rawData.slice(0, 100));
        
    } catch (error) {
        console.error("Fetch Error:", error);
        dataBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    <strong>資料讀取失敗</strong><br>
                    原因：${error.message}<br>
                    <small>請嘗試重新整理網頁，或稍後再試。</small>
                </td>
            </tr>`;
    } finally {
        // 5. 隱藏載入狀態
        loader.classList.add('d-none');
    }
}

/**
 * 將資料渲染到 HTML 表格中
 * @param {Array} data - 要顯示的資料陣列
 */
function renderTable(data) {
    if (!data || data.length === 0) {
        dataBody.innerHTML = `<tr><td colspan="5" class="text-center">查無相符資料</td></tr>`;
        return;
    }

    const htmlRows = data.map(item => {
        // 處理可能的空值
        const code = item["公司代號"] || "N/A";
        const name = item["公司名稱"] || "未知";
        const year = item["股利年度"] || "-";
        const dividend = item["股東配發-盈餘分配之現金股利(元/股)"] || "0";
        const date = item["出表日期"] || "-";

        return `
            <tr>
                <td><span class="badge bg-secondary">${code}</span></td>
                <td><strong>${name}</strong></td>
                <td>${year}</td>
                <td class="text-success fw-bold">${dividend} 元</td>
                <td><small class="text-muted">${date}</small></td>
            </tr>
        `;
    }).join('');

    dataBody.innerHTML = htmlRows;
}

/**
 * 搜尋過濾邏輯
 */
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.trim().toLowerCase();
    
    // 篩選名稱或代號包含關鍵字的資料
    const filtered = rawData.filter(item => 
        (item["公司名稱"] && item["公司名稱"].includes(term)) || 
        (item["公司代號"] && item["公司代號"].includes(term))
    );
    
    // 顯示篩選結果 (限制 100 筆確保效能)
    renderTable(filtered.slice(0, 100));
});

// 綁定按鈕手動更新
fetchBtn.addEventListener('click', loadData);

// 頁面載入完成後自動執行一次
document.addEventListener('DOMContentLoaded', loadData);