document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Отменяем стандартную отправку формы

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const messageDiv = document.getElementById('message');
    messageDiv.textContent = ''; // очищаем сообщение

    // Простая валидация на клиенте
    if (!username || !email || !password) {
        messageDiv.textContent = 'Пожалуйста, заполните все поля.';
        messageDiv.className = 'message error';
        return;
    }
    if (password.length < 6) {
        messageDiv.textContent = 'Пароль должен содержать минимум 6 символов.';
        messageDiv.className = 'message error';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const responseText = await response.text(); // сервер возвращает строку или JSON

        if (response.ok) {
            // Успешная регистрация
            messageDiv.textContent = '✅ Регистрация успешна! Перенаправление...';
            messageDiv.className = 'message success';
            // Через 2 секунды перенаправляем на главную страницу
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            // Ошибка (например, пользователь уже существует)
            messageDiv.textContent = '❌ ' + responseText;
            messageDiv.className = 'message error';
        }
    } catch (error) {
        messageDiv.textContent = '❌ Ошибка сервера. Попробуйте позже.';
        messageDiv.className = 'message error';
        console.error('Registration error:', error);
    }
});