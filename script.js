const API_URL = "https://www.1secmail.com/api/v1/";
let emailLogin = "";
let emailDomain = "";
let emailAddress = "";

// Генерация случайной строки
function randomString(len = 8) {
  return Math.random().toString(36).substring(2, 2 + len);
}

// Копирование в буфер
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    let original = btn.innerText;
    btn.innerText = "✅";
    setTimeout(() => (btn.innerText = original), 1500);
  });
}

// Создание email
function createAccount() {
  const domains = ["1secmail.com", "1secmail.org", "1secmail.net"];
  emailLogin = randomString(10);
  emailDomain = domains[Math.floor(Math.random() * domains.length)];
  emailAddress = `${emailLogin}@${emailDomain}`;

  document.getElementById("emailAddress").innerText = emailAddress;
  document.getElementById("emailBox").classList.remove("hidden");

  document.getElementById("copyEmail").onclick = () =>
    copyToClipboard(emailAddress, document.getElementById("copyEmail"));

  loadMessages();
  setInterval(loadMessages, 5000);
}

// Загрузка списка писем
async function loadMessages() {
  if (!emailLogin || !emailDomain) return;
  const box = document.getElementById("messages");
  box.innerHTML = "⏳ Проверка...";

  try {
    const res = await fetch(
      `${API_URL}?action=getMessages&login=${emailLogin}&domain=${emailDomain}`
    );
    if (!res.ok) throw new Error("Ошибка сети");
    const data = await res.json();

    if (!data || data.length === 0) {
      box.innerHTML = "<p>📭 Нет писем</p>";
      return;
    }

    box.innerHTML = "";
    for (let msg of data.reverse()) {
      // Загружаем тело письма
      const mailRes = await fetch(
        `${API_URL}?action=readMessage&login=${emailLogin}&domain=${emailDomain}&id=${msg.id}`
      );
      const mail = await mailRes.json();

      const div = document.createElement("div");
      div.className = "message";
      div.innerHTML = `
        <h4>${mail.subject || "Без темы"}</h4>
        <p><b>📤 От:</b> ${mail.from}</p>
        <p><b>📅:</b> ${mail.date}</p>
        <p><b>📝:</b> ${mail.textBody?.substring(0,150) || "Нет текста"}</p>
      `;
      box.appendChild(div);
    }
  } catch (err) {
    console.error(err);
    box.innerHTML = "<p>⚠ Ошибка загрузки</p>";
  }
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("generateBtn")
    .addEventListener("click", createAccount);
});
