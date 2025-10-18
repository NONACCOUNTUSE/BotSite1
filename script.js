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
            
            // Обновляем имя пользователя (только реальное имя)
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
    // Скрываем все меню
    const allMenus = document.querySelectorAll('.menu-content');
    allMenus.forEach(menu => menu.classList.remove('active'));
    
    // Убираем активный класс со всех кнопок
    const allButtons = document.querySelectorAll('.nav-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    // Показываем выбранное меню
    const selectedMenu = document.getElementById(`menu${menuNumber}`);
    if (selectedMenu) {
        selectedMenu.classList.add('active');
    }
    
    // Активируем выбранную кнопку
    const selectedButton = document.querySelectorAll('.nav-btn')[menuNumber - 1];
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}

// Запускаем при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    // По умолчанию открываем первую кнопку
    showMenu(1);
});
