// ===== APP STATE =====
let appState = {
    balance: 0,
    transactions: [],
    appInitialized: false,
    telegramWebApp: null
};

// ===== DOM ELEMENTS =====
const elements = {
    balance: null,
    testResult: null,
    statusText: null,
    transactionsList: null,
    notifications: null
};

// ===== INITIALIZATION =====
function initializeApp() {
    console.log('🚀 Инициализация RapidGo App...');
    
    // Инициализация элементов DOM
    initializeDOMElements();
    
    // Загрузка данных из localStorage
    loadSavedData();
    
    // Инициализация Telegram Web App
    initializeTelegramWebApp();
    
    // Проверка загрузки ресурсов
    checkResourcesLoaded();
    
    // Обновление интерфейса
    updateUI();
    
    console.log('✅ RapidGo App инициализирован');
}

function initializeDOMElements() {
    elements.balance = document.getElementById('balance');
    elements.testResult = document.getElementById('testResult');
    elements.statusText = document.getElementById('statusText');
    elements.transactionsList = document.getElementById('transactionsList');
    elements.notifications = document.getElementById('notifications');
    
    console.log('📄 DOM элементы инициализированы');
}

function initializeTelegramWebApp() {
    if (window.Telegram && Telegram.WebApp) {
        appState.telegramWebApp = Telegram.WebApp;
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        
        console.log('📱 Telegram Web App инициализирован');
        showNotification('Telegram Web App подключен', 'success');
    } else {
        console.log('🌐 Режим браузера');
        showNotification('Режим тестирования в браузере', 'warning');
    }
}

// ===== RESOURCE CHECKING =====
function checkResourcesLoaded() {
    const isCssLoaded = document.styleSheets && document.styleSheets.length > 0;
    const isJsLoaded = typeof appState !== 'undefined';
    
    if (isCssLoaded && isJsLoaded) {
        appState.appInitialized = true;
        setStatus('✅ Приложение готово к работе', 'success');
        
        // Добавляем интерактивные стили
        addInteractiveStyles();
        
    } else {
        setStatus('❌ Ошибка загрузки ресурсов', 'error');
    }
}

function checkResources() {
    const cssStatus = document.styleSheets && document.styleSheets.length > 0 ? '✅' : '❌';
    const jsStatus = typeof appState !== 'undefined' ? '✅' : '❌';
    
    showTestResult(`
        <div style="line-height: 1.8;">
            <p><strong>Проверка ресурсов:</strong></p>
            <p>${cssStatus} CSS стили загружены</p>
            <p>${jsStatus} JavaScript загружен</p>
            <p>✅ DOM элементы инициализированы</p>
            <p>${appState.telegramWebApp ? '✅' : '⚠️'} Telegram Web App</p>
        </div>
    `, 'success');
}

// ===== WALLET FUNCTIONS =====
function addTokens(amount = 100) {
    if (!appState.appInitialized) {
        showNotification('Приложение еще не инициализировано', 'error');
        return;
    }
    
    const oldBalance = appState.balance;
    appState.balance += amount;
    
    // Добавляем транзакцию
    addTransaction('Пополнение', amount, 'in');
    
    // Обновляем UI
    updateBalance();
    updateTransactions();
    
    // Анимация
    animateBalanceChange(oldBalance, appState.balance);
    
    showNotification(`+${amount} RGP зачислено!`, 'success');
    saveData();
}

function sendTokens() {
    if (appState.balance <= 0) {
        showNotification('Недостаточно средств', 'error');
        return;
    }
    
    const amount = 50; // Тестовое значение
    if (appState.balance >= amount) {
        const oldBalance = appState.balance;
        appState.balance -= amount;
        
        addTransaction('Перевод', amount, 'out');
        updateBalance();
        animateBalanceChange(oldBalance, appState.balance);
        
        showNotification(`-${amount} RGP отправлено`, 'success');
        saveData();
    } else {
        showNotification('Недостаточно средств', 'error');
    }
}

function withdrawTokens() {
    if (appState.balance <= 0) {
        showNotification('Недостаточно средств для вывода', 'error');
        return;
    }
    
    const amount = Math.min(appState.balance, 25); // Тестовое значение
    const oldBalance = appState.balance;
    appState.balance -= amount;
    
    addTransaction('Вывод', amount, 'out');
    updateBalance();
    animateBalanceChange(oldBalance, appState.balance);
    
    showNotification(`-${amount} RGP выведено`, 'success');
    saveData();
}

// ===== TEST FUNCTIONS =====
function testFunction() {
    if (!appState.appInitialized) {
        showTestResult('❌ Приложение не инициализировано', 'error');
        return;
    }
    
    // Тестируем различные функции
    const tests = [
        { name: 'Состояние приложения', result: appState.appInitialized },
        { name: 'Баланс', result: typeof appState.balance === 'number' },
        { name: 'Транзакции', result: Array.isArray(appState.transactions) },
        { name: 'DOM элементы', result: elements.balance !== null },
        { name: 'Стили CSS', result: document.styleSheets.length > 0 }
    ];
    
    const passedTests = tests.filter(test => test.result).length;
    const totalTests = tests.length;
    
    const testResults = tests.map(test => 
        `${test.result ? '✅' : '❌'} ${test.name}`
    ).join('<br>');
    
    showTestResult(`
        <strong>Результаты тестирования:</strong><br>
        ${testResults}<br><br>
        <strong>Итог:</strong> ${passedTests}/${totalTests} тестов пройдено
    `, passedTests === totalTests ? 'success' : 'warning');
}

function showTestResult(message, type = 'info') {
    if (!elements.testResult) return;
    
    elements.testResult.innerHTML = message;
    elements.testResult.style.color = type === 'success' ? '#155724' : 
                                    type === 'error' ? '#721c24' : 
                                    type === 'warning' ? '#856404' : '#004085';
    elements.testResult.style.background = type === 'success' ? '#d4edda' : 
                                         type === 'error' ? '#f8d7da' : 
                                         type === 'warning' ? '#fff3cd' : '#cce5ff';
    elements.testResult.style.border = type === 'success' ? '1px solid #c3e6cb' : 
                                     type === 'error' ? '1px solid #f5c6cb' : 
                                     type === 'warning' ? '1px solid #ffeaa7' : '1px solid #b8daff';
}

// ===== UI UPDATES =====
function updateUI() {
    updateBalance();
    updateTransactions();
    updateStatus();
}

function updateBalance() {
    if (elements.balance) {
        elements.balance.textContent = appState.balance;
        
        // Анимация при изменении баланса
        elements.balance.classList.add('pulse');
        setTimeout(() => {
            elements.balance.classList.remove('pulse');
        }, 500);
    }
}

function updateTransactions() {
    if (!elements.transactionsList) return;
    
    if (appState.transactions.length === 0) {
        elements.transactionsList.innerHTML = '<p class="no-transactions">Операций пока нет</p>';
        return;
    }
    
    const transactionsHtml = appState.transactions
        .slice(-5) // Последние 5 транзакций
        .reverse()
        .map(transaction => `
            <div class="transaction-item">
                <span class="transaction-type ${transaction.type === 'in' ? 'transaction-in' : 'transaction-out'}">
                    ${transaction.type === 'in' ? '⬇️ ПОПОЛНЕНИЕ' : '⬆️ СПИСАНИЕ'}
                </span>
                <span class="transaction-amount ${transaction.type === 'in' ? 'text-success' : 'text-danger'}">
                    ${transaction.type === 'in' ? '+' : '-'}${transaction.amount} RGP
                </span>
                <span class="transaction-date">${transaction.date}</span>
            </div>
        `).join('');
    
    elements.transactionsList.innerHTML = transactionsHtml;
}

function updateStatus() {
    if (!elements.statusText) return;
    
    const status = appState.appInitialized ? '✅ Приложение активно' : '❌ Ошибка инициализации';
    const type = appState.appInitialized ? 'success' : 'error';
    
    setStatus(status, type);
}

function setStatus(message, type = 'info') {
    if (!elements.statusText) return;
    
    elements.statusText.textContent = message;
    elements.statusText.className = `status ${type}`;
}

// ===== ANIMATIONS =====
function animateBalanceChange(oldBalance, newBalance) {
    if (!elements.balance) return;
    
    const balanceElement = elements.balance;
    
    // Анимация изменения
    balanceElement.style.transition = 'all 0.3s ease';
    balanceElement.style.transform = 'scale(1.2)';
    balanceElement.style.color = newBalance > oldBalance ? '#28a745' : '#dc3545';
    
    setTimeout(() => {
        balanceElement.style.transform = 'scale(1)';
        
        setTimeout(() => {
            balanceElement.style.color = '#007bff';
        }, 1000);
    }, 300);
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    if (!elements.notifications) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: between;">
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; font-size: 16px; cursor: pointer; margin-left: 10px;">
                ✕
            </button>
        </div>
    `;
    
    elements.notifications.appendChild(notification);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ===== DATA MANAGEMENT =====
function addTransaction(description, amount, type) {
    const transaction = {
        id: Date.now(),
        description,
        amount,
        type,
        date: new Date().toLocaleTimeString()
    };
    
    appState.transactions.push(transaction);
}

function saveData() {
    try {
        localStorage.setItem('rapidgo_balance', appState.balance.toString());
        localStorage.setItem('rapidgo_transactions', JSON.stringify(appState.transactions));
    } catch (e) {
        console.error('❌ Ошибка сохранения данных:', e);
    }
}

function loadSavedData() {
    try {
        const savedBalance = localStorage.getItem('rapidgo_balance');
        const savedTransactions = localStorage.getItem('rapidgo_transactions');
        
        if (savedBalance) {
            appState.balance = parseInt(savedBalance) || 0;
        }
        
        if (savedTransactions) {
            appState.transactions = JSON.parse(savedTransactions) || [];
        }
        
        console.log('💾 Данные загружены из localStorage');
    } catch (e) {
        console.error('❌ Ошибка загрузки данных:', e);
    }
}

// ===== ADDITIONAL STYLES =====
function addInteractiveStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .text-success { color: #28a745 !important; }
        .text-danger { color: #dc3545 !important; }
        .text-warning { color: #ffc107 !important; }
        
        .transaction-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            margin-bottom: 8px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #007bff;
            transition: all 0.3s ease;
        }
        
        .transaction-item:hover {
            transform: translateX(5px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .transaction-date {
            font-size: 0.8rem;
            color: #6c757d;
        }
    `;
    document.head.appendChild(style);
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM полностью загружен');
    initializeApp();
});

// Глобальное пространство имен для кнопок
window.addTokens = addTokens;
window.sendTokens = sendTokens;
window.withdrawTokens = withdrawTokens;
window.testFunction = testFunction;
window.checkResources = checkResources;

console.log('📜 RapidGo App скрипт загружен');