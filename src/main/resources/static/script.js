// ---------- Состояние приложения ----------
const state = {
    mode: 'general', // 'general' | 'targeted'
    targetLetter: 'a',
    isActive: false,
    text: '',
    currentPos: 0,
    errors: 0,
    totalChars: 0,
    startTime: null,
    timerInterval: null,
    cpm: 0,
    letterErrors: {}, // для целевого режима
    statsSent: false,
};

// DOM-элементы
const targetText = document.getElementById('targetText');
const inputField = document.getElementById('inputField');
const cpmSpan = document.getElementById('cpm');
const errorsSpan = document.getElementById('errors');
const accuracySpan = document.getElementById('accuracy');
const timerSpan = document.getElementById('timer');
const letterErrorsContainer = document.getElementById('letterErrorsContainer');
const letterErrorsDiv = document.getElementById('letterErrors');
const resultContainer = document.getElementById('resultContainer');
const resultStats = document.getElementById('resultStats');
const resetBtn = document.getElementById('resetBtn');

// Кнопки
const generalModeBtn = document.getElementById('generalModeBtn');
const targetedModeBtn = document.getElementById('targetedModeBtn');
const startGeneralBtn = document.getElementById('startGeneralBtn');
const startBtn = document.getElementById('startBtn');
const targetLetterInput = document.getElementById('targetLetter');

// ---------- Вспомогательные функции ----------
function getMode() {
    return state.mode;
}

function setMode(mode) {
    state.mode = mode;
    if (mode === 'general') {
        generalModeBtn.classList.add('active');
        targetedModeBtn.classList.remove('active');
        document.getElementById('targetLetterContainer').style.display = 'none';
        document.getElementById('generalStartContainer').style.display = 'flex';
        targetText.textContent = 'Нажмите "Начать общую тренировку"';
    } else {
        targetedModeBtn.classList.add('active');
        generalModeBtn.classList.remove('active');
        document.getElementById('targetLetterContainer').style.display = 'flex';
        document.getElementById('generalStartContainer').style.display = 'none';
        targetText.textContent = 'Укажите букву и нажмите "Начать"';
    }
    resetTraining();
}

function resetTraining() {
    state.isActive = false;
    state.currentPos = 0;
    state.errors = 0;
    state.totalChars = 0;
    state.startTime = null;
    state.letterErrors = {};
    state.statsSent = false;
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
    inputField.disabled = true;
    inputField.value = '';
    inputField.style.borderColor = '#bdc3c7';
    cpmSpan.textContent = '0';
    errorsSpan.textContent = '0';
    accuracySpan.textContent = '100';
    timerSpan.textContent = '0';
    letterErrorsDiv.innerHTML = '';
    letterErrorsContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    // Сброс подсветки текста, если есть
    if (state.text) {
        // перерисовываем текст без подсветки
        renderText(state.text, 0);
    }
}


// Обновление статистики на экране
function updateStats() {
    const elapsed = state.startTime ? (Date.now() - state.startTime) / 1000 : 0;
    const minutes = elapsed / 60;
    const typed = state.currentPos;
    const cpm = minutes > 0 ? Math.round(typed / minutes) : 0;
    const accuracy = typed > 0 ? Math.round(((typed - state.errors) / typed) * 100) : 100;

    cpmSpan.textContent = cpm;
    errorsSpan.textContent = state.errors;
    accuracySpan.textContent = accuracy;
    timerSpan.textContent = Math.round(elapsed);
}

// Отправка статистики на сервер (опционально)
async function sendStatsToServer(stats) {
    try {
        const response = await apiFetch('http://localhost:8080/api/stats/save', {
            method: 'POST',
            body: JSON.stringify(stats)
        });
        if (!response.ok) {
            console.error('Ошибка отправки статистики');
        } else {
            console.log('Статистика сохранена');
        }
    } catch (e) {
        console.error('Ошибка отправки:', e);
    }
}

// Завершение тренировки
function finishTraining() {
    if (!state.isActive) return;
    state.isActive = false;
    inputField.disabled = true;
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
    // Показать результаты
    const elapsed = (Date.now() - state.startTime) / 1000;
    const minutes = elapsed / 60;
    const typed = state.currentPos;
    const cpm = minutes > 0 ? Math.round(typed / minutes) : 0;
    const accuracy = typed > 0 ? Math.round(((typed - state.errors) / typed) * 100) : 100;

    resultStats.innerHTML = `
        <p>Скорость: ${cpm} зн/мин</p>
        <p>Ошибки: ${state.errors}</p>
        <p>Точность: ${accuracy}%</p>
        <p>Время: ${Math.round(elapsed)} сек</p>
        <p>Всего символов: ${typed}</p>
    `;
    resultContainer.style.display = 'block';

    // Если целевой режим, показать ошибки по буквам
    if (state.mode === 'targeted' && Object.keys(state.letterErrors).length > 0) {
        letterErrorsContainer.style.display = 'block';
        let html = '';
        for (const [letter, count] of Object.entries(state.letterErrors)) {
            html += `<span>${letter}: ${count}</span>`;
        }
        letterErrorsDiv.innerHTML = html;
    }

    // Отправить статистику на сервер (если нужно)
    if (!state.statsSent) {
        const stats = {
            totalChars: typed,
            errors: state.errors,
            durationSeconds: Math.round(elapsed),
            speedCpm: cpm,
            accuracy: accuracy,
            mode: state.mode,
            targetLetter: state.mode === 'targeted' ? state.targetLetter : null
        };
        sendStatsToServer(stats);
        state.statsSent = true;
    }
}

// ---------- Функции загрузки текста ----------
async function loadText(mode, targetLetter) {
    try {
        const payload = { mode: mode.toUpperCase() };
        if (mode === 'targeted' && targetLetter) {
            payload.targetLetter = targetLetter;
        }
        const response = await apiFetch('http://localhost:8080/api/text/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwtToken');
            window.location.href = 'login.html';
            return;
        }
        if (!response.ok) {
            throw new Error('Ошибка загрузки текста');
        }
        const data = await response.json();
        state.text = data.text;
        state.mode = data.mode.toLowerCase();
        if (data.targetLetter) {
            state.targetLetter = data.targetLetter;
        }
        renderText(state.text, '',0);
        inputField.disabled = false;
        inputField.focus();
        state.currentPos = 0;
        state.errors = 0;
        state.totalChars = 0;
        state.startTime = Date.now();
        state.isActive = true;
        state.letterErrors = {};
        state.statsSent = false;
        // Таймер
        if (state.timerInterval) clearInterval(state.timerInterval);
        state.timerInterval = setInterval(() => {
            updateStats();
        }, 500);
        updateStats();
        // Скрыть старые результаты
        resultContainer.style.display = 'none';
        letterErrorsContainer.style.display = 'none';
        inputField.value = '';
        inputField.style.borderColor = '#2ecc71';
    } catch (error) {
        alert('Не удалось загрузить текст: ' + error.message);
    }
}

async function loadBestResult() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return;
    try {
        const response = await apiFetch('http://localhost:8080/api/stats/best', {
            method: 'GET'
        });
        if (response.ok) {
            const data = await response.json();
            if (data.speedCpm !== undefined) {
                document.getElementById('bestSpeed').textContent = data.speedCpm;
                document.getElementById('bestAccuracy').textContent = data.accuracy;
                document.getElementById('bestDate').textContent = new Date(data.date).toLocaleString();
                document.getElementById('bestResultContainer').style.display = 'block';
            } else {
                document.getElementById('bestResultContainer').style.display = 'none';
            }
        }
    } catch (e) {
        console.error('Ошибка загрузки лучшего результата:', e);
    }
}

// ---------- Обработка ввода ----------
inputField.addEventListener('input', function(e) {
    if (!state.isActive || !state.text) return;

    const typed = this.value;
    const currentChar = state.text[state.currentPos];
    const expected = currentChar;

    if (typed.length > state.currentPos) {
        // Пользователь ввел новый символ
        const newChar = typed[typed.length - 1];
        state.totalChars++;
        if (newChar !== expected) {
            state.errors++;
            // Запоминаем ошибку для буквы (для целевого режима)
            if (state.mode === 'targeted') {
                const letter = expected.toLowerCase();
                state.letterErrors[letter] = (state.letterErrors[letter] || 0) + 1;
            }
        }
        state.currentPos++;

        // Вместо renderTextWithErrors(...)
        renderText(state.text, this.value, this.value.length);

        // Обновить статистику
        updateStats();

        // Проверить, закончился ли текст
        if (state.currentPos === state.text.length) {
            finishTraining();
        }
    } else if (typed.length < state.currentPos) {
        // Пользователь удалил символ - можно разрешить, но для простоты не будем менять статистику
        // просто синхронизируем курсор
        state.currentPos = typed.length;
        renderTextWithErrors(state.text, state.currentPos, state.mode === 'targeted' ? state.letterErrors : null);
    }
});

// ---------- Отображение текста с подсветкой ошибок ----------
function renderText(text, typed, pos) {
    if (!text) {
        targetText.textContent = 'Текст не загружен';
        return;
    }
    let html = '';
    const typedLen = typed.length;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        let cls = '';
        if (i < typedLen) {
            // Символ уже введён
            const typedChar = typed[i];
            if (typedChar === char) {
                cls = 'correct';
            } else {
                cls = 'incorrect';
            }
        } else if (i === typedLen) {
            // Текущая позиция курсора
            cls = 'current';
        }
        // Пробелы отображаем как &nbsp; для сохранения разметки
        const displayChar = char === ' ' ? '&nbsp;' : char;
        html += `<span class="${cls}">${displayChar}</span>`;
    }
    targetText.innerHTML = html;
}

function apiFetch(url, options = {}) {
    const token = localStorage.getItem('jwtToken');
    const headers = options.headers || {};
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    headers['Content-Type'] = 'application/json';
    return fetch(url, {
        ...options,
        headers: headers
    });
}

// ---------- Обработчики кнопок ----------
generalModeBtn.addEventListener('click', () => {
    setMode('general');
});

targetedModeBtn.addEventListener('click', () => {
    setMode('targeted');
});

startGeneralBtn.addEventListener('click', () => {
    if (state.mode !== 'general') setMode('general');
    loadText('general', null);
});

startBtn.addEventListener('click', () => {
    const letter = targetLetterInput.value.trim().toLowerCase();
    if (!letter || letter.length !== 1 || !letter.match(/[a-z]/)) {
        alert('Пожалуйста, введите одну английскую букву');
        return;
    }
    state.targetLetter = letter;
    loadText('targeted', letter);
});

resetBtn.addEventListener('click', () => {
    resetTraining();
    if (state.mode === 'general') {
        targetText.textContent = 'Нажмите "Начать общую тренировку"';
    } else {
        targetText.textContent = 'Укажите букву и нажмите "Начать"';
    }
});

// Обработка Enter для завершения (если пользователь не допечатал)
inputField.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && state.isActive) {
        e.preventDefault();
        finishTraining();
    }
});

window.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username'); // <-- читаем имя

    if (token && username) {
        document.getElementById('authLinks').style.display = 'none';
        document.getElementById('userPanel').style.display = 'flex';
        document.getElementById('usernameDisplay').textContent = username;
        loadBestResult(); // <-- добавить
    } else {
        document.getElementById('authLinks').style.display = 'block';
        document.getElementById('userPanel').style.display = 'none';
    }


});

// Выход
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username'); // <-- удаляем и имя
    window.location.href = 'login.html';
});

// Инициализация
setMode('general');