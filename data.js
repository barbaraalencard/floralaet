(function () {
  const stateKey = "flora-site-state";
  const messageKey = "flora-reader-messages";
  const welcomeKey = "flora-skip-welcome";
  const lastVisitKey = "flora-last-visit";
  const adminSessionKey = "flora-admin-session";
  const adminPassword = "flora2026";

  function createId() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

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
    extras: [
      {
        id: createId(),
        label: "ilustrações",
        title: "Ilustrações",
        description: "Retratos, cantinhos e referências visuais do universo.",
        image: "assets/escrivaninha-collage.png",
        locked: false,
      },
      {
        id: createId(),
        label: "mapas",
        title: "Mapas",
        description: "Locais importantes para acompanhar a jornada sem se perder.",
        image: "assets/escrivaninha-collage.png",
        locked: false,
      },
      {
        id: createId(),
        label: "árvore genealógica",
        title: "Famílias",
        description: "Conexões, sobrenomes e pequenos segredos sem spoilers grandes.",
        image: "assets/escrivaninha-collage.png",
        locked: false,
      },
      {
        id: createId(),
        label: "cenas extras",
        title: "Cenas extras",
        description: "Bilhetes guardados para quando o manuscrito avançar mais.",
        image: "assets/escrivaninha-collage.png",
        locked: true,
      },
    ],
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

  function mergeState(stored) {
    return {
      ...defaultState,
      ...stored,
      book: { ...defaultState.book, ...(stored && stored.book) },
      music: { ...defaultState.music, ...(stored && stored.music) },
      diary: Array.isArray(stored && stored.diary) ? stored.diary : defaultState.diary,
      extras: Array.isArray(stored && stored.extras) ? stored.extras : defaultState.extras,
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
    localStorage.setItem(stateKey, JSON.stringify(state));
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

  window.FloraData = {
    adminPassword,
    adminSessionKey,
    createId,
    lastVisitKey,
    loadMessages,
    loadState,
    messageKey,
    saveMessages,
    saveState,
    stateKey,
    welcomeKey,
  };
})();
