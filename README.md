# Cantinho da Flora Laet

Primeira versao do site para leitoras, baseada no briefing do chat compartilhado.

## O que ja existe

- Tela de boas-vindas com animacao de pena escrevendo e opcao de nao mostrar novamente.
- Pagina inicial com progresso de `Herdeiros de Mayfair III`.
- Imagem inicial editavel pelo painel da autora.
- Mural publico com nome, emoji, mensagem e respostas, pronto para sincronizar com Firebase.
- Diario com bilhetes curtos no estilo "Tumblr moderno".
- Extras fixos e clicaveis: ilustracoes, mapas, arvore genealogica e cenas extras.
- Cada pagina de extra permite publicar varios itens internos pelo painel.
- Paginas de compra para livros fisicos e digitais, com varios livros cadastraveis em cada uma.
- Card lateral com playlist do Spotify, editavel pelo painel.
- Login em `login.html` e painel em `admin.html`.
- Painel para atualizar progresso, trocar senha, publicar bilhetes, editar extras, cadastrar livros e responder ao mural.
- Dados salvos localmente enquanto o Firebase nao estiver configurado.
- Integracao preparada com Firebase Auth e Firestore para salvar progresso, diario, extras, livros e mural na nuvem.

## Como testar

Abra `index.html` no navegador ou rode um servidor local simples dentro desta pasta.

Senha inicial do painel: `flora2026`

## Firebase

Para ativar a base online, siga o guia em `FIREBASE_SETUP.md` e preencha `firebase-config.js`.
