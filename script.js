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
        // Доступные домены
        const domains = ["1secmail.com", "1secmail.net", "1secmail.org"];
        
        // Случайный логин и домен
        emailLogin = randomString(10);
        emailDomain = domains[Math.floor(Math.random() * domains.length)];
        emailAddress = `${emailLogin}@${emailDomain}`;

        // Отображаем email
        document.getElementById('emailAddress').innerText = emailAddress;
        document.getElementById('emailPassword').innerText = "— (не нужен)";
        document.getElementById('emailBox').classList.remove('hidden');

        // Копирование
        document.getElementById('copyEmail').onclick = () => copyToClipboard(emailAddress, document.getElementById('copyEmail'));
        document.getElementById('copyPass').onclick = () => copyToClipboard("пароль не требуется", document.getElementById('copyPass'));

        // Загружаем письма каждые 5 секунд
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

    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '<p>⏳ Загружаю письма...</p>';

    try {
        // Список писем
        const res = await fetch(`${API_URL}?action=getMessages&login=${emailLogin}&domain=${emailDomain}`);
        if (!res.ok) throw new Error("Ошибка при получении писем");

        let data;
        try {
            data = await res.json();
        } catch {
            messagesDiv.innerHTML = '<p>📭 Нет новых писем.</p>';
            return;
        }

        if (!data || data.length === 0) {
            messagesDiv.innerHTML = '<p>📭 Нет новых писем.</p>';
            return;
        }

        // Очистка списка
        messagesDiv.innerHTML = '';

        // Загружаем каждое письмо
        for (let msg of data.reverse()) {
            try {
                const mailRes = await fetch(`${API_URL}?action=readMessage&login=${emailLogin}&domain=${emailDomain}&id=${msg.id}`);
                if (!mailRes.ok) continue;

                const mailData = await mailRes.json();

                const div = document.createElement('div');
                div.className = 'message';
                div.innerHTML = `
                    <h4>${mailData.subject || 'Без темы'}</h4>
                    <p><strong>📤 От:</strong> ${mailData.from || 'Аноним'}</p>
                    <p><strong>📅 Дата:</strong> ${mailData.date || ''}</p>
                    <p><strong>📝 Текст:</strong> ${mailData.textBody 
                        ? mailData.textBody.substring(0, 150) + (mailData.textBody.length > 150 ? '...' : '') 
                        : 'Нет текста'}</p>
                `;
                messagesDiv.appendChild(div);
            } catch (e) {
                console.warn("Ошибка при разборе письма:", e);
            }
        }

    } catch (err) {
        console.error('Ошибка загрузки писем:', err);
        messagesDiv.innerHTML = '<p>⚠️ Ошибка загрузки писем</p>';
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateBtn').addEventListener('click', createAccount);
});
