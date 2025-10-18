// Минимальная инициализация
console.log('RapidGo app started');

// Инициализация Telegram Web App
if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    console.log('Telegram Web App initialized');
}
