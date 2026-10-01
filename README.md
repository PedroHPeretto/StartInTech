# StartInTech

Ache seu primeiro emprego na área de tecnologia de um jeito fácil e rápido.

---

## Descrição do Produto

O **StartInTech** é uma plataforma completa desenvolvida para conectar talentos iniciantes e profissionais em início de carreira a oportunidades de trabalho no mercado de tecnologia. A solução engloba uma interface web amigável para navegação e candidatura, uma API backend escalável e resiliente, e infraestrutura automatizada como código.
O **StartInTech** é uma plataforma completa desenvolvida para conectar talentos iniciantes e profissionais em início de carreira a oportunidades de trabalho no mercado de tecnologia. A solução engloba uma interface web amigável para navegação, análise de currículos com inteligência artificial, mapa de carreira, busca inteligente de vagas, uma API backend escalável e resiliente, e infraestrutura automatizada como código.

### Estrutura do Monorepo

O projeto está organizado no formato de monorepo gerenciado com **Bun Workspaces**:
O projeto está organizado no formato de monorepo gerenciado exclusivamente com **Bun Workspaces**:

- **`Frontend/`**: Aplicação Web desenvolvida com React 19, Vite e TypeScript. Para mais detalhes, consulte o [Frontend README](file:///home/pedroperetto/Projects/StartInTech/Frontend/README.md).
- **`Backend/`**: API RESTful construída com NestJS 12 e TypeScript. Para mais detalhes, consulte o [Backend README](file:///home/pedroperetto/Projects/StartInTech/Backend/README.md).
- **`shared/`**: Pacote de tipos, utilitários e modelos compartilhados (`@startintech/shared`) utilizado tanto pelo Frontend quanto pelo Backend.
- **`Infra/`**: Configurações de Infraestrutura como Código (IaC) utilizando Terraform para provisionamento de serviços no Google Cloud Platform (Google Cloud Run).
- **`docs/`**: Documentação de arquitetura, requisitos, modelagem de dados e identidade visual.
- **[`Frontend/`](Frontend/README.md)**: Aplicação Web (SPA) desenvolvida com React 19, Vite 8, Tailwind CSS v4 e TypeScript. Consulte o [Frontend README](Frontend/README.md).
- **[`Backend/`](Backend/README.md)**: API RESTful construída com NestJS 12, TypeORM, PostgreSQL 17 e TypeScript. Consulte o [Backend README](Backend/README.md).
- **[`shared/`](shared/)**: Pacote compartilhado (`@startintech/shared`) contendo DTOs, Enums, interfaces de domínio e tipos reutilizados entre Frontend e Backend.
- **[`Infra/`](Infra/)**: Configurações de Infraestrutura como Código (IaC) utilizando Terraform para provisionamento de recursos no Google Cloud Platform (Cloud Run, Cloud SQL, Artifact Registry).
- **[`docs/`](docs/)**: Especificações técnicas, requisitos funcionais, modelagem de dados, arquitetura e diretrizes visuais da marca.

---

## Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8 (com React Compiler & Rolldown Babel Plugins)
- **Estilização & UI**: Tailwind, Shadcn
- **Monitoramento**: Sentry for React (`@sentry/react`)

- **Framework & Biblioteca UI**: React 19 & React DOM
- **Build Tool & Bundler**: Vite 8 com React Compiler (`babel-plugin-react-compiler`) e `@rolldown/plugin-babel`
- **Estilização & Design System**: Tailwind CSS v4 (`@tailwindcss/vite`), Base UI (`@base-ui/react`), Shadcn UI, Lucide React (`lucide-react`), animações com `tw-animate-css`
- **Tipografia**: Inter (`@fontsource-variable/inter`), Comfortaa (títulos) e Plus Jakarta Sans (corpo)
- **Testes & Workshop de Componentes**: Vitest, Playwright (testes E2E headless e UI), Storybook 10.6 (`@storybook/react-vite`), MSW (`msw`, `msw-storybook-addon`)
- **Monitoramento & Observabilidade**: Sentry for React (`@sentry/react` com tracing e métricas de navegação)

### Backend

- **Framework**: NestJS 12
- **Plataforma**: Express
- **Monitoramento**: Sentry for NestJS (`@sentry/nestjs`)
- **Banco de Dados & ORM**: PostgreSQL 17, TypeORM (`@nestjs/typeorm`, `typeorm`), driver `pg`, migrações automatizadas
- **Validação & DTOs**: `class-validator`, `class-transformer`, `@nestjs/config`
- **Testes**: Vitest e Supertest
- **Monitoramento & Observabilidade**: Sentry for NestJS (`@sentry/nestjs`)

### Core & Infraestrutura
- **Linguagem**: TypeScript (v6)
- **Gerenciador de Pacotes & Runtime**: Bun (Monorepo Workspaces)
- **Infraestrutura como Código**: Terraform
- **Cloud Provider**: Google Cloud Platform (GCP - Cloud Run, Artifact Registry)
- **Qualidade de Código**: ESLint, Prettier

- **Linguagem**: TypeScript (v6) com módulos ES (NodeNext ESM)
- **Runtime & Gerenciador de Pacotes**: Bun (Monorepo Workspaces)
- **Biblioteca Compartilhada**: `@startintech/shared` (Types, DTOs e contratos de API)
- **Containerização & Ambiente Local**: Docker & Docker Compose (PostgreSQL 17 alpine, containers de build e produção)
- **Hospedagem & Deploy**: Google Cloud Run (Backend), Firebase Hosting (Frontend) e Google Artifact Registry
- **Infraestrutura como Código (IaC)**: Terraform
- **Padronização & Qualidade**: ESLint, Prettier

---

## Como Iniciar

### Pré-requisitos

- [Bun](https://bun.sh/) (v1.x — runtime e gerenciador de pacotes padrão do monorepo)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) (para executar o PostgreSQL 17 localmente e containers)
- [Git](https://git-scm.com/)
- [Terraform](https://www.terraform.io/) (necessário apenas para provisionamento de infraestrutura em nuvem)

### Passos para Execução Local

1. **Clonar o repositório e instalar dependências**:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd StartInTech
   bun install
   ```

2. **Configurar as Variáveis de Ambiente**:
   Crie o arquivo `.env` na raiz do monorepo a partir do modelo de exemplo:

   ```bash
   cp .env.example .env
   ```

   Ajuste as credenciais do banco de dados, chaves de API e DSNs do Sentry conforme o seu ambiente.

3. **Compilar o pacote compartilhado (`shared`)**:
   O pacote `@startintech/shared` deve ser compilado antes de iniciar a API ou o cliente:

   ```bash
   bun run build:shared
   ```

4. **Iniciar o Banco de Dados Local**:
   Suba o container do PostgreSQL 17 via Docker Compose:

   ```bash
   docker compose up -d postgres
   ```

5. **Executar as Migrações do Banco de Dados**:
   Execute as migrações do TypeORM para estruturar as tabelas no banco de dados:

   ```bash
   bun --cwd Backend run db:migrate
   ```

6. **Iniciar a aplicação em modo de desenvolvimento**:
   Em terminais separados (ou em segundo plano), inicialize os serviços:

   - **Frontend**: `bun run dev:frontend` (disponível em `http://localhost:5173`)
   - **Backend**: `bun run dev:backend` (disponível em `http://localhost:3000`)

---

## Comandos do Monorepo

Abaixo estão os scripts disponíveis no `package.json` raiz:
Abaixo estão os scripts definidos no `package.json` raiz do monorepo:

| Comando | Descrição |
| --- | --- |
| `bun run dev:frontend` | Inicia o servidor de desenvolvimento do Frontend (Vite) |
| `bun run dev:backend` | Inicia o servidor de desenvolvimento do Backend (NestJS em watch mode) |
| `bun run build:shared` | Compila o pacote compartilhado `@startintech/shared` |
| `bun run build:frontend` | Executa o build de produção do Frontend |
| `bun run build:backend` | Executa o build de produção do Backend |
| `bun run build` | Compila sequencialmente o pacote `shared`, `Backend` e `Frontend` |
| `bun run docker:build` | Constrói as imagens dos componentes no Docker Compose |
| `bun run docker:build:backend` | Constrói a imagem do container de backend no Docker Compose |
| `bun run docker:build:frontend` | Constrói a imagem do container de frontend no Docker Compose |
| `bun run docker:up` | Constrói e inicializa todos os containers no Docker Compose |
| `bun run docker:up:backend` | Constrói e inicializa o container de backend (e dependências) no Docker Compose |
| `bun run docker:up:frontend` | Constrói e inicializa o container de frontend (e dependências) no Docker Compose |
| `bun run docker:down` | Para e remove os containers e redes criados pelo Docker Compose |
| `bun run lint:frontend` | Executa o linter ESLint no código do Frontend |
| `bun run lint:backend` | Executa o linter ESLint no código do Backend |
| `bun run lint` | Executa o linter no Backend e no Frontend |
| `bun run format:frontend` | Formata o código do Frontend com Prettier |
| `bun run format:backend` | Formata o código do Backend com Prettier |
| `bun run format` | Formata o código de todo o projeto |
| `bun run test` | Executa a suíte de testes automatizados do Backend e Frontend com Vitest, Supertest e Playwright |

> [!TIP]
> Comandos específicos de cada pacote (como Storybook, testes E2E do Playwright ou migrações do TypeORM) podem ser executados a partir da raiz com `bun --cwd Frontend <comando>` ou `bun --cwd Backend <comando>`.

---

## Integração e Entrega Contínua (CI/CD) & Governança

O projeto conta com pipelines completos de CI e CD via **GitHub Actions**:
O projeto conta com pipelines automatizados via **GitHub Actions** e diretrizes estritas de governança:

- **Pipeline de CI** (`.github/workflows/ci-pipeline.yml`): Executado em Pull Requests e pushes para a branch `main`. Realiza validação de conformidade com o Gitflow, checagem de Conventional Commits no título do PR, formatação (Prettier), linting (ESLint), build do monorepo, testes unitários (Vitest), testes end-to-end headless (Playwright), validação de Dockerfiles e checagem de Terraform.
- **Pipeline de CD** (`.github/workflows/cd-pipeline.yml`): Executado após merge na branch `main`. Gera versão semântica e `CHANGELOG.md` via Conventional Commits, aplica alterações de infraestrutura no Terraform (`Infra/`), executa migrações do banco de dados (TypeORM), compila e faz deploy da API Backend no **Google Cloud Run** (via Google Artifact Registry), publica o Frontend no **Firebase Hosting** e executa smoke test de integridade pós-deploy.
- **Protocolo Gitflow**: Padrões de ramificação (`feature/*`, `hotfix/*`, `chore/*`) e regras de ciclo de vida de branches descritas em [docs/GITFLOW.md](docs/GITFLOW.md).
- **Guia Detalhado de CI/CD**: Para instruções de configuração, segredos e fluxo de deploy, consulte o [Guia de CI/CD](docs/CI_CD_GUIDE.md).
- **Documentação de Arquitetura e Modelagem**: Especificações detalhadas em `docs/Arquitetura.pdf`, `docs/Modelagem_de_dados.pdf` e `docs/Requisitos.pdf`.
