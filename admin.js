const {
  appendReply,
  changeAdminPassword,
  createId,
  loadMessages,
  loadState,
  requireAdmin,
  removeMessage,
  saveState,
  signInAdmin,
  signOutAdmin,
  subscribeMessages,
  subscribeState,
} = window.FloraData;

const loginForm = document.querySelector("#loginForm");
const adminRoot = document.querySelector("#adminRoot");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password")).trim();
    const status = document.querySelector("#loginStatus");

    status.textContent = "entrando...";

    try {
      await signInAdmin(email, password);
      window.location.href = "admin.html";
      return;
    } catch (error) {
      status.textContent = error.code === "auth/invalid-credential" ? "e-mail ou senha incorretos." : error.message;
    }
  });
}

let adminBooted = false;

if (adminRoot) {
  requireAdmin(() => {
    if (adminBooted) return;
    adminBooted = true;
    bootAdmin();
  });
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
    if (!element) return;
    element.textContent = message;
    window.setTimeout(() => {
      element.textContent = "";
    }, 2600);
  }

  function value(data, key) {
    return String(data.get(key) || "").trim();
  }

  function isPinterestPageLink(url) {
    const text = String(url || "").trim().toLowerCase();
    return text.includes("pin.it/") || (text.includes("pinterest.") && text.includes("/pin/"));
  }

  function fillBookForm() {
    if (!bookForm || !state.book) return;

    const book = state.book;
    bookForm.elements.title.value = book.title;
    bookForm.elements.progress.value = book.progress;
    bookForm.elements.lastUpdate.value = book.lastUpdate;
    bookForm.elements.currentChapter.value = book.currentChapter;
    bookForm.elements.quote.value = book.quote;
  }

  function fillHeroForm() {
    if (!heroForm || !state.hero) return;

    const sideImages = Array.isArray(state.hero.sideImages) ? state.hero.sideImages : [];

    heroForm.elements.image.value = state.hero.image;
    heroForm.elements.sideImageOne.value = sideImages[0]?.image || "assets/hero-side-1.png";
    heroForm.elements.sideImageTwo.value = sideImages[1]?.image || "assets/hero-side-2.png";
  }

  function fillMusicForm() {
    if (!musicForm) return;

    const music = state.music || {};
    musicForm.elements.title.value = music.title || "no fone agora";
    musicForm.elements.caption.value = music.caption || "playlist da Flora";
    musicForm.elements.spotifyUrl.value = music.spotifyUrl || "";
  }

  function renderDiaryAdmin() {
    if (!diaryAdminList) return;

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

  function buildTextInput(name, inputValue, labelText, required = true) {
    const label = createElement("label", "full");
    const span = createElement("span", null, labelText);
    const input = document.createElement("input");
    input.name = name;
    input.value = inputValue || "";
    input.required = required;
    label.append(span, input);
    return label;
  }

  function buildTextarea(name, inputValue, labelText, required = true) {
    const label = createElement("label", "full");
    const span = createElement("span", null, labelText);
    const textarea = document.createElement("textarea");
    textarea.name = name;
    textarea.rows = 4;
    textarea.value = inputValue || "";
    textarea.required = required;
    label.append(span, textarea);
    return label;
  }

  function buildActions(primaryText, extraButton) {
    const actions = createElement("div", "admin-actions");
    const save = createElement("button", "button primary", primaryText);
    save.type = "submit";
    actions.append(save);
    if (extraButton) actions.append(extraButton);
    return actions;
  }

  function buildOpenLink(href) {
    const open = createElement("a", "button ghost", "abrir página");
    open.href = href;
    return open;
  }

  function renderExtraItemForm(extra, item) {
    const textRequired = extra.id !== "ilustracoes";
    const article = createElement("article");
    article.append(createElement("h3", null, item.title));

    const form = createElement("form", "admin-form");
    form.dataset.extraParent = extra.id;
    form.dataset.extraItemId = item.id;
    form.append(
      buildTextInput("title", item.title, "título do item"),
      buildTextInput("image", item.image, "imagem do item"),
      buildTextarea("description", item.description, "descrição curta", textRequired),
      buildTextarea("content", item.content, "texto/conteúdo", textRequired),
    );

    const remove = createElement("button", "button ghost", "remover item");
    remove.type = "button";
    remove.dataset.extraParent = extra.id;
    remove.dataset.removeExtraItem = item.id;

    form.append(buildActions("salvar item", remove));
    article.append(form);
    return article;
  }

  function renderExtrasAdmin() {
    if (!extrasAdminList) return;

    extrasAdminList.replaceChildren();

    state.extras.forEach((extra) => {
      const textRequired = extra.id !== "ilustracoes";
      const article = createElement("article");
      article.append(createElement("h3", "admin-section-heading", extra.title));

      const form = createElement("form", "admin-form");
      form.dataset.extraId = extra.id;
      form.append(
        buildTextInput("label", extra.label, "etiqueta"),
        buildTextInput("title", extra.title, "título da página"),
        buildTextInput("image", extra.image, "capa da página"),
        buildTextarea("description", extra.description, "descrição curta", textRequired),
        buildTextarea("content", extra.content, "texto de abertura", textRequired),
      );

      const lockedLabel = createElement("label");
      const lockedText = createElement("span", null, "guardado?");
      const locked = document.createElement("input");
      locked.type = "checkbox";
      locked.name = "locked";
      locked.checked = Boolean(extra.locked);
      lockedLabel.append(lockedText, locked);
      form.append(lockedLabel, buildActions("salvar página", buildOpenLink(extra.page)));
      article.append(form);

      const subsection = createElement("div", "admin-subsection");
      subsection.append(createElement("h4", null, "publicações desta página"));

      const addForm = createElement("form", "admin-form");
      addForm.dataset.addExtraItem = extra.id;
      addForm.append(
        buildTextInput("title", "", "novo título"),
        buildTextInput("image", "assets/escrivaninha-collage.png", "imagem"),
        buildTextarea("description", "", "descrição curta", textRequired),
        buildTextarea("content", "", "texto/conteúdo", textRequired),
        buildActions("publicar novo item"),
      );
      subsection.append(addForm);

      const itemList = createElement("div", "admin-nested-list");
      extra.items.forEach((item) => itemList.append(renderExtraItemForm(extra, item)));
      subsection.append(itemList);
      article.append(subsection);

      extrasAdminList.append(article);
    });
  }

  function renderPurchaseBookForm(type, book) {
    const article = createElement("article");
    article.append(createElement("h3", null, book.title));

    const form = createElement("form", "admin-form");
    form.dataset.purchaseType = type;
    form.dataset.purchaseItemId = book.id;
    form.append(
      buildTextInput("title", book.title, "título do livro"),
      buildTextInput("image", book.image, "capa do livro"),
      buildTextInput("link", book.link, "link de compra"),
      buildTextInput("buttonLabel", book.buttonLabel, "texto do botão"),
      buildTextarea("description", book.description, "descrição"),
    );

    const remove = createElement("button", "button ghost", "remover livro");
    remove.type = "button";
    remove.dataset.purchaseType = type;
    remove.dataset.removePurchaseItem = book.id;

    form.append(buildActions("salvar livro", remove));
    article.append(form);
    return article;
  }

  function renderPurchaseAdmin() {
    if (!purchaseAdminList) return;

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
        buildTextInput("title", data.title, "título da página"),
        buildTextInput("image", data.image, "capa da página"),
        buildTextarea("description", data.description, "descrição da página"),
        buildActions("salvar página", buildOpenLink(item.page)),
      );
      article.append(form);

      const subsection = createElement("div", "admin-subsection");
      subsection.append(createElement("h4", null, "livros cadastrados"));

      const addForm = createElement("form", "admin-form");
      addForm.dataset.addPurchaseItem = item.id;
      addForm.append(
        buildTextInput("title", "", "título do livro"),
        buildTextInput("image", "assets/escrivaninha-collage.png", "capa do livro"),
        buildTextInput("link", "", "link de compra"),
        buildTextInput("buttonLabel", "comprar", "texto do botão"),
        buildTextarea("description", "", "descrição"),
        buildActions("adicionar livro"),
      );
      subsection.append(addForm);

      const bookList = createElement("div", "admin-nested-list");
      data.items.forEach((book) => bookList.append(renderPurchaseBookForm(item.id, book)));
      subsection.append(bookList);
      article.append(subsection);

      purchaseAdminList.append(article);
    });
  }

  function renderAdminMessages() {
    if (!adminMessages) return;

    adminMessages.replaceChildren();

    const unansweredMessages = messages.filter((message) => !message.replies?.length);

    if (!unansweredMessages.length) {
      const empty = createElement("p", "empty-admin-note", "nenhum recado pendente por enquanto.");
      adminMessages.append(empty);
      return;
    }

    unansweredMessages.forEach((message) => {
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
      const remove = createElement("button", "button ghost", "excluir recado");
      remove.type = "button";
      remove.dataset.removeMessage = message.id;
      actions.append(button, remove);

      form.append(label, actions);
      article.append(form);
      adminMessages.append(article);
    });
  }

  if (bookForm) {
    bookForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(bookForm);

      state.book = {
        ...state.book,
        title: value(data, "title"),
        progress: Number(data.get("progress")),
        lastUpdate: value(data, "lastUpdate"),
        currentChapter: Number(data.get("currentChapter")),
        quote: value(data, "quote"),
      };

      saveState(state);
      flash(bookStatus, "progresso salvo na escrivaninha.");
    });
  }

  if (heroForm) {
    heroForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(heroForm);
      const image = value(data, "image");
      const sideImageOne = value(data, "sideImageOne");
      const sideImageTwo = value(data, "sideImageTwo");

      if ([image, sideImageOne, sideImageTwo].some(isPinterestPageLink)) {
        flash(heroStatus, "cole o link direto da imagem, não o link do pin do Pinterest.");
        return;
      }

      state.hero = {
        image,
        alt: "Imagem escolhida pela Flora para a página inicial",
        sideImages: [
          {
            image: sideImageOne,
            alt: "Imagem lateral da página inicial",
          },
          {
            image: sideImageTwo,
            alt: "Imagem lateral da página inicial",
          },
        ],
      };

      saveState(state);
      flash(heroStatus, "imagens iniciais salvas.");
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(passwordForm);
      const currentPassword = value(data, "currentPassword");
      const newPassword = value(data, "newPassword");

      try {
        await changeAdminPassword(currentPassword, newPassword);
        passwordForm.reset();
        flash(passwordStatus, "senha alterada com sucesso.");
      } catch (error) {
        flash(passwordStatus, error.code === "auth/wrong-password" ? "senha atual incorreta." : error.message);
      }
    });
  }

  if (diaryForm) {
    diaryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(diaryForm);

      state.diary = [
        {
          id: createId(),
          date: value(data, "date"),
          time: value(data, "time"),
          text: value(data, "text"),
        },
        ...state.diary,
      ];

      saveState(state);
      diaryForm.reset();
      renderDiaryAdmin();
    });
  }

  if (musicForm) {
    musicForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(musicForm);

      state.music = {
        title: value(data, "title"),
        caption: value(data, "caption"),
        spotifyUrl: value(data, "spotifyUrl"),
      };

      saveState(state);
      flash(musicStatus, "playlist salva na lateral.");
    });
  }

  if (extrasAdminList) {
    extrasAdminList.addEventListener("submit", (event) => {
      const pageForm = event.target.closest("form[data-extra-id]");
      const addForm = event.target.closest("form[data-add-extra-item]");
      const itemForm = event.target.closest("form[data-extra-item-id]");

      if (!pageForm && !addForm && !itemForm) return;
      event.preventDefault();

      if (pageForm) {
        const data = new FormData(pageForm);
        const extra = state.extras.find((item) => item.id === pageForm.dataset.extraId);
        if (!extra) return;

        extra.label = value(data, "label");
        extra.title = value(data, "title");
        extra.image = value(data, "image");
        extra.description = value(data, "description");
        extra.content = value(data, "content");
        extra.locked = data.get("locked") === "on";
      }

      if (addForm) {
        const data = new FormData(addForm);
        const extra = state.extras.find((item) => item.id === addForm.dataset.addExtraItem);
        if (!extra) return;

        extra.items = [
          {
            id: createId(),
            title: value(data, "title"),
            image: value(data, "image"),
            description: value(data, "description"),
            content: value(data, "content"),
          },
          ...extra.items,
        ];
      }

      if (itemForm) {
        const data = new FormData(itemForm);
        const extra = state.extras.find((item) => item.id === itemForm.dataset.extraParent);
        const item = extra && extra.items.find((entry) => entry.id === itemForm.dataset.extraItemId);
        if (!item) return;

        item.title = value(data, "title");
        item.image = value(data, "image");
        item.description = value(data, "description");
        item.content = value(data, "content");
      }

      saveState(state);
      renderExtrasAdmin();
    });

    extrasAdminList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-extra-item]");
      if (!button) return;

      const extra = state.extras.find((item) => item.id === button.dataset.extraParent);
      if (!extra) return;

      extra.items = extra.items.filter((item) => item.id !== button.dataset.removeExtraItem);
      saveState(state);
      renderExtrasAdmin();
    });
  }

  if (purchaseAdminList) {
    purchaseAdminList.addEventListener("submit", (event) => {
      const categoryForm = event.target.closest("form[data-purchase-id]");
      const addForm = event.target.closest("form[data-add-purchase-item]");
      const itemForm = event.target.closest("form[data-purchase-item-id]");

      if (!categoryForm && !addForm && !itemForm) return;
      event.preventDefault();

      if (categoryForm) {
        const data = new FormData(categoryForm);
        const purchase = state.purchase[categoryForm.dataset.purchaseId];
        if (!purchase) return;

        purchase.title = value(data, "title");
        purchase.image = value(data, "image");
        purchase.description = value(data, "description");
      }

      if (addForm) {
        const data = new FormData(addForm);
        const purchase = state.purchase[addForm.dataset.addPurchaseItem];
        if (!purchase) return;

        purchase.items = [
          {
            id: createId(),
            title: value(data, "title"),
            image: value(data, "image"),
            link: value(data, "link"),
            buttonLabel: value(data, "buttonLabel"),
            description: value(data, "description"),
          },
          ...purchase.items,
        ];
      }

      if (itemForm) {
        const data = new FormData(itemForm);
        const purchase = state.purchase[itemForm.dataset.purchaseType];
        const book = purchase && purchase.items.find((item) => item.id === itemForm.dataset.purchaseItemId);
        if (!book) return;

        book.title = value(data, "title");
        book.image = value(data, "image");
        book.link = value(data, "link");
        book.buttonLabel = value(data, "buttonLabel");
        book.description = value(data, "description");
      }

      saveState(state);
      renderPurchaseAdmin();
    });

    purchaseAdminList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-purchase-item]");
      if (!button) return;

      const purchase = state.purchase[button.dataset.purchaseType];
      if (!purchase) return;

      purchase.items = purchase.items.filter((item) => item.id !== button.dataset.removePurchaseItem);
      saveState(state);
      renderPurchaseAdmin();
    });
  }

  if (diaryAdminList) {
    diaryAdminList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-diary]");
      if (!button) return;
      state.diary = state.diary.filter((note) => note.id !== button.dataset.removeDiary);
      saveState(state);
      renderDiaryAdmin();
    });
  }

  if (adminMessages) {
  adminMessages.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-reply-to]");
    if (!form) return;
    event.preventDefault();

    const message = messages.find((item) => item.id === form.dataset.replyTo);
    const replyText = value(new FormData(form), "reply");
    if (!message || !replyText) return;

    message.replies.push({
      emoji: "✒",
      name: "Flora",
      text: replyText,
      createdAt: new Date().toISOString(),
    });

    appendReply(message.id, message.replies[message.replies.length - 1], messages);
    form.reset();
    renderAdminMessages();
  });

  adminMessages.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-message]");
    if (!button) return;

    const messageId = button.dataset.removeMessage;
    messages = messages.filter((message) => message.id !== messageId);
    removeMessage(messageId, messages);
    renderAdminMessages();
  });
  }

  if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    await signOutAdmin();
    window.location.href = "login.html";
  });
  }

  fillBookForm();
  fillHeroForm();
  fillMusicForm();
  renderDiaryAdmin();
  renderExtrasAdmin();
  renderPurchaseAdmin();
  renderAdminMessages();

  subscribeState((nextState) => {
    state = nextState;
    fillBookForm();
    fillHeroForm();
    fillMusicForm();
    renderDiaryAdmin();
    renderExtrasAdmin();
    renderPurchaseAdmin();
  });

  subscribeMessages((nextMessages) => {
    messages = nextMessages;
    renderAdminMessages();
  });
}
