(function () {
  const stateKey = "flora-site-state";
  const messageKey = "flora-reader-messages";
  const welcomeKey = "flora-skip-welcome";
  const lastVisitKey = "flora-last-visit";
  const adminSessionKey = "flora-admin-session";
  const passwordKey = "flora-admin-password";
  const defaultAdminPassword = "flora2026";

  function createId() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
        link: "https://example.com/livros-fisicos",
        buttonLabel: "abrir livraria",
      },
      digital: {
        title: "E-books",
        description: "Links para comprar as versões digitais dos livros.",
        image: "assets/escrivaninha-collage.png",
        link: "https://example.com/ebooks",
        buttonLabel: "abrir loja digital",
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

  function normalizeExtras(extras) {
    const incoming = Array.isArray(extras) ? extras : [];

    return defaultExtras.map((fallback, index) => {
      const stored = incoming.find((item) => item.id === fallback.id) || incoming[index] || {};
      return { ...fallback, ...stored, id: fallback.id, page: fallback.page };
    });
  }

  function mergeState(stored) {
    return {
      ...defaultState,
      ...stored,
      book: { ...defaultState.book, ...(stored && stored.book) },
      hero: { ...defaultState.hero, ...(stored && stored.hero) },
      music: { ...defaultState.music, ...(stored && stored.music) },
      purchase: {
        physical: {
          ...defaultState.purchase.physical,
          ...(stored && stored.purchase && stored.purchase.physical),
        },
        digital: {
          ...defaultState.purchase.digital,
          ...(stored && stored.purchase && stored.purchase.digital),
        },
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
