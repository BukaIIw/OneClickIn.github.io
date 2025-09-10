const API_URL = 'https://api.minmail.app/mailbox';
let mailboxId = '';
let emailAddress = '';
let expiresAt = '';

// Копирование текста
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    let original = btn.innerText;
    btn.innerText = "✅";
    setTimeout(() => btn.innerText = original, 1500);
  });
}

// Создание ящика
async function createMailbox() {
  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.innerText = "Создаём...";

  try {
    let res = await fetch(API_URL, { method: 'POST' });
    if (!res.ok) throw new Error("Ошибка API");
    let data = await res.json();

    mailboxId = data.id;
    emailAddress = data.email;
    expiresAt = data.expiresAt;

    document.getElementById('emailAddress').innerText = emailAddress;
    document.getElementById('expiresAt').innerText =
      new Date(expiresAt).toLocaleString('ru-RU');
    document.getElementById('emailBox').classList.remove('hidden');

    // Кнопка копирования
    document.getElementById('copyEmail').onclick =
      () => copyToClipboard(emailAddress, document.getElementById('copyEmail'));

    // Загружаем письма
    loadMessages();
    setInterval(loadMessages, 5000);

  } catch (err) {
    alert("❌ " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerText = "Создать новую почту";
  }
}

// Загрузка писем
async function loadMessages() {
  if (!mailboxId) return;
  const box = document.getElementById('messages');
  box.innerHTML = "⏳ Проверка...";

  try {
    let res = await fetch(`${API_URL}/${mailboxId}/messages`);
    if (!res.ok) {
      box.innerHTML = "<p>⚠️ Не удалось загрузить письма</p>";
      return;
    }

    let list = await res.json();
    if (!Array.isArray(list) || list.length === 0) {
      box.innerHTML = "<p>📭 Нет новых писем</p>";
      return;
    }

    box.innerHTML = "";
    for (let msg of list.reverse()) {
      let div = document.createElement('div');
      div.className = "message";
      div.innerHTML = `
        <h4>${msg.subject || "Без темы"}</h4>
        <p><b>📤 От:</b> ${msg.from || "Аноним"}</p>
        <p><b>📅:</b> ${msg.date || ""}</p>
        <p><b>📝:</b> ${msg.intro || ""}</p>
      `;
      box.appendChild(div);
    }

  } catch (err) {
    box.innerHTML = "<p>⚠️ Ошибка соединения с API</p>";
    console.error(err);
  }
}

// Запуск только после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('generateBtn').addEventListener('click', createMailbox);
});
