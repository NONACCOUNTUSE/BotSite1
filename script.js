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
            
            // Обновляем ID
            const userId = user.username ? `@${user.username}` : `ID: ${user.id}`;
            document.getElementById('userId').textContent = userId;
        }
        
        console.log('Telegram Web App initialized with user:', user);
    } else {
        console.log('Telegram Web App not available');
    }
}

// Запускаем при загрузке
document.addEventListener('DOMContentLoaded', initializeApp);
