const {
  adminSessionKey,
  createId,
  getAdminPassword,
  loadMessages,
  loadState,
  saveMessages,
  saveState,
  setAdminPassword,
} = window.FloraData;

const loginForm = document.querySelector("#loginForm");
const adminRoot = document.querySelector("#adminRoot");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = String(new FormData(loginForm).get("password")).trim();
    const status = document.querySelector("#loginStatus");

    if (password === getAdminPassword()) {
      sessionStorage.setItem(adminSessionKey, "true");
      window.location.href = "admin.html";
      return;
    }

    status.textContent = "senha incorreta. tente de novo.";
  });
}

if (adminRoot) {
  if (sessionStorage.getItem(adminSessionKey) !== "true") {
    window.location.href = "login.html";
  } else {
    bootAdmin();
  }
}

function bootAdmin() {
  const bookForm = document.querySelector("#bookForm");
  const heroForm = document.querySelector("#heroForm");
  const passwordForm = document.querySelector("#passwordForm");
  const diaryForm = document.querySelector("#diaryForm");
  const musicForm = document.querySelector("#musicForm");
  const bookStatus = document.querySelector("#bookStatus");
  const heroStatus = document.querySelector("#heroStatus");
  const passwordStatus = document.querySelector("#passwordStatus");
  const musicStatus = document.querySelector("#musicStatus");
  const logoutButton = document.querySelector("#logoutButton");
  const diaryAdminList = document.querySelector("#diaryAdminList");
  const extrasAdminList = document.querySelector("#extrasAdminList");
  const purchaseAdminList = document.querySelector("#purchaseAdminList");
  const adminMessages = document.querySelector("#adminMessages");

  let state = loadState();
  let messages = loadMessages();

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function flash(element, message) {
    element.textContent = message;
    window.setTimeout(() => {
      element.textContent = "";
    }, 2600);
  }

  function fillBookForm() {
    const book = state.book;
    bookForm.elements.title.value = book.title;
    bookForm.elements.progress.value = book.progress;
    bookForm.elements.lastUpdate.value = book.lastUpdate;
    bookForm.elements.currentChapter.value = book.currentChapter;
    bookForm.elements.totalChapters.value = book.totalChapters;
    bookForm.elements.nextMilestone.value = book.nextMilestone;
    bookForm.elements.quote.value = book.quote;
  }

  function fillHeroForm() {
    heroForm.elements.image.value = state.hero.image;
    heroForm.elements.alt.value = state.hero.alt;
  }

  function fillMusicForm() {
    const music = state.music || {};
    musicForm.elements.title.value = music.title || "no fone agora";
    musicForm.elements.caption.value = music.caption || "playlist da Flora";
    musicForm.elements.spotifyUrl.value = music.spotifyUrl || "";
  }

  function renderDiaryAdmin() {
    diaryAdminList.replaceChildren();

    state.diary.forEach((note) => {
      const article = createElement("article");
      article.append(
        createElement("h3", null, `${note.date} · ${note.time}`),
        createElement("p", null, note.text),
      );

      const remove = createElement("button", "button ghost", "remover");
      remove.type = "button";
      remove.dataset.removeDiary = note.id;
      article.append(remove);
      diaryAdminList.append(article);
    });
  }

  function buildTextInput(name, value, labelText, required = true) {
    const label = createElement("label", "full");
    const span = createElement("span", null, labelText);
    const input = document.createElement("input");
    input.name = name;
    input.value = value || "";
    input.required = required;
    label.append(span, input);
    return label;
  }

  function buildTextarea(name, value, labelText) {
    const label = createElement("label", "full");
    const span = createElement("span", null, labelText);
    const textarea = document.createElement("textarea");
    textarea.name = name;
    textarea.rows = 4;
    textarea.value = value || "";
    textarea.required = true;
    label.append(span, textarea);
    return label;
  }

  function renderExtrasAdmin() {
    extrasAdminList.replaceChildren();

    state.extras.forEach((extra) => {
      const article = createElement("article");
      article.append(createElement("h3", null, extra.title));

      const form = createElement("form", "admin-form");
      form.dataset.extraId = extra.id;
      form.append(
        buildTextInput("label", extra.label, "etiqueta"),
        buildTextInput("title", extra.title, "título"),
        buildTextInput("image", extra.image, "capa da página"),
        buildTextarea("description", extra.description, "descrição curta"),
        buildTextarea("content", extra.content, "conteúdo da página"),
      );

      const lockedLabel = createElement("label");
      const lockedText = createElement("span", null, "guardado?");
      const locked = document.createElement("input");
      locked.type = "checkbox";
      locked.name = "locked";
      locked.checked = Boolean(extra.locked);
      lockedLabel.append(lockedText, locked);

      const actions = createElement("div", "admin-actions");
      const save = createElement("button", "button primary", "salvar página");
      save.type = "submit";
      const open = createElement("a", "button ghost", "abrir página");
      open.href = extra.page;
      actions.append(save, open);

      form.append(lockedLabel, actions);
      article.append(form);
      extrasAdminList.append(article);
    });
  }

  function renderPurchaseAdmin() {
    purchaseAdminList.replaceChildren();

    [
      { id: "physical", title: "Livros físicos", page: "comprar-fisicos.html" },
      { id: "digital", title: "E-books", page: "comprar-digitais.html" },
    ].forEach((item) => {
      const data = state.purchase[item.id];
      const article = createElement("article");
      article.append(createElement("h3", null, item.title));

      const form = createElement("form", "admin-form");
      form.dataset.purchaseId = item.id;
      form.append(
        buildTextInput("title", data.title, "título"),
        buildTextInput("image", data.image, "capa da página"),
        buildTextInput("link", data.link, "link de compra"),
        buildTextInput("buttonLabel", data.buttonLabel, "texto do botão"),
        buildTextarea("description", data.description, "descrição"),
      );

      const actions = createElement("div", "admin-actions");
      const save = createElement("button", "button primary", "salvar compra");
      save.type = "submit";
      const open = createElement("a", "button ghost", "abrir página");
      open.href = item.page;
      actions.append(save, open);
      form.append(actions);

      article.append(form);
      purchaseAdminList.append(article);
    });
  }

  function renderAdminMessages() {
    adminMessages.replaceChildren();

    messages.forEach((message) => {
      const article = createElement("article");
      article.append(
        createElement("h3", null, `${message.emoji} ${message.name}`),
        createElement("p", null, message.text),
      );

      const form = createElement("form", "admin-form");
      form.dataset.replyTo = message.id;

      const label = createElement("label", "full");
      const span = createElement("span", null, "responder como Flora");
      const textarea = document.createElement("textarea");
      textarea.name = "reply";
      textarea.rows = 3;
      textarea.required = true;
      label.append(span, textarea);

      const actions = createElement("div", "admin-actions");
      const button = createElement("button", "button primary", "responder");
      button.type = "submit";
      actions.append(button);

      form.append(label, actions);
      article.append(form);
      adminMessages.append(article);
    });
  }

  bookForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(bookForm);

    state.book = {
      title: String(data.get("title")).trim(),
      progress: Number(data.get("progress")),
      lastUpdate: String(data.get("lastUpdate")).trim(),
      currentChapter: Number(data.get("currentChapter")),
      totalChapters: Number(data.get("totalChapters")),
      nextMilestone: String(data.get("nextMilestone")).trim(),
      quote: String(data.get("quote")).trim(),
    };

    saveState(state);
    flash(bookStatus, "progresso salvo na escrivaninha.");
  });

  heroForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(heroForm);

    state.hero = {
      image: String(data.get("image")).trim(),
      alt: String(data.get("alt")).trim(),
    };

    saveState(state);
    flash(heroStatus, "imagem inicial salva.");
  });

  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(passwordForm);
    const currentPassword = String(data.get("currentPassword")).trim();
    const newPassword = String(data.get("newPassword")).trim();

    if (currentPassword !== getAdminPassword()) {
      flash(passwordStatus, "senha atual incorreta.");
      return;
    }

    setAdminPassword(newPassword);
    passwordForm.reset();
    flash(passwordStatus, "senha alterada com sucesso.");
  });

  diaryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(diaryForm);

    state.diary = [
      {
        id: createId(),
        date: String(data.get("date")).trim(),
        time: String(data.get("time")).trim(),
        text: String(data.get("text")).trim(),
      },
      ...state.diary,
    ];

    saveState(state);
    diaryForm.reset();
    renderDiaryAdmin();
  });

  musicForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(musicForm);

    state.music = {
      title: String(data.get("title")).trim(),
      caption: String(data.get("caption")).trim(),
      spotifyUrl: String(data.get("spotifyUrl")).trim(),
    };

    saveState(state);
    flash(musicStatus, "playlist salva na lateral.");
  });

  extrasAdminList.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-extra-id]");
    if (!form) return;

    event.preventDefault();
    const data = new FormData(form);
    const extra = state.extras.find((item) => item.id === form.dataset.extraId);
    if (!extra) return;

    extra.label = String(data.get("label")).trim();
    extra.title = String(data.get("title")).trim();
    extra.image = String(data.get("image")).trim();
    extra.description = String(data.get("description")).trim();
    extra.content = String(data.get("content")).trim();
    extra.locked = data.get("locked") === "on";

    saveState(state);
    renderExtrasAdmin();
  });

  purchaseAdminList.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-purchase-id]");
    if (!form) return;

    event.preventDefault();
    const data = new FormData(form);
    const purchase = state.purchase[form.dataset.purchaseId];
    if (!purchase) return;

    purchase.title = String(data.get("title")).trim();
    purchase.image = String(data.get("image")).trim();
    purchase.link = String(data.get("link")).trim();
    purchase.buttonLabel = String(data.get("buttonLabel")).trim();
    purchase.description = String(data.get("description")).trim();

    saveState(state);
    renderPurchaseAdmin();
  });

  diaryAdminList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-diary]");
    if (!button) return;
    state.diary = state.diary.filter((note) => note.id !== button.dataset.removeDiary);
    saveState(state);
    renderDiaryAdmin();
  });

  adminMessages.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-reply-to]");
    if (!form) return;
    event.preventDefault();

    const message = messages.find((item) => item.id === form.dataset.replyTo);
    const replyText = String(new FormData(form).get("reply")).trim();
    if (!message || !replyText) return;

    message.replies.push({
      emoji: "✒",
      name: "Flora",
      text: replyText,
    });

    saveMessages(messages);
    form.reset();
  });

  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem(adminSessionKey);
    window.location.href = "login.html";
  });

  fillBookForm();
  fillHeroForm();
  fillMusicForm();
  renderDiaryAdmin();
  renderExtrasAdmin();
  renderPurchaseAdmin();
  renderAdminMessages();
}
