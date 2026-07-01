const messageKey = "flora-reader-messages";
const welcomeKey = "flora-skip-welcome";
const lastVisitKey = "flora-last-visit";

const defaultMessages = [
  {
    id: crypto.randomUUID(),
    emoji: "🌷",
    name: "Ana Clara",
    text: "Estou ansiosa por Herdeiros de Mayfair III. Essa barrinha vai virar meu ritual de domingo.",
    createdAt: "2026-06-28T15:15:00.000Z",
    replies: [
      {
        emoji: "✒",
        name: "Flora",
        text: "A barrinha cresceu mais um pouquinho hoje.",
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    emoji: "☕",
    name: "Marina",
    text: "Vim deixar café imaginário e paciência para a cena do baile.",
    createdAt: "2026-06-27T18:30:00.000Z",
    replies: [],
  },
  {
    id: crypto.randomUUID(),
    emoji: "🌙",
    name: "Bia",
    text: "Amei esse cantinho. Parece que a gente entrou mesmo na sua escrivaninha.",
    createdAt: "2026-06-26T20:10:00.000Z",
    replies: [
      {
        emoji: "📚",
        name: "Livia",
        text: "Sim! Quero voltar só para ver se tem bilhete novo.",
      },
    ],
  },
];

const welcomeScreen = document.querySelector("#welcomeScreen");
const enterButton = document.querySelector("#enterButton");
const skipWelcome = document.querySelector("#skipWelcome");
const form = document.querySelector("#letterForm");
const messageList = document.querySelector("#messageList");
const formStatus = document.querySelector("#formStatus");
const readerEmoji = document.querySelector("#readerEmoji");
const emojiButtons = document.querySelectorAll(".emoji-option");
const visitSummary = document.querySelector("#visitSummary");

let messages = loadMessages();

function loadMessages() {
  const stored = localStorage.getItem(messageKey);

  if (!stored) {
    return defaultMessages;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : defaultMessages;
  } catch {
    return defaultMessages;
  }
}

function saveMessages() {
  localStorage.setItem(messageKey, JSON.stringify(messages));
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function renderMessages() {
  messageList.replaceChildren();

  messages.forEach((message) => {
    const article = createElement("article", "message-card");
    article.dataset.id = message.id;

    const author = createElement("div", "message-author");
    const emoji = createElement("span", null, message.emoji);
    const name = createElement("strong", null, message.name);
    author.append(emoji, name);

    const text = createElement("p", null, message.text);
    const date = createElement("time", "message-date", formatDate(message.createdAt));
    date.dateTime = message.createdAt;

    const replyButton = createElement("button", "reply-button", "♡ responder");
    replyButton.type = "button";

    article.append(author, text, date, replyButton);

    if (message.replies.length) {
      const replies = createElement("div", "replies");
      message.replies.forEach((reply) => {
        const row = createElement("div", "reply-row");
        const replyAuthor = createElement("strong", null, `${reply.emoji} ${reply.name}: `);
        const replyText = document.createTextNode(reply.text);
        row.append(replyAuthor, replyText);
        replies.append(row);
      });
      article.append(replies);
    }

    article.append(createReplyForm(message.id));
    messageList.append(article);
  });
}

function createReplyForm(messageId) {
  const replyForm = createElement("form", "reply-form");
  replyForm.dataset.replyTo = messageId;

  const name = document.createElement("input");
  name.name = "name";
  name.maxLength = 32;
  name.placeholder = "Seu nome";
  name.required = true;

  const text = document.createElement("textarea");
  text.name = "text";
  text.maxLength = 160;
  text.placeholder = "Responder com carinho...";
  text.required = true;

  const button = createElement("button", "button ghost", "Enviar resposta");
  button.type = "submit";

  replyForm.append(name, text, button);
  return replyForm;
}

function showWelcomeIfNeeded() {
  if (localStorage.getItem(welcomeKey) === "true") {
    welcomeScreen.classList.add("hidden");
    return;
  }

  document.body.classList.add("welcome-open");
}

function closeWelcome() {
  if (skipWelcome.checked) {
    localStorage.setItem(welcomeKey, "true");
  }

  welcomeScreen.classList.add("hidden");
  document.body.classList.remove("welcome-open");
}

function applyTimeLight() {
  const hour = new Date().getHours();
  const light = hour >= 18 || hour < 6 ? "night" : hour >= 13 ? "afternoon" : "morning";
  document.body.dataset.light = light;
}

function updateVisitSummary() {
  const previousVisit = localStorage.getItem(lastVisitKey);

  if (previousVisit) {
    visitSummary.textContent =
      "Desde sua última visita, a barra avançou, chegaram novas cartas e Flora deixou um bilhete curto na escrivaninha.";
  } else {
    visitSummary.textContent =
      "Primeira visita registrada. A escrivaninha já tem cartas, diário e uma gaveta de extras esperando por você.";
  }

  localStorage.setItem(lastVisitKey, new Date().toISOString());
}

emojiButtons.forEach((button) => {
  button.addEventListener("click", () => {
    emojiButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    readerEmoji.value = button.dataset.emoji;
  });
});

enterButton.addEventListener("click", closeWelcome);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const nextMessage = {
    id: crypto.randomUUID(),
    emoji: data.get("emoji") || "🌷",
    name: String(data.get("name")).trim(),
    text: String(data.get("message")).trim(),
    createdAt: new Date().toISOString(),
    replies: [],
  };

  if (!nextMessage.name || !nextMessage.text) return;

  messages = [nextMessage, ...messages];
  saveMessages();
  renderMessages();
  form.reset();
  readerEmoji.value = "🌷";
  emojiButtons.forEach((item) => item.classList.toggle("active", item.dataset.emoji === "🌷"));
  formStatus.textContent = "Sua carta foi deixada na escrivaninha da Flora.";
  window.setTimeout(() => {
    formStatus.textContent = "";
  }, 3600);
});

messageList.addEventListener("click", (event) => {
  const button = event.target.closest(".reply-button");
  if (!button) return;

  const card = button.closest(".message-card");
  const replyForm = card.querySelector(".reply-form");
  replyForm.classList.toggle("open");
  if (replyForm.classList.contains("open")) {
    replyForm.querySelector("input").focus();
  }
});

messageList.addEventListener("submit", (event) => {
  const replyForm = event.target.closest(".reply-form");
  if (!replyForm) return;

  event.preventDefault();
  const data = new FormData(replyForm);
  const message = messages.find((item) => item.id === replyForm.dataset.replyTo);

  if (!message) return;

  const reply = {
    emoji: "♡",
    name: String(data.get("name")).trim(),
    text: String(data.get("text")).trim(),
  };

  if (!reply.name || !reply.text) return;

  message.replies.push(reply);
  saveMessages();
  renderMessages();
});

applyTimeLight();
showWelcomeIfNeeded();
updateVisitSummary();
renderMessages();
