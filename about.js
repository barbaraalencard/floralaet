let siteState = window.FloraData.loadState();

const fallbackImage = "assets/chibi-flora.png";
const aboutPhoto = document.querySelector("#aboutPhoto");
const aboutDescription = document.querySelector("#aboutDescription");

function renderAbout() {
  const about = siteState.about || {};

  if (aboutPhoto) {
    aboutPhoto.onerror = () => {
      aboutPhoto.onerror = null;
      aboutPhoto.src = fallbackImage;
    };
    aboutPhoto.src = about.photo || fallbackImage;
    aboutPhoto.alt = "Foto da autora Flora Laet";
    aboutPhoto.dataset.fit = about.photoFit === "cover" ? "cover" : "contain";
  }

  if (aboutDescription) {
    aboutDescription.textContent = about.description || "";
  }
}

renderAbout();

window.FloraData.subscribeState((nextState) => {
  siteState = nextState;
  renderAbout();
});
