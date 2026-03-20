// 請在此填入你的氣象署 API Key
const API_KEY = "CWA-6ED90C4C-3A6E-4B00-AB69-66F6E8EA5F09"; 
const API_URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${API_KEY}`;

let weatherData = [];

const weatherCards = document.getElementById('weatherCards');
const fetchBtn = document.getElementById('fetchBtn');
const searchInput = document.getElementById('searchInput');
const loader = document.getElementById('loading');

async function getWeatherData() {
    try {
        loader.classList.remove('d-none');
        weatherCards.innerHTML = '';

        // 氣象署 API 本身就支援 CORS，所以直接抓取即可！
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error("API 金鑰錯誤或連線失敗");
        
        const json = await response.json();
        
        // 解析氣象署層層巢狀的 JSON 結構
        weatherData = json.records.location;
        renderCards(weatherData);

    } catch (error) {
        console.error("錯誤:", error);
        weatherCards.innerHTML = `
            <div class="col-12 text-center text-danger">
                <h3>抓取失敗</h3>
                <p>${error.message}</p>
                <p>請檢查 API Key 是否填寫正確。</p>
            </div>`;
    } finally {
        loader.classList.add('d-none');
    }
}

function renderCards(locations) {
    if (!locations.length) {
        weatherCards.innerHTML = '<p class="text-center w-100">找不到該縣市...</p>';
        return;
    }

    weatherCards.innerHTML = locations.map(loc => {
        // 取得具體天氣資訊 (Wx: 天氣現象, Pop: 降雨機率, MinT: 最低溫, MaxT: 最高溫)
        const wx = loc.weatherElement[0].time[0].parameter.parameterName;
        const pop = loc.weatherElement[1].time[0].parameter.parameterName;
        const minT = loc.weatherElement[2].time[0].parameter.parameterName;
        const maxT = loc.weatherElement[4].time[0].parameter.parameterName;

        return `
            <div class="col">
                <div class="card weather-card h-100 shadow-sm p-3">
                    <div class="card-body">
                        <h5 class="card-title fw-bold text-dark">${loc.locationName}</h5>
                        <p class="card-text text-muted mb-2">${wx}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="temp-badge">${minT}°C - ${maxT}°C</span>
                            <span class="rain-chance">💧 降雨率 ${pop}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 搜尋過濾
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.trim();
    const filtered = weatherData.filter(loc => loc.locationName.includes(term));
    renderCards(filtered);
});

fetchBtn.addEventListener('click', getWeatherData);

// 初始化載入
window.onload = getWeatherData;