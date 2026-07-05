# Configuracao do Firebase

O site ja esta preparado para salvar dados no Firebase. Antes de publicar de verdade, faca estes passos no console do Firebase.

## 1. Criar o projeto

1. Acesse https://console.firebase.google.com.
2. Crie um projeto.
3. Adicione um app Web.
4. Copie o objeto `firebaseConfig`.
5. Cole os valores em `firebase-config.js`.

## 2. Ativar login da autora

1. Entre em Authentication.
2. Ative o provedor Email/senha.
3. Crie uma usuaria para voce.
4. Coloque esse e-mail em `window.FloraFirebaseAdminEmail`, dentro de `firebase-config.js`.

## 3. Ativar Firestore

1. Entre em Firestore Database.
2. Crie o banco em modo de producao.
3. Na colecao `admins`, crie um documento com o UID da sua usuaria do Authentication.
4. Nesse documento, pode colocar um campo simples, por exemplo:

```text
role: admin
```

## 4. Publicar as regras

Copie o conteudo de `firestore.rules` para a aba Rules do Firestore e publique.

Essas regras deixam:

- qualquer leitora ler o site;
- qualquer leitora enviar cartas e respostas simples no mural;
- apenas a autora logada alterar progresso, diario, extras, links de compra e apagar mensagens.

## 5. Levar seus dados atuais para a nuvem

Depois de configurar:

1. Abra o site no navegador onde voce vinha editando tudo.
2. Entre na area da Flora com o e-mail e senha do Firebase.
3. Ao abrir o painel, as mensagens locais sao migradas para a nuvem se o Firestore ainda estiver vazio.
4. Ao salvar qualquer parte do painel, o estado completo do site tambem passa a ficar no Firestore.

## Observacao sobre imagens

Caminhos do seu computador, como `C:\...`, nao vao aparecer para leitoras em outros aparelhos. Use uma URL publica de imagem ou uma imagem que ja esteja na pasta `assets/` do site publicado.
