let state = window.FloraData.loadState();
const fallbackImage = "assets/escrivaninha-collage.png";

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || "";
}

function setImage(selector, src, alt) {
  const image = document.querySelector(selector);
  if (!image) return;

  image.src = src || fallbackImage;
  image.alt = alt || "";
}

function renderEmpty(target, text) {
  const empty = createElement("p", "detail-empty", text);
  target.append(empty);
}

function openImageViewer(src, alt) {
  const overlay = document.querySelector("#imageLightbox");
  const image = document.querySelector("#imageLightboxImage");
  if (!overlay || !image) return;

  image.src = src || fallbackImage;
  image.alt = alt || "";
  overlay.hidden = false;
  document.body.classList.add("lightbox-open");
}

function setupImageViewer() {
  if (document.querySelector("#imageLightbox")) return;

  const overlay = createElement("div", "image-lightbox");
  overlay.id = "imageLightbox";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Imagem ampliada");

  const close = createElement("button", "image-lightbox-close", "fechar");
  close.type = "button";
  const image = document.createElement("img");
  image.id = "imageLightboxImage";
  image.alt = "";

  overlay.append(close, image);
  document.body.append(overlay);

  function closeViewer() {
    overlay.hidden = true;
    document.body.classList.remove("lightbox-open");
  }

  close.addEventListener("click", closeViewer);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeViewer();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) closeViewer();
  });
}

function createZoomableImage(src, alt) {
  const button = document.createElement("button");
  button.className = "detail-image-button";
  button.type = "button";
  button.setAttribute("aria-label", "abrir imagem em tamanho maior");

  const img = document.createElement("img");
  img.src = src || fallbackImage;
  img.alt = alt || "";

  button.append(img);
  button.addEventListener("click", () => openImageViewer(img.src, img.alt));
  return button;
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

function renderExtraItems(extra) {
  const list = document.querySelector("#detailItems");
  if (!list) return;

  list.replaceChildren();

  if (!extra.items || !extra.items.length) {
    renderEmpty(list, "Ainda não há conteúdos publicados aqui.");
    return;
  }

  extra.items.forEach((item) => {
    const article = createElement("article", "detail-item-card");
    const imageButton = createZoomableImage(item.image, item.title);
    const title = createElement("h2", null, item.title);
    const description = item.description ? createElement("p", "detail-item-description", item.description) : null;
    const content = item.content ? createElement("p", null, item.content) : null;

    article.append(imageButton, title);
    if (description) article.append(description);
    if (content) article.append(content);
    list.append(article);
  });
}

function renderLockedExtra() {
  const list = document.querySelector("#detailItems");
  if (!list) return;

  list.replaceChildren();

  const note = createElement("div", "locked-detail");
  const title = createElement("strong", null, "guardado na gaveta");
  const text = createElement(
    "p",
    null,
    "Essa página ainda está reservada pela Flora. Quando chegar a hora, ela aparece por aqui.",
  );

  note.append(title, text);
  list.append(note);
}

function renderPurchaseItems(purchase) {
  const list = document.querySelector("#bookList");
  if (!list) return;

  list.replaceChildren();

  if (!purchase.items || !purchase.items.length) {
    renderEmpty(list, "Ainda não há livros cadastrados nesta seção.");
    return;
  }

  purchase.items.forEach((book) => {
    const article = createElement("article", "book-card");
    const img = document.createElement("img");
    img.src = book.image || fallbackImage;
    img.alt = book.title || "";

    const title = createElement("h2", null, book.title);
    const description = createElement("p", null, book.description);
    const link = createElement("a", "button primary", book.buttonLabel || "comprar");
    link.href = book.link || "#";
    link.target = "_blank";
    link.rel = "noreferrer";

    article.append(img, title, description, link);
    list.append(article);
  });
}

function renderExtraPage(extraId) {
  const extra = state.extras.find((item) => item.id === extraId);
  if (!extra) return;

  document.title = `${extra.title} | Flora Laet`;
  setText("#detailLabel", extra.label);
  setText("#detailTitle", extra.title);
  setText("#detailDescription", extra.description);
  setImage("#detailImage", extra.image, extra.title);

  if (extra.locked) {
    document.body.classList.add("locked-detail-page");
    setText("#detailContent", "Conteúdo guardado para as leitoras descobrirem depois.");
    renderLockedExtra();
    return;
  }

  setText("#detailContent", extra.content);
  renderExtraItems(extra);
}

function renderPurchasePage(purchaseType) {
  const purchase = state.purchase && state.purchase[purchaseType];
  if (!purchase) return;

  document.title = `${purchase.title} | Flora Laet`;
  setText("#detailLabel", purchaseType === "physical" ? "livros físicos" : "livros digitais");
  setText("#detailTitle", purchase.title);
  setText("#detailDescription", purchase.description);
  setText("#detailContent", "Escolha abaixo o livro que você quer comprar.");
  setImage("#detailImage", purchase.image, purchase.title);
  renderPurchaseItems(purchase);
}

const { extraId, purchaseType } = document.body.dataset;

function renderCurrentPage() {
  document.body.classList.toggle("extra-detail-page", Boolean(extraId));
  document.body.classList.toggle("purchase-detail-page", Boolean(purchaseType));
  if (extraId) renderExtraPage(extraId);
  if (purchaseType) renderPurchasePage(purchaseType);
}

setupImageViewer();
setupScrollTopButton();
renderCurrentPage();

window.FloraData.subscribeState((nextState) => {
  state = nextState;
  renderCurrentPage();
});
