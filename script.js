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

    // Сбрасываем активность у всех кнопок
    allButtons.forEach(btn => btn.classList.remove('active'));
    allButtons[menuNumber - 1].classList.add('active');

    // Скрываем все меню
    allMenus.forEach(menu => menu.classList.remove('active'));

    // Показываем выбранное меню
    const selectedMenu = document.getElementById(`menu${menuNumber}`);
    if (selectedMenu) {
        selectedMenu.classList.add('active');

        // Запускаем анимацию для заголовка
        const title = selectedMenu.querySelector('.menu-title');
        if (title) {
            title.classList.remove('animate'); // сбрасываем анимацию
            void title.offsetWidth; // перезапускаем
            title.classList.add('animate');
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
});
