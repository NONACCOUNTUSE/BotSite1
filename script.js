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
    const allMenus = document.querySelectorAll('.menu-content');
    const allButtons = document.querySelectorAll('.nav-btn');
    
    // Убираем активность у всех кнопок
    allButtons.forEach(btn => btn.classList.remove('active'));
    allButtons[menuNumber - 1].classList.add('active');
    
    // Скрываем все тексты и сбрасываем анимации
    allMenus.forEach(menu => {
        menu.classList.remove('animate');
        menu.style.opacity = 0;
        menu.style.transform = 'translateY(100%)';
    });

    // Показываем выбранное меню с анимацией
    const selectedMenu = document.getElementById(`menu${menuNumber}`);
    if (selectedMenu) {
        selectedMenu.classList.add('animate');
    }
}

// Запускаем при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    // По умолчанию открываем первую кнопку
    showMenu(1);
});

