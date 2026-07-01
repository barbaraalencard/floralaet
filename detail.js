const state = window.FloraData.loadState();
const fallbackImage = "assets/escrivaninha-collage.png";

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

function renderExtraPage(extraId) {
  const extra = state.extras.find((item) => item.id === extraId);
  if (!extra) return;

  document.title = `${extra.title} | Flora Laet`;
  setText("#detailLabel", extra.label);
  setText("#detailTitle", extra.title);
  setText("#detailDescription", extra.description);
  setText("#detailContent", extra.content);
  setImage("#detailImage", extra.image, extra.title);
}

function renderPurchasePage(purchaseType) {
  const purchase = state.purchase && state.purchase[purchaseType];
  if (!purchase) return;

  document.title = `${purchase.title} | Flora Laet`;
  setText("#detailLabel", purchaseType === "physical" ? "livros fisicos" : "livros digitais");
  setText("#detailTitle", purchase.title);
  setText("#detailDescription", purchase.description);
  setText("#detailContent", "Escolha o botao abaixo para abrir o link cadastrado pela Flora.");
  setImage("#detailImage", purchase.image, purchase.title);

  const link = document.querySelector("#purchaseLink");
  if (link) {
    link.href = purchase.link || "#";
    link.textContent = purchase.buttonLabel || "abrir link";
  }
}

const { extraId, purchaseType } = document.body.dataset;

if (extraId) renderExtraPage(extraId);
if (purchaseType) renderPurchasePage(purchaseType);
