// 改用另一個穩定且支援較小資料量的代理
const TARGET_URL = "https://openapi.twse.com.tw/v1/exchangeReport/MI_5MINS_ASKBID";
const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(TARGET_URL)}`;

let rawData = []; 

const dataBody = document.getElementById('dataBody');
const loader = document.getElementById('loading');
const fetchBtn = document.getElementById('fetchBtn');

async function loadData() {
    console.log("開始抓取資料 (MI_5MINS 模式)...");
    
    try {
        if (!dataBody || !loader) return;
        
        loader.classList.remove('d-none');
        dataBody.innerHTML = '<tr><td colspan="5" class="text-center">資料載入中...</td></tr>';
        
        const response = await fetch(PROXY_URL);
        const result = await response.json();
        
        // allorigins 的內容在 contents 裡
        const content = result.contents;

        // 檢查回傳內容是否為 HTML (代表被擋了或是錯誤頁面)
        if (content.trim().startsWith("<!DOCTYPE")) {
            throw new Error("API 回傳了網頁內容而非數據，可能是被證交所暫時限制存取。");
        }

        rawData = JSON.parse(content);
        console.log("成功抓取！資料型別:", typeof rawData);
        
        renderTable(rawData);
        
    } catch (error) {
        console.error("抓取失敗:", error);
        dataBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">錯誤: ${error.message}</td></tr>`;
    } finally {
        loader.classList.add('d-none');
    }
}

function renderTable(data) {
    if (!data || data.length === 0) {
        dataBody.innerHTML = `<tr><td colspan="5" class="text-center">目前沒有即時委託資料</td></tr>`;
        return;
    }

    // MI_5MINS 的欄位名稱不同，我們對應一下
    dataBody.innerHTML = data.map(item => `
        <tr>
            <td><span class="badge bg-info">${item["時間"] || '-'}</span></td>
            <td><strong>累積委託買進筆數</strong></td>
            <td>${item["累積委託買進筆數"] || '-'}</td>
            <td class="text-success">${item["累積委託買進數量"] || '-'}</td>
            <td><small class="text-muted">買賣統計</small></td>
        </tr>
    `).join('');
}

// 綁定與初始化
if (fetchBtn) fetchBtn.addEventListener('click', loadData);
window.onload = loadData;