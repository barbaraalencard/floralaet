const {
  addMessage,
  appendReply,
  loadMessages,
  loadState,
  subscribeMessages,
  subscribeState,
  trackCounters,
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
const diaryPreviewList = document.querySelector("#diaryPreviewList");
const extrasList = document.querySelector("#extrasList");
const buyList = document.querySelector("#buyList");
const heroImage = document.querySelector("#heroImage");
const spotifyTitle = document.querySelector("#spotifyTitle");
const spotifyEmbed = document.querySelector("#spotifyEmbed");
const spotifyCaption = document.querySelector("#spotifyCaption");
const newsletterForm = document.querySelector("#newsletterForm");
const newsletterStatus = document.querySelector("#newsletterStatus");
const onlineCount = document.querySelector("#onlineCount");
const visitCount = document.querySelector("#visitCount");
const visitUpdates = document.querySelector("#visitUpdates");
const visitUpdatesList = document.querySelector("#visitUpdatesList");
const heroSideImages = [
  document.querySelector("#heroSideImageOne"),
  document.querySelector("#heroSideImageTwo"),
];

let messages = loadMessages();
let siteState = loadState();
let visitSnapshotTimer = null;
const contentSnapshotKey = "flora-last-content-snapshot";

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

  const fill = document.querySelector("#progressFill");
  if (fill) fill.style.setProperty("--progress", `${progress}%`);
}

function imageFit(value) {
  return value === "contain" ? "contain" : "cover";
}

function setImageSource(image, src, fallback, alt, fit = "cover") {
  image.onerror = () => {
    image.onerror = null;
    image.src = fallback;
  };
  image.src = src || fallback;
  image.alt = alt || "";
  image.dataset.fit = imageFit(fit);
}

function setupScrollTopButton() {
  if (document.querySelector("#scrollTopButton")) return;

  const button = createElement("button", "scroll-top-button", "↑");
  button.id = "scrollTopButton";
  button.type = "button";
  button.setAttribute("aria-label", "Subir para o topo");
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.append(button);

  function updateVisibility() {
    button.classList.toggle("visible", window.scrollY > 420);
  }

  updateVisibility();
  window.addEventListener("scroll", updateVisibility, { passive: true });
}

function renderHero() {
  if (!heroImage || !siteState.hero) return;

  setImageSource(
    heroImage,
    siteState.hero.image,
    "assets/escrivaninha-collage.png",
    siteState.hero.alt || "Imagem escolhida pela Flora para a página inicial",
    siteState.hero.fit,
  );

  const sideFallbacks = [
    {
      image: "assets/hero-side-1.png",
      alt: "Detalhe delicado de papéis e rabiscos da escrivaninha",
    },
    {
      image: "assets/hero-side-2.png",
      alt: "Detalhe de anotações e flores em clima de romance",
    },
  ];
  const sideImages = Array.isArray(siteState.hero.sideImages) ? siteState.hero.sideImages : [];

  heroSideImages.forEach((image, index) => {
    if (!image) return;

    const data = sideImages[index] || sideFallbacks[index];
    setImageSource(image, data.image, sideFallbacks[index].image, data.alt || sideFallbacks[index].alt, data.fit);
  });
}

function toSpotifyEmbedUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.includes("open.spotify.com/embed/")) return raw;

  const match = raw.match(/open\.spotify\.com\/(playlist|album|track)\/([A-Za-z0-9]+)/);
  if (!match) return raw;

  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`;
}

function renderMusic() {
  if (!spotifyEmbed || !siteState.music) return;

  spotifyTitle.textContent = siteState.music.title || "no fone agora";
  spotifyCaption.textContent = siteState.music.caption || "";
  spotifyEmbed.src = toSpotifyEmbedUrl(siteState.music.spotifyUrl);
}

function renderDiary() {
  diaryPreviewList.replaceChildren();

  siteState.diary.slice(0, 3).forEach((note) => {
    const card = createElement("article", "diary-note");
    const stamp = createElement("time", null, `${note.date} · ${note.time}`);
    const text = createElement("p", null, note.text);
    card.append(stamp, text);
    diaryPreviewList.append(card);
  });
}

function renderExtras() {
  extrasList.replaceChildren();

  siteState.extras.forEach((extra) => {
    const article = document.createElement("a");
    article.className = "extra-card";
    article.href = extra.locked ? "#extras" : extra.page || "#";
    const img = document.createElement("img");
    setImageSource(img, extra.image, "assets/escrivaninha-collage.png", "", extra.fit);

    const label = createElement("span", "extra-label", extra.label);
    const title = createElement("h3", null, extra.title);
    const description = createElement("p", null, extra.description);

    article.append(img, label, title, description);

    if (extra.locked) {
      article.classList.add("locked-extra");
      article.setAttribute("aria-disabled", "true");
      article.title = "Conteúdo guardado para abrir mais tarde.";
      article.addEventListener("click", (event) => {
        event.preventDefault();
      });
      article.append(createElement("strong", "locked", "guardado na gaveta"));
    }

    extrasList.append(article);
  });
}

function renderBuyLinks() {
  if (!buyList || !siteState.purchase) return;

  buyList.replaceChildren();

  [
    { key: "physical", label: "físicos" },
    { key: "digital", label: "digitais" },
  ].forEach((item) => {
    const data = siteState.purchase[item.key];
    const card = document.createElement("a");
    card.className = "buy-card";
    card.href = item.key === "physical" ? "comprar-fisicos.html" : "comprar-digitais.html";

    const img = document.createElement("img");
    setImageSource(img, data.image, "assets/escrivaninha-collage.png", "", data.fit);

    const label = createElement("span", "extra-label", item.label);
    const title = createElement("h3", null, data.title);
    const description = createElement("p", null, data.description);

    card.append(img, label, title, description);
    buyList.append(card);
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
  const ticket = document.querySelector(".pink-ticket");

  if (ticket && !previousVisit) {
    ticket.innerHTML = "obrigada por estar aqui!<br />você acabou de abrir a escrivaninha. ♡";
  }

  return previousVisit;
}

function cleanText(value) {
  return String(value || "").trim();
}

function mapByKey(items, getKey, fields) {
  const result = {};

  (Array.isArray(items) ? items : []).forEach((item, index) => {
    const key = getKey(item, index);
    if (!key) return;
    result[key] = fields.map((field) => cleanText(item[field])).join("||");
  });

  return result;
}

function createContentSnapshot() {
  const book = siteState.book || {};
  const extraPages = {};
  const extraItems = {};
  const purchaseCategories = {};
  const purchaseItems = {};

  (Array.isArray(siteState.extras) ? siteState.extras : []).forEach((extra) => {
    const extraId = cleanText(extra.id || extra.title);
    if (!extraId) return;

    extraPages[extraId] = [
      extra.title,
      extra.description,
      extra.content,
      extra.image,
      extra.fit,
      extra.locked,
    ]
      .map(cleanText)
      .join("||");

    (Array.isArray(extra.items) ? extra.items : []).forEach((item, index) => {
      const itemId = cleanText(item.id || `${extraId}-${index}-${item.title}`);
      if (!itemId) return;
      extraItems[`${extraId}:${itemId}`] = [
        item.title,
        item.description,
        item.content,
        item.image,
        item.fit,
      ]
        .map(cleanText)
        .join("||");
    });
  });

  Object.entries(siteState.purchase || {}).forEach(([type, category]) => {
    purchaseCategories[type] = [
      category.title,
      category.description,
      category.image,
      category.fit,
    ]
      .map(cleanText)
      .join("||");

    (Array.isArray(category.items) ? category.items : []).forEach((item, index) => {
      const itemId = cleanText(item.id || `${type}-${index}-${item.title}`);
      if (!itemId) return;
      purchaseItems[`${type}:${itemId}`] = [
        item.title,
        item.description,
        item.image,
        item.fit,
        item.link,
        item.buttonLabel,
      ]
        .map(cleanText)
        .join("||");
    });
  });

  return {
    version: 1,
    book: {
      title: cleanText(book.title),
      progress: Number(book.progress) || 0,
      lastUpdate: cleanText(book.lastUpdate),
      currentChapter: cleanText(book.currentChapter),
      quote: cleanText(book.quote),
    },
    diary: mapByKey(
      siteState.diary,
      (note) => `diary:${cleanText(note.date)}:${cleanText(note.time)}:${cleanText(note.text)}`,
      ["date", "time", "text"],
    ),
    extraPages,
    extraItems,
    purchaseCategories,
    purchaseItems,
    messages: mapByKey(
      messages,
      (message) => `message:${cleanText(message.createdAt)}:${cleanText(message.name)}:${cleanText(message.text)}`,
      ["name", "text", "createdAt"],
    ),
    about: [
      siteState.about && siteState.about.photo,
      siteState.about && siteState.about.photoFit,
      siteState.about && siteState.about.description,
    ]
      .map(cleanText)
      .join("||"),
  };
}

function loadContentSnapshot() {
  try {
    return JSON.parse(localStorage.getItem(contentSnapshotKey));
  } catch {
    return null;
  }
}

function countNewItems(previous = {}, current = {}) {
  return Object.keys(current).filter((key) => !Object.prototype.hasOwnProperty.call(previous, key)).length;
}

function countChangedItems(previous = {}, current = {}) {
  return Object.keys(current).filter(
    (key) => Object.prototype.hasOwnProperty.call(previous, key) && previous[key] !== current[key],
  ).length;
}

function chooseCount(count, singular, plural) {
  return count === 1 ? singular : plural;
}

function buildVisitUpdates(previous, current) {
  if (!previous || previous.version !== current.version) {
    return ["Esta é sua primeira visita registrada neste aparelho. A partir de agora, eu te conto o que mudar por aqui."];
  }

  const updates = [];
  const previousBook = previous.book || {};
  const currentBook = current.book || {};

  if (currentBook.title && currentBook.title !== previousBook.title) {
    updates.push(`O livro em destaque agora é “${currentBook.title}”.`);
  }

  if (currentBook.progress > (Number(previousBook.progress) || 0)) {
    updates.push(`A barra do livro avançou para ${currentBook.progress}%.`);
  } else if (currentBook.progress !== (Number(previousBook.progress) || 0)) {
    updates.push(`A barra do livro foi atualizada para ${currentBook.progress}%.`);
  }

  if (currentBook.currentChapter && currentBook.currentChapter !== previousBook.currentChapter) {
    updates.push(`O capítulo atual agora é ${currentBook.currentChapter}.`);
  }

  if (currentBook.lastUpdate && currentBook.lastUpdate !== previousBook.lastUpdate) {
    updates.push(`A última atualização mudou para ${currentBook.lastUpdate}.`);
  }

  const newDiary = countNewItems(previous.diary, current.diary);
  if (newDiary) {
    updates.push(chooseCount(newDiary, "Tem 1 bilhete novo no diário.", `Tem ${newDiary} bilhetes novos no diário.`));
  }

  const changedExtras =
    countNewItems(previous.extraItems, current.extraItems) +
    countChangedItems(previous.extraItems, current.extraItems) +
    countChangedItems(previous.extraPages, current.extraPages);
  if (changedExtras) {
    updates.push(
      chooseCount(
        changedExtras,
        "Tem 1 conteúdo novo ou atualizado nos extras.",
        `Tem ${changedExtras} conteúdos novos ou atualizados nos extras.`,
      ),
    );
  }

  const changedPurchase =
    countNewItems(previous.purchaseItems, current.purchaseItems) +
    countChangedItems(previous.purchaseItems, current.purchaseItems) +
    countChangedItems(previous.purchaseCategories, current.purchaseCategories);
  if (changedPurchase) {
    updates.push("Os links de compra receberam novidades.");
  }

  if (previous.about !== current.about) {
    updates.push("A página sobre a autora foi atualizada.");
  }

  const newMessages = countNewItems(previous.messages, current.messages);
  if (newMessages) {
    updates.push(
      chooseCount(newMessages, "Uma nova carta apareceu no mural.", `${newMessages} novas cartas apareceram no mural.`),
    );
  }

  if (!updates.length) {
    updates.push("Nada novo desde sua última visita, mas a escrivaninha continua aberta para você.");
  }

  return updates.slice(0, 6);
}

function rememberContentSnapshot(snapshot) {
  try {
    localStorage.setItem(contentSnapshotKey, JSON.stringify(snapshot));
    localStorage.setItem(lastVisitKey, new Date().toISOString());
  } catch {
    // Se o navegador bloquear armazenamento local, o site continua funcionando normalmente.
  }
}

function renderVisitUpdates() {
  if (!visitUpdates || !visitUpdatesList) return;

  const currentSnapshot = createContentSnapshot();
  const previousSnapshot = loadContentSnapshot();
  const updates = buildVisitUpdates(previousSnapshot, currentSnapshot);

  visitUpdates.hidden = false;
  visitUpdatesList.replaceChildren();
  updates.forEach((text) => visitUpdatesList.append(createElement("li", null, text)));

  window.clearTimeout(visitSnapshotTimer);
  visitSnapshotTimer = window.setTimeout(() => {
    rememberContentSnapshot(createContentSnapshot());
  }, 2600);
}

function renderCounters({ online, visits }) {
  if (onlineCount) onlineCount.textContent = online === null ? "..." : String(online);
  if (visitCount) visitCount.textContent = visits === null ? "..." : String(visits);
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
    id: createId(),
    emoji: data.get("emoji") || "🌷",
    name: String(data.get("name")).trim(),
    text: String(data.get("message")).trim(),
    createdAt: new Date().toISOString(),
    replies: [],
  };

  if (!nextMessage.name || !nextMessage.text) return;

  messages = [nextMessage, ...messages];
  addMessage(nextMessage, messages);
  renderMessages();
  form.reset();
  readerEmoji.value = "🌷";
  emojiButtons.forEach((item) => item.classList.toggle("active", item.dataset.emoji === "🌷"));
  formStatus.textContent = "Sua carta foi deixada na escrivaninha da Flora.";
  window.setTimeout(() => {
    formStatus.textContent = "";
  }, 3600);
});

if (newsletterForm) {
  newsletterForm.addEventListener("submit", () => {
    if (newsletterStatus) {
      newsletterStatus.textContent = "E-mail enviado para a lista da Flora. ♡";
    }

    window.setTimeout(() => {
      newsletterForm.reset();
    }, 300);

    window.setTimeout(() => {
      if (newsletterStatus) newsletterStatus.textContent = "";
    }, 4200);
  });
}

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
  appendReply(message.id, reply, messages);
  renderMessages();
});

renderBook();
renderHero();
renderMusic();
renderDiary();
renderExtras();
renderBuyLinks();
renderMessages();
setupScrollTopButton();
trackCounters(renderCounters);
showWelcomeIfNeeded();
updateVisitSummary();
renderVisitUpdates();

subscribeState((nextState) => {
  siteState = nextState;
  renderBook();
  renderHero();
  renderMusic();
  renderDiary();
  renderExtras();
  renderBuyLinks();
  renderVisitUpdates();
});

subscribeMessages((nextMessages) => {
  messages = nextMessages;
  renderMessages();
  renderVisitUpdates();
});
