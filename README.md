# HelpDesk Acadêmico

Projeto didático da Nova Roma para praticar a integração de um frontend React com uma API HTTP e um banco SQLite. Na interface, você pode abrir chamados, pesquisar pelo título, filtrar por situação, resolver, reabrir e excluir.

## Como executar

Você precisa de **Git** e **Node.js 24 ou superior** com npm.

```sh
git clone https://github.com/thomas210/template-repo-react.git helpdesk-academico
cd helpdesk-academico
npm ci
```

Na raiz, copie `.env.example` para `.env`. No PowerShell, use `Copy-Item .env.example .env`. No macOS ou Linux, use `cp .env.example .env`. O arquivo define a URL usada pelo frontend.

```env
VITE_API_URL=http://localhost:3000
```

Abra dois terminais na raiz do repositório e mantenha os dois processos rodando.

| Terminal | Comando | Endereço |
| --- | --- | --- |
| Backend | `npm run start --prefix backend` | `http://localhost:3000/chamados` |
| Frontend | `npm run dev` | Use o endereço exibido pelo Vite, geralmente `http://localhost:5173` |

Na primeira execução, o backend cria o arquivo `backend/chamados.sqlite` com a lista vazia. Se alterar o `.env`, reinicie o Vite.

## Primeiro teste

1. Abra a interface, digite **Projetor sem imagem**, selecione **Equipamentos** e clique em **Adicionar chamado**.
2. Recarregue a página e confirme que o chamado continua na lista.
3. Clique em **Resolver** e abra `http://localhost:3000/chamados` no navegador. Observe que o campo `resolvido` está como `true`.
4. Volte à interface, reabra o chamado e depois exclua. Atualize a página da API para conferir o resultado.

## Onde está cada parte

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| [src/App.jsx](src/App.jsx) | Carrega os chamados, mantém o estado da tela e atualiza a lista após a resposta do servidor. |
| [src/components/](src/components/) | Contém o formulário de criação e o cartão de cada chamado. |
| [src/services/chamadosApi.js](src/services/chamadosApi.js) | Monta a URL e faz as requisições com `fetch`. |
| [backend/server.js](backend/server.js) | Recebe as requisições HTTP e consulta ou altera o SQLite. |
| [backup-localstorage/](backup-localstorage/) | Preserva a versão que salva os chamados no navegador. |

## Como o React conversa com a API

Ao abrir a tela, o `App.jsx` chama `listarChamados`. O serviço envia um `GET /chamados`, o backend lê o SQLite e responde com JSON. O React usa `setChamados` para renderizar os dados recebidos. Na criação e nas alterações, a tela espera a confirmação do servidor antes de atualizar a lista.

| Ação | Rota | Corpo da requisição | Resposta de sucesso |
| --- | --- | --- | --- |
| Listar | `GET /chamados` | — | `200` com uma lista |
| Criar | `POST /chamados` | `{"titulo":"Projetor sem imagem","categoria":"Equipamentos"}` | `201` com o chamado criado, seu ID e o status inicial |
| Resolver ou reabrir | `PATCH /chamados/:id` | `{"resolvido":true}` ou `{"resolvido":false}` | `200` com o chamado atualizado |
| Excluir | `DELETE /chamados/:id` | — | `204` sem corpo |

Nas duas últimas rotas, substitua `:id` pelo identificador retornado pela API. Para acompanhar as requisições disparadas pela interface, abra as ferramentas de desenvolvedor do navegador e vá à aba **Rede** (*Network*).

## Versão com armazenamento no navegador

Para comparar as duas implementações, abra outro terminal na raiz e execute:

```sh
cd backup-localstorage
npm ci
npm run dev
```

Essa versão roda sozinha e usa o `localStorage` do navegador. Compare o `App.jsx` dela com o da raiz e observe onde cada versão carrega e salva os chamados. Cada versão usa seu próprio armazenamento.
