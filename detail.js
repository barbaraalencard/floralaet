const state = window.FloraData.loadState();
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
    const img = document.createElement("img");
    img.src = item.image || fallbackImage;
    img.alt = item.title || "";

    const title = createElement("h2", null, item.title);
    const description = createElement("p", "detail-item-description", item.description);
    const content = createElement("p", null, item.content);

    article.append(img, title, description, content);
    list.append(article);
  });
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
  setText("#detailContent", extra.content);
  setImage("#detailImage", extra.image, extra.title);
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

if (extraId) renderExtraPage(extraId);
if (purchaseType) renderPurchasePage(purchaseType);
