document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';
    if (!username || !password) {
        messageDiv.textContent = 'Заполните все поля.';
        messageDiv.className = 'message error';
        return;
    }
    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('jwtToken', data.token);
            localStorage.setItem('username', username);  // <-- добавить
            messageDiv.textContent = '✅ Вход выполнен! Перенаправление...';
            messageDiv.className = 'message success';
            setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
            const errorText = await response.text();
            messageDiv.textContent = '❌ ' + errorText;
            messageDiv.className = 'message error';
        }
    } catch (e) {
        messageDiv.textContent = '❌ Ошибка сервера';
        messageDiv.className = 'message error';
        console.error(e);
    }
});