const {
  adminPassword,
  adminSessionKey,
  createId,
  loadMessages,
  loadState,
  saveMessages,
  saveState,
} = window.FloraData;

const loginForm = document.querySelector("#loginForm");
const adminRoot = document.querySelector("#adminRoot");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = String(new FormData(loginForm).get("password")).trim();
    const status = document.querySelector("#loginStatus");

    if (password === adminPassword) {
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
  }

  const bookForm = document.querySelector("#bookForm");
  const diaryForm = document.querySelector("#diaryForm");
  const extraForm = document.querySelector("#extraForm");
  const musicForm = document.querySelector("#musicForm");
  const bookStatus = document.querySelector("#bookStatus");
  const musicStatus = document.querySelector("#musicStatus");
  const logoutButton = document.querySelector("#logoutButton");
  const diaryAdminList = document.querySelector("#diaryAdminList");
  const extrasAdminList = document.querySelector("#extrasAdminList");
  const adminMessages = document.querySelector("#adminMessages");

  let state = loadState();
  let messages = loadMessages();

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
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

  function renderExtrasAdmin() {
    extrasAdminList.replaceChildren();

    state.extras.forEach((extra) => {
      const article = createElement("article");
      article.append(
        createElement("h3", null, `${extra.label} · ${extra.title}`),
        createElement("p", null, extra.description),
      );

      const remove = createElement("button", "button ghost", "remover");
      remove.type = "button";
      remove.dataset.removeExtra = extra.id;
      article.append(remove);
      extrasAdminList.append(article);
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
    bookStatus.textContent = "progresso salvo na escrivaninha.";
    window.setTimeout(() => {
      bookStatus.textContent = "";
    }, 2600);
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

  extraForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(extraForm);

    state.extras = [
      {
        id: createId(),
        label: String(data.get("label")).trim(),
        title: String(data.get("title")).trim(),
        description: String(data.get("description")).trim(),
        image: String(data.get("image")).trim() || "assets/escrivaninha-collage.png",
        locked: data.get("locked") === "on",
      },
      ...state.extras,
    ];

    saveState(state);
    extraForm.reset();
    renderExtrasAdmin();
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
    musicStatus.textContent = "playlist salva na lateral.";
    window.setTimeout(() => {
      musicStatus.textContent = "";
    }, 2600);
  });

  diaryAdminList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-diary]");
    if (!button) return;
    state.diary = state.diary.filter((note) => note.id !== button.dataset.removeDiary);
    saveState(state);
    renderDiaryAdmin();
  });

  extrasAdminList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-extra]");
    if (!button) return;
    state.extras = state.extras.filter((extra) => extra.id !== button.dataset.removeExtra);
    saveState(state);
    renderExtrasAdmin();
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
  fillMusicForm();
  renderDiaryAdmin();
  renderExtrasAdmin();
  renderAdminMessages();
}
