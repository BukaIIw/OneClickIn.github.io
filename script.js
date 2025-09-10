const API_URL = 'https://www.1secmail.com/api/v1/';
let emailLogin = '';
let emailDomain = '';
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

// Создание email
async function createAccount() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = true;
    generateBtn.innerText = 'Создаём...';

    try {
        // 1. Доступные домены
        const domains = ["1secmail.com", "1secmail.net", "1secmail.org"];
        
        // 2. Генерация логина и домена
        emailLogin = randomString(10);
        emailDomain = domains[Math.floor(Math.random() * domains.length)];
        emailAddress = `${emailLogin}@${emailDomain}`;

        // 3. Отображаем email
        document.getElementById('emailAddress').innerText = emailAddress;
        document.getElementById('emailPassword').innerText = "— (не нужен)";
        document.getElementById('emailBox').classList.remove('hidden');

        // 4. Копирование
        document.getElementById('copyEmail').onclick = () => copyToClipboard(emailAddress, document.getElementById('copyEmail'));
        document.getElementById('copyPass').onclick = () => copyToClipboard("нет пароля", document.getElementById('copyPass'));

        // 5. Загружаем письма
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
    if (!emailLogin || !emailDomain) return;

    try {
        // Список писем
        const res = await fetch(`${API_URL}?action=getMessages&login=${emailLogin}&domain=${emailDomain}`);
        const data = await res.json();
        const messagesDiv = document.getElementById('messages');

        if (!data || data.length === 0) {
            messagesDiv.innerHTML = '<p>📭 Нет новых писем.</p>';
            return;
        }

        messagesDiv.innerHTML = '';
        for (let msg of data.reverse()) {
            // Загружаем полное письмо
            const mailRes = await fetch(`${API_URL}?action=readMessage&login=${emailLogin}&domain=${emailDomain}&id=${msg.id}`);
            const mailData = await mailRes.json();

            const div = document.createElement('div');
            div.className = 'message';
            div.innerHTML = `
                <h4>${mailData.subject || 'Без темы'}</h4>
                <p><strong>📤 От:</strong> ${mailData.from || 'Аноним'}</p>
                <p><strong>📅 Дата:</strong> ${mailData.date}</p>
                <p><strong>📝 Текст:</strong> ${mailData.textBody ? mailData.textBody.substring(0, 150) + (mailData.textBody.length > 150 ? '...' : '') : 'Нет текста'}</p>
            `;
            messagesDiv.appendChild(div);
        }

    } catch (err) {
        console.error('Ошибка загрузки писем:', err);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateBtn').addEventListener('click', createAccount);
});
