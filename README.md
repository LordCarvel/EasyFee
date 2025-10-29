# EasyFee

Frontend do projeto EasyFee (React + Vite).

Este README explica como o deploy está configurado e como publicar o site.

## Deploy

Existem duas formas de publicar este site:

1) Deploy automático via GitHub Actions (recomendado)

- Há um workflow em `.github/workflows/deploy.yml` que roda em `push` para a branch `main`.
- O workflow faz `npm ci`, `npm run build` e publica o diretório `dist/` na branch `gh-pages` usando `JamesIves/github-pages-deploy-action`.
- Você não precisa fazer nada manualmente: basta dar push para `main` e o Actions cuidará do resto.

2) Deploy manual (local)

- Caso queira publicar localmente (por exemplo para testes), o projeto tem scripts para isso.
- Instale dependências:

```bash
npm install
```

- Gerar build:

```bash
npm run build
```

- Publicar localmente (usa `gh-pages`):

```bash
npm run deploy:local
```

Observação: o script `npm run deploy` foi alterado para evitar deploys acidentais porque o CI já faz o deploy automaticamente; use `deploy:local` para publicar manualmente.

## Domínio customizado (CNAME)

Se você quer usar um domínio próprio, adicione um arquivo `CNAME` na raiz do repositório contendo apenas o domínio (ex: `app.example.com`). O workflow atual publicará o `CNAME` automaticamente se estiver presente.

> Dica: não crie o arquivo `CNAME` até ter o domínio apontado para GitHub Pages (CNAME incorreto pode causar comportamento inesperado).

## Observações finais

- Base do Vite: `vite.config.js` já está configurado com `base: '/EasyFee/'` para funcionar em `https://<username>.github.io/EasyFee`.
- Se preferir que eu ajuste o fluxo (ex: publicar no branch `gh-pages` automaticamente somente em tags, ou usar um domínio customizado diretamente), me avise.
