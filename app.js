const {
  loadMessages,
  loadState,
  saveMessages,
  messageKey,
  welcomeKey,
  lastVisitKey,
  createId,
} = window.FloraData;

const welcomeScreen = document.querySelector("#welcomeScreen");
const enterButton = document.querySelector("#enterButton");
const skipWelcome = document.querySelector("#skipWelcome");
const form = document.querySelector("#letterForm");
const messageList = document.querySelector("#messageList");
const formStatus = document.querySelector("#formStatus");
const readerEmoji = document.querySelector("#readerEmoji");
const emojiButtons = document.querySelectorAll(".emoji-option");
const focusMessageButton = document.querySelector("#focusMessageButton");
const diaryPreviewList = document.querySelector("#diaryPreviewList");
const diaryFullList = document.querySelector("#diaryFullList");
const extrasList = document.querySelector("#extrasList");

let messages = loadMessages();
let siteState = loadState();

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function renderBook() {
  const book = siteState.book;
  const progress = Math.max(0, Math.min(100, Number(book.progress) || 0));

  setText("#bookTitle", book.title);
  setText("#progressValue", `${progress}%`);
  setText("#progressQuote", book.quote);
  setText("#lastUpdate", book.lastUpdate);
  setText("#currentChapter", book.currentChapter);
  setText("#totalChapters", book.totalChapters);
  setText("#nextMilestone", book.nextMilestone);

  const fill = document.querySelector("#progressFill");
  if (fill) fill.style.setProperty("--progress", `${progress}%`);
}

function renderDiary() {
  diaryPreviewList.replaceChildren();
  diaryFullList.replaceChildren();

  siteState.diary.slice(0, 3).forEach((note) => {
    const card = createElement("article", "diary-note");
    const stamp = createElement("time", null, `${note.date} · ${note.time}`);
    const text = createElement("p", null, note.text);
    card.append(stamp, text);
    diaryPreviewList.append(card);
  });

  siteState.diary.forEach((note) => {
    const card = createElement("article", "note-card");
    const stamp = createElement("time", null, `${note.date} · ${note.time}`);
    const text = createElement("p", null, note.text);
    card.append(stamp, text);
    diaryFullList.append(card);
  });
}

function renderExtras() {
  extrasList.replaceChildren();

  siteState.extras.forEach((extra) => {
    const article = createElement("article", "extra-card");
    const img = document.createElement("img");
    img.src = extra.image || "assets/escrivaninha-collage.png";
    img.alt = "";

    const label = createElement("span", "extra-label", extra.label);
    const title = createElement("h3", null, extra.title);
    const description = createElement("p", null, extra.description);

    article.append(img, label, title, description);

    if (extra.locked) {
      article.classList.add("locked-extra");
      article.append(createElement("strong", "locked", "guardado na gaveta"));
    }

    extrasList.append(article);
  });
}

function renderMessages() {
  messageList.replaceChildren();

  messages.forEach((message) => {
    const article = createElement("article", "message-card");
    article.dataset.id = message.id;

    const author = createElement("div", "message-author");
    const avatar = createElement("span", "message-avatar", message.emoji);
    const name = createElement("strong", null, message.name);
    author.append(avatar, name);

    const date = createElement("time", "message-date", formatDate(message.createdAt));
    date.dateTime = message.createdAt;
    const text = createElement("p", null, message.text);
    const replyButton = createElement("button", "reply-button", "↩ responder");
    replyButton.type = "button";

    article.append(author, date, text, replyButton);

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

  const button = createElement("button", "button ghost", "enviar resposta");
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

function updateVisitSummary() {
  const previousVisit = localStorage.getItem(lastVisitKey);
  const message = previousVisit
    ? "Desde sua última visita, a barra avançou e chegaram novos bilhetes."
    : "Primeira visita registrada. A escrivaninha já está esperando por você.";

  const ticket = document.querySelector(".pink-ticket");
  if (ticket && !previousVisit) {
    ticket.innerHTML = "obrigada por estar aqui!<br />você acabou de abrir a escrivaninha. ♡";
  }

  localStorage.setItem(lastVisitKey, new Date().toISOString());
  return message;
}

emojiButtons.forEach((button) => {
  button.addEventListener("click", () => {
    emojiButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    readerEmoji.value = button.dataset.emoji;
  });
});

enterButton.addEventListener("click", closeWelcome);

if (focusMessageButton) {
  focusMessageButton.addEventListener("click", () => {
    document.querySelector("#readerMessage").focus();
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const nextMessage = {
    id: createId(),
    emoji: data.get("emoji") || "🌷",
    name: String(data.get("name")).trim(),
    text: String(data.get("message")).trim(),
    createdAt: new Date().toISOString(),
    replies: [],
  };

  if (!nextMessage.name || !nextMessage.text) return;

  messages = [nextMessage, ...messages];
  saveMessages(messages);
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
  saveMessages(messages);
  renderMessages();
});

renderBook();
renderDiary();
renderExtras();
renderMessages();
showWelcomeIfNeeded();
updateVisitSummary();
