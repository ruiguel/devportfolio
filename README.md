# DevPortfolio – Plataforma de Portfólios para Programadores

## Versão Escolhida
**Versão B**: HTML5 + CSS3 + JavaScript (ES6+) com backend Node.js + Express + Turso (`@libsql/client`) e autenticação baseada em JWT.

## Credenciais de Acesso (Formador)
* **E-mail**: `formador@formador.com`
* **Password**: `Formador_2026Belem`

Esta conta é criada/atualizada automaticamente ao correr `npm run setup` (ver abaixo) — cada execução sincroniza a password com o valor aqui configurado.

## Tecnologias Utilizadas
* Frontend: HTML5, CSS3 (variáveis CSS para tema claro/escuro, mobile-first), JavaScript ES6+ (módulos, `fetch`)
* Backend: Node.js, Express
* Base de dados: Turso (libSQL, compatível com SQLite)
* Autenticação: JWT (`jsonwebtoken`) + passwords com hash (`bcrypt`)

## Estrutura da Base de Dados
Ver `server/db/schema.sql`. Tabelas: `users`, `technologies`, `projects`, `project_technologies` (relação muitos-para-muitos entre projetos e tecnologias).

## Como Executar o Projeto Localmente

1. Instalar as dependências:
   ```bash
   npm install
   ```

2. Criar o ficheiro `.env` a partir do exemplo e preencher com as credenciais da tua base de dados Turso:
   ```bash
   cp .env.example .env
   ```
   Precisas de `DATABASE_URL` e `DATABASE_AUTH_TOKEN` (obtidos em https://app.turso.tech, na página da tua base de dados, em "Connect") e de um `JWT_SECRET` à tua escolha.

3. Inicializar a base de dados (cria as tabelas em falta, aplica migrações de colunas novas e cria a conta do formador):
   ```bash
   npm run setup
   ```
   Este passo é seguro de repetir — não duplica dados já existentes.

4. Iniciar o servidor:
   ```bash
   npm start
   ```
   (ou `npm run dev` para reiniciar automaticamente ao gravar ficheiros)

5. Abrir **http://localhost:3000** no navegador (não abrir os ficheiros HTML diretamente com duplo clique, pois os módulos JS e as chamadas à API não funcionam via `file://`).

## Funcionalidades Implementadas

### Área Pública (sem login)
* Página inicial com apresentação e projetos.
* Lista de portefólios (`portfolios.html`) com **filtro por tecnologia**.
* Página de detalhe dinâmico de cada projeto, carregada da base de dados Turso.
* Registo e login de novos utilizadores.
* Tema claro/escuro com persistência (`localStorage`), disponível em todas as páginas.
* Design responsivo (mobile / tablet / desktop).
* Página de erro 404 personalizada.

### Área de Administração (protegida por login)
* Acesso restrito a utilizadores autenticados — tanto contas de formandos como a conta do formador. O lado do cliente verifica o token JWT antes de mostrar qualquer página do dashboard (`public/js/guard.js`), e o servidor recusa qualquer pedido de escrita sem um token válido.
* CRUD completo de projetos: criar, listar, **editar** e **eliminar**, incluindo gestão das tecnologias associadas (tecnologias novas são criadas automaticamente ao serem escritas no formulário).
* Gestão de perfil (nome, biografia, GitHub, LinkedIn).
* Validação de dados no backend em todas as rotas de escrita (título/descrição obrigatórios e com limites de tamanho, e-mail válido, password com o mínimo de caracteres, etc.).
* Tratamento de erros com respostas claras e estados de carregamento/feedback visual no frontend.

## Rotas da API

| Método | Rota                     | Proteção   | Descrição                                  |
|--------|--------------------------|------------|---------------------------------------------|
| POST   | `/api/auth/register`     | Pública    | Regista um novo utilizador                  |
| POST   | `/api/auth/login`        | Pública    | Autentica e devolve um token JWT            |
| GET    | `/api/projects`          | Pública    | Lista projetos (`?tech=nome` filtra por tecnologia) |
| GET    | `/api/projects/:id`      | Pública    | Detalhe de um projeto                       |
| POST   | `/api/projects`          | Protegida  | Cria um projeto                             |
| PUT    | `/api/projects/:id`      | Protegida  | Atualiza um projeto                         |
| DELETE | `/api/projects/:id`      | Protegida  | Elimina um projeto                          |
| GET    | `/api/technologies`      | Pública    | Lista tecnologias existentes                |
| POST   | `/api/technologies`      | Protegida  | Cria uma tecnologia                         |
| GET    | `/api/users/profile`     | Protegida  | Dados do utilizador autenticado             |
| PUT    | `/api/users/profile`     | Protegida  | Atualiza o perfil do utilizador autenticado |

## Notas de Arquitetura e Decisões
* A ligação à base de dados (`server/db/connection.js`) tenta novamente uma vez, automaticamente, em caso de falha transitória de rede, para reduzir problemas de ligação intermitente com o Turso (comum em bases de dados no plano gratuito).
* Qualquer utilizador autenticado (formando ou formador) pode gerir todos os projetos a partir do dashboard — não existe isolamento de dados por utilizador, uma vez que a plataforma foi pensada como o portefólio único de um formando, exposto publicamente, com o formador a poder validar/testar a área de administração com a sua própria conta.
* A ligação entre projetos e tecnologias faz "find-or-create" pelo nome, para simplificar o formulário do dashboard (basta escrever os nomes separados por vírgula).

## Nota sobre Dados já Existentes no Turso
Se já tinhas projetos na tua base de dados Turso antes desta atualização (como os 3 projetos associados ao utilizador `id=2`), o `npm run setup` **não os apaga** — apenas acrescenta as colunas novas que faltavam (o schema anterior não tinha, por exemplo, `password` em `users`). Esse utilizador antigo fica sem password definida, porque essa coluna não existia antes, e por isso não vai conseguir fazer login diretamente. Para continuares a gerir esses projetos a partir do dashboard, tens duas opções simples:
* Regista uma conta nova (`register.html`) e, na consola SQL do Turso, atualiza `projects.userId` desses 3 projetos para o `id` da tua conta nova; ou
* Define uma password diretamente para o utilizador antigo através da consola SQL do Turso (precisas de gerar um hash bcrypt, por exemplo correndo `node -e "require('bcrypt').hash('a-tua-password',10).then(console.log)"` localmente e colando o resultado na coluna `password`).

## Deploy
O deploy pode ser feito em qualquer serviço compatível com Node.js (Render, Railway, Vercel, Fly.io, etc.). Passos genéricos:

1. Cria um novo Web Service e liga o repositório Git deste projeto.
2. Comando de build: `npm install`. Comando de arranque: `npm start`.
3. Define as variáveis de ambiente `DATABASE_URL`, `DATABASE_AUTH_TOKEN` e `JWT_SECRET` no painel do serviço (os mesmos valores do teu `.env`).
4. Depois do primeiro deploy, corre `npm run setup` uma vez (via consola/SSH do serviço, ou localmente apontando para a mesma base de dados) para garantir que a conta do formador existe.
5. Confirma que o site abre corretamente no link público (página inicial, login e área de administração).

**Link do projeto em produção:** `<preencher depois do deploy>`

## Estrutura de Pastas
```
devportfolio/
├── public/            # Frontend estático (HTML, CSS, JS)
│   ├── dashboard/      # Área de administração (protegida)
│   ├── css/
│   ├── js/
│   └── projetos/       # Mini-projetos exportados do curso, ligados via liveUrl
├── server/             # Backend Node.js / Express
│   ├── db/             # Ligação Turso, schema e seed
│   ├── middleware/      # Autenticação (JWT) e validação
│   └── routes/          # auth, projects, users, technologies
├── .env.example
└── README.md
```
