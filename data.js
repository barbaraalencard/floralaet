(function () {
  const stateKey = "flora-site-state";
  const messageKey = "flora-reader-messages";
  const welcomeKey = "flora-skip-welcome";
  const lastVisitKey = "flora-last-visit";
  const adminSessionKey = "flora-admin-session";
  const passwordKey = "flora-admin-password";
  const defaultAdminPassword = "flora2026";

  function createId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function defaultExtraItem(id, title, description, content) {
    return {
      id,
      title,
      description,
      content,
      image: "assets/escrivaninha-collage.png",
    };
  }

  const defaultExtras = [
    {
      id: "ilustracoes",
      label: "ilustrações",
      title: "Ilustrações",
      description: "Retratos, cantinhos e referências visuais do universo.",
      content:
        "Use esta página para reunir ilustrações oficiais, fanarts autorizadas e imagens de referência dos livros.",
      image: "assets/escrivaninha-collage.png",
      page: "extra-ilustracoes.html",
      locked: false,
      items: [
        defaultExtraItem(
          "ilustracoes-1",
          "Primeira inspiração",
          "Um cantinho visual para abrir a galeria.",
          "Substitua este item pela primeira ilustração oficial quando quiser.",
        ),
      ],
    },
    {
      id: "mapas",
      label: "mapas",
      title: "Mapas",
      description: "Locais importantes para acompanhar a jornada sem se perder.",
      content:
        "Aqui podem entrar mapas, rotas, casas, cidades e pequenos guias geográficos do universo dos livros.",
      image: "assets/escrivaninha-collage.png",
      page: "extra-mapas.html",
      locked: false,
      items: [
        defaultExtraItem(
          "mapas-1",
          "Mapa em preparação",
          "Um espaço reservado para o primeiro mapa do universo.",
          "Cadastre aqui mapas, rotas e lugares importantes quando estiverem prontos.",
        ),
      ],
    },
    {
      id: "arvore",
      label: "árvore genealógica",
      title: "Famílias",
      description: "Conexões, sobrenomes e pequenos segredos sem spoilers grandes.",
      content:
        "Esta página fica reservada para árvores genealógicas, laços familiares e relações importantes.",
      image: "assets/escrivaninha-collage.png",
      page: "extra-arvore.html",
      locked: false,
      items: [
        defaultExtraItem(
          "arvore-1",
          "Primeira família",
          "O primeiro painel familiar pode entrar aqui.",
          "Adicione imagens, resumos e observações sobre personagens e linhagens.",
        ),
      ],
    },
    {
      id: "cenas",
      label: "cenas extras",
      title: "Cenas extras",
      description: "Bilhetes guardados para quando o manuscrito avançar mais.",
      content:
        "Guarde aqui cenas deletadas, cartas de personagens, capítulos bônus e pequenos presentes para as leitoras.",
      image: "assets/escrivaninha-collage.png",
      page: "extra-cenas.html",
      locked: true,
      items: [
        defaultExtraItem(
          "cenas-1",
          "Cena guardada",
          "Um espaço reservado para a primeira cena extra.",
          "Quando chegar a hora, publique aqui uma cena, carta ou capítulo bônus.",
        ),
      ],
    },
  ];

  const defaultState = {
    book: {
      title: "Herdeiros de Mayfair III",
      progress: 63,
      lastUpdate: "25 de junho",
      currentChapter: 17,
      totalChapters: 27,
      nextMilestone: "capítulo 18",
      quote: '"Toda história tem seu tempo. A nossa está sendo escrita."',
    },
    hero: {
      image: "assets/escrivaninha-collage.png",
      alt: "Colagem de papéis, fotos e objetos de escrita na escrivaninha",
      sideImages: [
        {
          image: "assets/hero-side-1.png",
          alt: "Detalhe delicado de papéis e rabiscos da escrivaninha",
        },
        {
          image: "assets/hero-side-2.png",
          alt: "Detalhe de anotações e flores em clima de romance",
        },
      ],
    },
    music: {
      title: "no fone agora",
      caption: "playlist provisória da escrivaninha",
      spotifyUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator",
    },
    diary: [
      {
        id: createId(),
        date: "25/06",
        time: "10:42",
        text: "Hoje escrevi uma cena que me deixou com o coração acelerado. Mal posso esperar para vocês conhecerem!",
      },
      {
        id: createId(),
        date: "23/06",
        time: "22:15",
        text: "Capítulo 17 concluído! Foi um dos mais difíceis até aqui.",
      },
      {
        id: createId(),
        date: "21/06",
        time: "18:30",
        text: "Descobri um novo lugar perfeito para uma cena importante. A pesquisa histórica é viciante.",
      },
    ],
    extras: defaultExtras,
    purchase: {
      physical: {
        title: "Livros físicos",
        description: "Links para comprar os livros impressos da Flora.",
        image: "assets/escrivaninha-collage.png",
        items: [
          {
            id: "fisicos-1",
            title: "Livro físico 1",
            description: "Edite este card com o nome, capa e link do livro físico.",
            image: "assets/escrivaninha-collage.png",
            link: "https://example.com/livros-fisicos",
            buttonLabel: "comprar físico",
          },
        ],
      },
      digital: {
        title: "E-books",
        description: "Links para comprar as versões digitais dos livros.",
        image: "assets/escrivaninha-collage.png",
        items: [
          {
            id: "digitais-1",
            title: "E-book 1",
            description: "Edite este card com o nome, capa e link do e-book.",
            image: "assets/escrivaninha-collage.png",
            link: "https://example.com/ebooks",
            buttonLabel: "comprar e-book",
          },
        ],
      },
    },
  };

  const defaultMessages = [
    {
      id: createId(),
      emoji: "🌷",
      name: "Ana Clara",
      text: "Estou ansiosa por Herdeiros de Mayfair III! A cada capítulo fico mais apaixonada pela história.",
      createdAt: "2026-06-25T10:32:00.000Z",
      replies: [
        {
          emoji: "✒",
          name: "Flora",
          text: "Prometo que essa espera vai valer a pena.",
        },
      ],
    },
    {
      id: createId(),
      emoji: "🌸",
      name: "Júlia",
      text: "Flora, seus livros são meu abraço nos dias difíceis. Obrigada por existir e compartilhar tanto com a gente!",
      createdAt: "2026-06-25T11:05:00.000Z",
      replies: [],
    },
    {
      id: createId(),
      emoji: "⭐",
      name: "Marina",
      text: "Também estou amando! Esse universo é simplesmente perfeito. Já estou contando os dias para o próximo capítulo!",
      createdAt: "2026-06-25T12:00:00.000Z",
      replies: [],
    },
  ];

  function normalizeExtraItems(items, fallbackItems) {
    const incoming = Array.isArray(items) ? items : fallbackItems;

    return incoming.map((item) => ({
      id: item.id || createId(),
      title: item.title || "Novo conteúdo",
      description: item.description || "",
      content: item.content || "",
      image: item.image || "assets/escrivaninha-collage.png",
    }));
  }

  function normalizeExtras(extras) {
    const incoming = Array.isArray(extras) ? extras : [];

    return defaultExtras.map((fallback, index) => {
      const stored = incoming.find((item) => item.id === fallback.id) || incoming[index] || {};
      return {
        ...fallback,
        ...stored,
        id: fallback.id,
        page: fallback.page,
        items: normalizeExtraItems(stored.items, fallback.items),
      };
    });
  }

  function normalizePurchaseItems(storedData, fallbackData) {
    if (Array.isArray(storedData.items)) {
      return storedData.items.map((item) => ({
        id: item.id || createId(),
        title: item.title || "Novo livro",
        description: item.description || "",
        image: item.image || "assets/escrivaninha-collage.png",
        link: item.link || "#",
        buttonLabel: item.buttonLabel || "comprar",
      }));
    }

    if (storedData.link) {
      return [
        {
          id: createId(),
          title: storedData.title || fallbackData.title,
          description: storedData.description || fallbackData.description,
          image: storedData.image || fallbackData.image,
          link: storedData.link,
          buttonLabel: storedData.buttonLabel || "comprar",
        },
      ];
    }

    return fallbackData.items.map((item) => ({ ...item }));
  }

  function normalizePurchaseCategory(stored, key) {
    const fallback = defaultState.purchase[key];
    const storedData = (stored && stored.purchase && stored.purchase[key]) || {};

    return {
      ...fallback,
      ...storedData,
      title: storedData.title || fallback.title,
      description: storedData.description || fallback.description,
      image: storedData.image || fallback.image,
      items: normalizePurchaseItems(storedData, fallback),
    };
  }

  function normalizeHero(stored) {
    const storedHero = (stored && stored.hero) || {};
    const fallbackSideImages = defaultState.hero.sideImages;
    const incomingSideImages = Array.isArray(storedHero.sideImages) ? storedHero.sideImages : [];

    return {
      ...defaultState.hero,
      ...storedHero,
      image: storedHero.image || defaultState.hero.image,
      alt: storedHero.alt || defaultState.hero.alt,
      sideImages: fallbackSideImages.map((fallback, index) => ({
        ...fallback,
        ...(incomingSideImages[index] || {}),
        image: (incomingSideImages[index] && incomingSideImages[index].image) || fallback.image,
        alt: (incomingSideImages[index] && incomingSideImages[index].alt) || fallback.alt,
      })),
    };
  }

  function mergeState(stored) {
    return {
      ...defaultState,
      ...stored,
      book: { ...defaultState.book, ...(stored && stored.book) },
      hero: normalizeHero(stored),
      music: { ...defaultState.music, ...(stored && stored.music) },
      purchase: {
        physical: normalizePurchaseCategory(stored, "physical"),
        digital: normalizePurchaseCategory(stored, "digital"),
      },
      diary: Array.isArray(stored && stored.diary) ? stored.diary : defaultState.diary,
      extras: normalizeExtras(stored && stored.extras),
    };
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(stateKey));
      return mergeState(stored);
    } catch {
      return mergeState(null);
    }
  }

  function saveState(state) {
    localStorage.setItem(stateKey, JSON.stringify(mergeState(state)));
  }

  function loadMessages() {
    try {
      const stored = JSON.parse(localStorage.getItem(messageKey));
      return Array.isArray(stored) ? stored : defaultMessages;
    } catch {
      return defaultMessages;
    }
  }

  function saveMessages(messages) {
    localStorage.setItem(messageKey, JSON.stringify(messages));
  }

  function getAdminPassword() {
    return localStorage.getItem(passwordKey) || defaultAdminPassword;
  }

  function setAdminPassword(password) {
    localStorage.setItem(passwordKey, password);
  }

  window.FloraData = {
    adminSessionKey,
    createId,
    defaultAdminPassword,
    getAdminPassword,
    lastVisitKey,
    loadMessages,
    loadState,
    messageKey,
    passwordKey,
    saveMessages,
    saveState,
    setAdminPassword,
    stateKey,
    welcomeKey,
  };
})();
