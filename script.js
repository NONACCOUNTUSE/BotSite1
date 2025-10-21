// Инициализация Telegram Web App
function initializeApp() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();

        const user = Telegram.WebApp.initDataUnsafe?.user;

        if (user) {
            // Обновляем аватар
            if (user.photo_url) {
                document.getElementById('userAvatar').innerHTML = `<img src="${user.photo_url}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%;">`;
            } else {
                const firstName = user.first_name || '';
                const initial = firstName.charAt(0).toUpperCase();
                document.getElementById('userAvatar').textContent = initial || '👤';
            }

            // Обновляем имя пользователя
            const userName = user.first_name || 'Пользователь';
            document.getElementById('userName').textContent = userName;
        }

        console.log('Telegram Web App initialized with user:', user);
    } else {
        console.log('Telegram Web App not available');
        // Тестовые данные для браузера
        document.getElementById('userName').textContent = 'Иван Иванов';
    }
}

// Функция для переключения меню
function showMenu(menuNumber) {
    const allMenus = document.querySelectorAll('.menu-content');
    const allButtons = document.querySelectorAll('.nav-btn');
    const settingsBtn = document.querySelector('.settings-btn');

    // Сбрасываем активность у всех кнопок
    allButtons.forEach(btn => btn.classList.remove('active'));
    settingsBtn.classList.remove('active');
    
    // Активируем кнопку только если это меню 1-5
    if (menuNumber >= 1 && menuNumber <= 5) {
        allButtons[menuNumber - 1].classList.add('active');
    } else if (menuNumber === 6) {
        settingsBtn.classList.add('active');
    }

    // Скрываем все меню
    allMenus.forEach(menu => menu.classList.remove('active'));

    // Показываем выбранное меню
    const selectedMenu = document.getElementById(`menu${menuNumber}`);
    if (selectedMenu) {
        selectedMenu.classList.add('active');

        // Запускаем анимацию для заголовка
        const title = selectedMenu.querySelector('.menu-title');
        if (title) {
            title.classList.remove('animate');
            void title.offsetWidth;
            title.classList.add('animate');
        }

        // Анимация для настроек
        // Анимация для настроек
if (menuNumber === 6) {
    const settingsLinks = document.querySelector('.settings-links');
    if (settingsLinks) {
        settingsLinks.style.opacity = '0';
        setTimeout(() => {
            settingsLinks.style.transition = 'opacity 1s ease';
            settingsLinks.style.opacity = '1';
        }, 2000);
    }
} else {
    // При переключении на другие меню убираем плавность
    const settingsLinks = document.querySelector('.settings-links');
    if (settingsLinks) {
        settingsLinks.style.transition = 'none';
        settingsLinks.style.opacity = '0';
    }

        }
    }
}

// Функция для копирования текста
function copyText(elementId) {
    const copyText = document.getElementById(elementId);
    const textToCopy = copyText.textContent;
    
    // Создаем временный textarea для копирования
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Убираем визуальную обратную связь (галочку и изменение цвета)
    // Теперь ничего не меняется при нажатии
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    showMenu(1); // по умолчанию открываем первое меню
})

// Код для графика курсов валют
let exchangeChart = null;
let updateInterval = null;
let currentCurrency = 'USD';

// Все известные API endpoints
const API_ENDPOINTS = {
    fiat: [
        'https://www.cbr-xml-daily.ru/daily_json.js',
        'https://api.exchangerate.host/latest?base=RUB',
        'https://api.currencyapi.com/v3/latest?apikey=cur_live_1234567890&base_currency=RUB',
        'https://api.freecurrencyapi.com/v1/latest?apikey=free_1234567890&base_currency=RUB',
        'https://api.fastforex.io/fetch-all?from=RUB&api_key=fast_1234567890'
    ],
    crypto: [
        'https://api.coingecko.com/api/v3/simple/price',
        'https://api.binance.com/api/v3/ticker/price',
        'https://api.coincap.io/v2/assets',
        'https://min-api.cryptocompare.com/data/price',
        'https://api.kraken.com/0/public/Ticker',
        'https://api.huobi.pro/market/detail/merged',
        'https://api.bybit.com/v2/public/tickers',
        'https://api.gate.io/api2/1/ticker',
        'https://api-pub.bitfinex.com/v2/tickers?symbols=',
        'https://api.pro.coinbase.com/products'
    ]
};

// Список валют и их параметры
const CURRENCIES = {
    USD: { name: 'Доллар', symbol: '🇺🇸', toCurrency: 'RUB', type: 'fiat' },
    EUR: { name: 'Евро', symbol: '🇪🇺', toCurrency: 'RUB', type: 'fiat' },
    KZT: { name: 'Тенге', symbol: '🇰🇿', toCurrency: 'RUB', type: 'fiat' },
    CNY: { name: 'Юань', symbol: '🇨🇳', toCurrency: 'RUB', type: 'fiat' },
    JPY: { name: 'Иена', symbol: '🇯🇵', toCurrency: 'RUB', type: 'fiat' },
    GBP: { name: 'Фунт', symbol: '🇬🇧', toCurrency: 'RUB', type: 'fiat' },
    BTC: { name: 'Bitcoin', symbol: '₿', toCurrency: 'USD', type: 'crypto' },
    ETH: { name: 'Ethereum', symbol: 'Ξ', toCurrency: 'USD', type: 'crypto' },
    USDT: { name: 'Tether', symbol: '💵', toCurrency: 'USD', type: 'crypto' },
    BNB: { name: 'BNB', symbol: '🔶', toCurrency: 'USD', type: 'crypto' },
    SOL: { name: 'Solana', symbol: '◎', toCurrency: 'USD', type: 'crypto' },
    XRP: { name: 'Ripple', symbol: '✕', toCurrency: 'USD', type: 'crypto' }
};

// ========== ФИАТНЫЕ ВАЛЮТЫ ==========

// Основной - ЦБ РФ
async function getFiatFromCBR(currency) {
    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    const data = await response.json();
    
    const rates = {
        'USD': data.Valute.USD?.Value,
        'EUR': data.Valute.EUR?.Value,
        'KZT': data.Valute.KZT?.Value / 100,
        'CNY': data.Valute.CNY?.Value,
        'JPY': data.Valute.JPY?.Value / 100,
        'GBP': data.Valute.GBP?.Value
    };
    
    return validateRate(rates[currency], currency);
}

// ExchangeRate API
async function getFiatFromExchangeRate(currency) {
    const response = await fetch('https://api.exchangerate.host/latest?base=RUB');
    const data = await response.json();
    
    const rates = {
        'USD': 1 / data.rates.USD,
        'EUR': 1 / data.rates.EUR,
        'KZT': 1 / data.rates.KZT,
        'CNY': 1 / data.rates.CNY,
        'JPY': 1 / data.rates.JPY,
        'GBP': 1 / data.rates.GBP
    };
    
    return validateRate(rates[currency], currency);
}

// FreeCurrencyAPI
async function getFiatFromFreeCurrency(currency) {
    const response = await fetch('https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_1234567890&base_currency=RUB');
    const data = await response.json();
    return validateRate(1 / data.data[currency], currency);
}

// CurrencyAPI
async function getFiatFromCurrencyAPI(currency) {
    const response = await fetch('https://api.currencyapi.com/v3/latest?apikey=cur_live_1234567890&base_currency=RUB');
    const data = await response.json();
    return validateRate(1 / data.data[currency]?.value, currency);
}

// FastForex
async function getFiatFromFastForex(currency) {
    const response = await fetch('https://api.fastforex.io/fetch-all?from=RUB&api_key=fast_1234567890');
    const data = await response.json();
    return validateRate(1 / data.results[currency], currency);
}

// OpenExchangeRates
async function getFiatFromOpenExchange(currency) {
    const response = await fetch('https://open.er-api.com/v6/latest/RUB');
    const data = await response.json();
    return validateRate(1 / data.rates[currency], currency);
}

// ========== КРИПТОВАЛЮТЫ ==========

// CoinGecko (основной)
async function getCryptoFromCoinGecko(currency) {
    const cryptoId = getCryptoId(currency);
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`);
    const data = await response.json();
    return validateRate(data[cryptoId]?.usd, currency);
}

// Binance
async function getCryptoFromBinance(currency) {
    const symbols = {
        'BTC': 'BTCUSDT', 'ETH': 'ETHUSDT', 'BNB': 'BNBUSDT', 
        'SOL': 'SOLUSDT', 'XRP': 'XRPUSDT', 'USDT': 'USDTUSDT'
    };
    
    if (currency === 'USDT') return 1.0;
    
    const symbol = symbols[currency];
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    const data = await response.json();
    return validateRate(parseFloat(data.price), currency);
}

// CoinCap
async function getCryptoFromCoinCap(currency) {
    const assetIds = {
        'BTC': 'bitcoin', 'ETH': 'ethereum', 'USDT': 'tether',
        'BNB': 'binance-coin', 'SOL': 'solana', 'XRP': 'ripple'
    };
    
    const assetId = assetIds[currency];
    const response = await fetch(`https://api.coincap.io/v2/assets/${assetId}`);
    const data = await response.json();
    return validateRate(parseFloat(data.data.priceUsd), currency);
}

// CryptoCompare
async function getCryptoFromCryptoCompare(currency) {
    const symbols = {
        'BTC': 'BTC', 'ETH': 'ETH', 'USDT': 'USDT',
        'BNB': 'BNB', 'SOL': 'SOL', 'XRP': 'XRP'
    };
    
    const symbol = symbols[currency];
    const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`);
    const data = await response.json();
    return validateRate(data.USD, currency);
}

// Kraken
async function getCryptoFromKraken(currency) {
    const pairs = {
        'BTC': 'XXBTZUSD', 'ETH': 'XETHZUSD', 'USDT': 'USDTZUSD',
        'BNB': 'BNBUSD', 'SOL': 'SOLUSD', 'XRP': 'XXRPZUSD'
    };
    
    const pair = pairs[currency];
    const response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${pair}`);
    const data = await response.json();
    const result = data.result[pair];
    return validateRate(parseFloat(result.c[0]), currency);
}

// Huobi
async function getCryptoFromHuobi(currency) {
    const symbols = {
        'BTC': 'btcusdt', 'ETH': 'ethusdt', 'USDT': 'usdtusdt',
        'BNB': 'bnbusdt', 'SOL': 'solusdt', 'XRP': 'xrpusdt'
    };
    
    const symbol = symbols[currency];
    const response = await fetch(`https://api.huobi.pro/market/detail/merged?symbol=${symbol}`);
    const data = await response.json();
    return validateRate(data.tick.close, currency);
}

// Bybit
async function getCryptoFromBybit(currency) {
    const symbols = {
        'BTC': 'BTCUSDT', 'ETH': 'ETHUSDT', 'USDT': 'USDTUSDT',
        'BNB': 'BNBUSDT', 'SOL': 'SOLUSDT', 'XRP': 'XRPUSDT'
    };
    
    const symbol = symbols[currency];
    const response = await fetch(`https://api.bybit.com/v2/public/tickers?symbol=${symbol}`);
    const data = await response.json();
    return validateRate(parseFloat(data.result[0].last_price), currency);
}

// Gate.io
async function getCryptoFromGateIO(currency) {
    const pairs = {
        'BTC': 'btc_usdt', 'ETH': 'eth_usdt', 'USDT': 'usdt_usdt',
        'BNB': 'bnb_usdt', 'SOL': 'sol_usdt', 'XRP': 'xrp_usdt'
    };
    
    const pair = pairs[currency];
    const response = await fetch(`https://api.gate.io/api2/1/ticker/${pair}`);
    const data = await response.json();
    return validateRate(parseFloat(data.last), currency);
}

// Bitfinex
async function getCryptoFromBitfinex(currency) {
    const symbols = {
        'BTC': 'tBTCUSD', 'ETH': 'tETHUSD', 'USDT': 'tUSTUSD',
        'BNB': 'tBNBUSD', 'SOL': 'tSOLUSD', 'XRP': 'tXRPUSD'
    };
    
    const symbol = symbols[currency];
    const response = await fetch(`https://api-pub.bitfinex.com/v2/tickers?symbols=${symbol}`);
    const data = await response.json();
    return validateRate(data[0][1], currency);
}

// Coinbase
async function getCryptoFromCoinbase(currency) {
    const products = {
        'BTC': 'BTC-USD', 'ETH': 'ETH-USD', 'USDT': 'USDT-USD',
        'BNB': 'BNB-USD', 'SOL': 'SOL-USD', 'XRP': 'XRP-USD'
    };
    
    const product = products[currency];
    const response = await fetch(`https://api.pro.coinbase.com/products/${product}/ticker`);
    const data = await response.json();
    return validateRate(parseFloat(data.price), currency);
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

// Получение ID криптовалюты
function getCryptoId(currency) {
    const ids = {
        'BTC': 'bitcoin', 'ETH': 'ethereum', 'USDT': 'tether',
        'BNB': 'binancecoin', 'SOL': 'solana', 'XRP': 'ripple'
    };
    return ids[currency];
}

// Получение фиатного курса
async function getFiatRate(currency) {
    const attempts = [
        getFiatFromCBR,
        getFiatFromExchangeRate,
        getFiatFromFreeCurrency,
        getFiatFromCurrencyAPI,
        getFiatFromFastForex,
        getFiatFromOpenExchange
    ];
    
    for (let attempt of attempts) {
        try {
            const rate = await attempt(currency);
            if (rate && rate > 0) {
                console.log(`✅ ${currency}: ${rate} (${attempt.name})`);
                return rate;
            }
        } catch (error) {
            console.warn(`❌ ${attempt.name} failed: ${error.message}`);
        }
    }
    
    console.warn(`🚨 Все API фиата упали, использую демо-курс для ${currency}`);
    return generateStableDemoRate(currency);
}

// Получение крипто-курса
async function getCryptoRate(currency) {
    const attempts = [
        getCryptoFromCoinGecko,
        getCryptoFromBinance,
        getCryptoFromCoinCap,
        getCryptoFromCryptoCompare,
        getCryptoFromKraken,
        getCryptoFromHuobi,
        getCryptoFromBybit,
        getCryptoFromGateIO,
        getCryptoFromBitfinex,
        getCryptoFromCoinbase
    ];
    
    for (let attempt of attempts) {
        try {
            const rate = await attempt(currency);
            if (rate && rate > 0) {
                console.log(`✅ ${currency}: $${rate} (${attempt.name})`);
                return rate;
            }
        } catch (error) {
            console.warn(`❌ ${attempt.name} failed: ${error.message}`);
        }
    }
    
    console.warn(`🚨 Все API крипты упали, использую демо-курс для ${currency}`);
    return generateStableDemoRate(currency);
}

// Валидация курса
function validateRate(rate, currency) {
    if (!rate || rate <= 0 || isNaN(rate)) {
        throw new Error(`Invalid rate: ${rate}`);
    }
    
    // Реальные диапазоны для 2024 года
    const reasonableRanges = {
        'USD': { min: 80, max: 120 },
        'EUR': { min: 85, max: 110 },
        'KZT': { min: 0.15, max: 0.25 },
        'CNY': { min: 10, max: 15 },
        'JPY': { min: 0.5, max: 0.7 },
        'GBP': { min: 100, max: 130 },
        'BTC': { min: 30000, max: 80000 },
        'ETH': { min: 2000, max: 5000 },
        'USDT': { min: 0.99, max: 1.01 },
        'BNB': { min: 500, max: 800 },
        'SOL': { min: 50, max: 200 },
        'XRP': { min: 0.3, max: 1.0 }
    };
    
    const range = reasonableRanges[currency];
    if (range && (rate < range.min || rate > range.max)) {
        throw new Error(`Rate out of range: ${rate} (allowed: ${range.min}-${range.max})`);
    }
    
    return rate;
}

// Актуальные демо-курсы
function generateStableDemoRate(currency) {
    const currentRates = {
        'USD': 92.5, 'EUR': 100.2, 'KZT': 0.20, 'CNY': 12.8, 'JPY': 0.62, 'GBP': 117.5,
        'BTC': 67500, 'ETH': 3800, 'USDT': 1.0, 'BNB': 585, 'SOL': 145, 'XRP': 0.58
    };
    
    const storedRate = localStorage.getItem(`lastValidRate_${currency}`);
    if (storedRate) {
        const lastRate = parseFloat(storedRate);
        const fluctuation = (Math.random() - 0.5) * 0.005;
        return lastRate * (1 + fluctuation);
    }
    
    return currentRates[currency];
}

// Получение текущего курса
async function getCurrentRate(currency) {
    const currencyInfo = CURRENCIES[currency];
    if (currencyInfo.type === 'fiat') {
        return await getFiatRate(currency);
    } else {
        return await getCryptoRate(currency);
    }
}

// Создание графика
function createChart(rates, currency) {
    const ctx = document.getElementById('exchangeChart').getContext('2d');
    
    if (exchangeChart) {
        exchangeChart.destroy();
    }

    const dates = generateDates();
    const currencyInfo = CURRENCIES[currency];
    const isCrypto = currencyInfo.type === 'crypto';

    exchangeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: `${currency}/${currencyInfo.toCurrency}`,
                data: rates,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#007bff',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0,0,0,0.1)' },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value) + (isCrypto ? '$' : '₽');
                        }
                    }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

// Вспомогательные функции
function generateDates() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short' 
        }));
    }
    return dates;
}

function formatNumber(value) {
    if (value > 1000) return value.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
    if (value > 1) return value.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
    return value.toLocaleString('ru-RU', { maximumFractionDigits: 4 });
}

// Обновление интерфейса
function updateUI(history, currencyInfo) {
    const currentRate = history[history.length - 1];
    const previousRate = history[history.length - 2] || currentRate;
    const isCrypto = currencyInfo.type === 'crypto';
    const symbol = isCrypto ? '$' : '₽';
    
    if (!currentRate || currentRate <= 0) {
        document.getElementById('currentRate').textContent = 'Ошибка данных';
        document.getElementById('rateChange').textContent = '';
        return;
    }
    
    document.getElementById('currentRate').textContent = `${formatNumber(currentRate)} ${symbol}`;
    
    const changeElement = document.getElementById('rateChange');
    const change = ((currentRate - previousRate) / previousRate * 100).toFixed(2);
    
    if (change > 0) {
        changeElement.textContent = `+${change}% ↗`;
        changeElement.className = 'rate-change positive';
    } else if (change < 0) {
        changeElement.textContent = `${change}% ↘`;
        changeElement.className = 'rate-change negative';
    } else {
        changeElement.textContent = `0% →`;
        changeElement.className = 'rate-change';
    }
    
    createChart(history, currentCurrency);
}

// Основная функция обновления
async function updateChartData() {
    try {
        const currentRate = await getCurrentRate(currentCurrency);
        const currencyInfo = CURRENCIES[currentCurrency];
        
        localStorage.setItem(`lastValidRate_${currentCurrency}`, currentRate.toString());
        
        let history = JSON.parse(localStorage.getItem(`rateHistory_${currentCurrency}`) || '[]');
        
        if (history.length === 0 || history.some(rate => !rate || rate <= 0)) {
            history = Array(7).fill().map(() => generateStableDemoRate(currentCurrency));
        }
        
        history[history.length - 1] = currentRate;
        history = history.map(rate => rate && rate > 0 ? rate : generateStableDemoRate(currentCurrency));
        
        localStorage.setItem(`rateHistory_${currentCurrency}`, JSON.stringify(history));
        
        updateUI(history, currencyInfo);
        
        document.getElementById('lastUpdate').textContent = 
            `Обновлено: ${new Date().toLocaleTimeString('ru-RU')}`;
        
    } catch (error) {
        console.error('❌ Ошибка обновления:', error);
        document.getElementById('currentRate').textContent = 'Ошибка загрузки';
        document.getElementById('rateChange').textContent = 'Попробуйте позже';
        document.getElementById('lastUpdate').textContent = 'Ошибка соединения';
    }
}

// Смена валюты
function changeCurrency() {
    const select = document.getElementById('currencySelect');
    currentCurrency = select.value;
    updateChartData();
}

// Инициализация графика
async function initializeChart() {
    await updateChartData();
    
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateChartData, 30 * 60 * 1000);
    
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) updateChartData();
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    showMenu(1);
    setTimeout(initializeChart, 1000);
});

window.addEventListener('beforeunload', function() {
    if (updateInterval) clearInterval(updateInterval);
});
