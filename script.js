const API_URL = 'https://api.mail.tm';

let authToken = '';
let emailAddress = '';

// Генерация случайной строки
function randomString(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}

// Копирование в буфер
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerText;
        btn.innerText = '✅';
        setTimeout(() => btn.innerText = original, 1500);
    });
}

// Создание аккаунта
async function createAccount() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = true;
    generateBtn.innerText = 'Создаём...';

    try {
        // 1. Получаем доступные домены
        const domainsRes = await fetch(`${API_URL}/domains`);
        if (!domainsRes.ok) throw new Error('Не удалось получить домены');

        const domains = await domainsRes.json();
        const domain = domains['hydra:member'][0].domain;

        // 2. Генерируем данные
        const localPart = randomString(10);
        const password = randomString(12);
        const fullEmail = `${localPart}@${domain}`;

        // 3. Создаём аккаунт
        const accountRes = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address: fullEmail,
                password: password
            })
        });

        if (!accountRes.ok) {
            const err = await accountRes.json();
            throw new Error(err.message || 'Ошибка создания аккаунта');
        }

        // 4. Получаем токен
        const tokenRes = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address: fullEmail,
                password: password
            })
        });

        const tokenData = await tokenRes.json();
        authToken = tokenData.token;
        emailAddress = fullEmail;

        // 5. Отображаем данные
        document.getElementById('emailAddress').innerText = fullEmail;
        document.getElementById('emailPassword').innerText = password;
        document.getElementById('emailBox').classList.remove('hidden');

        // 6. Вешаем обработчики копирования
        document.getElementById('copyEmail').onclick = () => copyToClipboard(fullEmail, document.getElementById('copyEmail'));
        document.getElementById('copyPass').onclick = () => copyToClipboard(password, document.getElementById('copyPass'));

        // 7. Загружаем письма
        loadMessages();
        setInterval(loadMessages, 5000);

    } catch (err) {
        alert('❌ Ошибка: ' + err.message);
        console.error(err);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerText = 'Создать новую почту';
    }
}

// Загрузка писем
async function loadMessages() {
    if (!authToken) return;

    try {
        const res = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) throw new Error('Не удалось загрузить письма');

        const data = await res.json();
        const messagesDiv = document.getElementById('messages');

        if (!data['hydra:member'] || data['hydra:member'].length === 0) {
            messagesDiv.innerHTML = '<p>📭 Нет новых писем.</p>';
            return;
        }

        messagesDiv.innerHTML = '';
        data['hydra:member'].reverse().forEach(msg => {
            const div = document.createElement('div');
            div.className = 'message';
            const date = new Date(msg.createdAt).toLocaleString('ru-RU');
            div.innerHTML = `
                <h4>${msg.subject || 'Без темы'}</h4>
                <p><strong>📤 От:</strong> ${msg.from?.address || 'Аноним'}</p>
                <p><strong>📅 Дата:</strong> ${date}</p>
                <p><strong>📝 Текст:</strong> ${msg.intro ? msg.intro.substring(0, 150) + (msg.intro.length > 150 ? '...' : '') : 'Нет текста'}</p>
            `;
            messagesDiv.appendChild(div);
        });

    } catch (err) {
        console.error('Ошибка загрузки писем:', err);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateBtn').addEventListener('click', createAccount);
});
