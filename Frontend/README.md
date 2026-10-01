# StartInTech Client

Aplicação Frontend do projeto **StartInTech**, desenvolvida para proporcionar uma experiência simples e rápida para pessoas que buscam seu primeiro emprego na área de tecnologia.
Aplicação Frontend do projeto **StartInTech**, desenvolvida para proporcionar uma experiência fluida, moderna e intuitiva para pessoas que buscam seu primeiro emprego na área de tecnologia.

---

## Descrição do Produto

O **StartInTech Client** é a aplicação Web (SPA - Single Page Application) da plataforma StartInTech. Oferece uma interface responsiva e acessível para que os usuários possam explorar vagas, receber diagnósticos de currículo orientados por inteligência artificial, acompanhar planos de carreira e interagir com oportunidades do mercado.

### Principais Objetivos:

- Prover uma interface moderna, rápida e acessível em conformidade com as diretrizes de WCAG e do manual de identidade visual da marca (`docs/Manual_de_Identidade_Visual.pdf`).
- Consumir a API REST do backend (`StartInTech API`) e integrar contratos de dados e DTOs fortemente tipados via `@startintech/shared`.
- Monitorar erros de renderização e performance em tempo real no ambiente do navegador através do Sentry.
- Desenvolver e documentar componentes isolados utilizando Storybook e validar fluxos críticos de ponta a ponta com Playwright.

---

## Tech Stack

- **Biblioteca UI**: [React](https://react.dev/) (v19) & React DOM
- **Build Tool & Dev Server**: [Vite](https://vite.dev/) (v8) com React Compiler (`babel-plugin-react-compiler`) e `@rolldown/plugin-babel`
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) (v6)
- **Runtime & Gerenciador de Pacotes**: [Bun](https://bun.sh/) (monorepo workspaces) / [Node.js](https://nodejs.org/)
- **Qualidade & Padronização**: ESLint (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`), Prettier, `@startintech/shared`
- **Estilização & Design System**:
  - [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
  - [Base UI](https://base-ui.com/) (`@base-ui/react`) & [Shadcn UI](https://ui.shadcn.com/)
  - Ícones: [Lucide React](https://lucide.dev/) (`lucide-react`)
  - Utilitários de classes: `clsx`, `tailwind-merge`, `class-variance-authority`, `tw-animate-css`
- **Tipografia**: Comfortaa (títulos) e Plus Jakarta Sans (texto base)
- **Workshop de Componentes & Mocking**:
  - [Storybook](https://storybook.js.org/) (v10.6) com `@storybook/react-vite`
  - Addons: Acessibilidade (`@storybook/addon-a11y`), Documentação (`@storybook/addon-docs`), Vitest (`@storybook/addon-vitest`), MCP (`@storybook/addon-mcp`)
  - [MSW](https://mswjs.io/) (`msw`, `msw-storybook-addon`) para simulação de APIs
- **Testes Automatizados**:
  - [Vitest](https://vitest.dev/) (testes unitários e de componentes)
  - [Playwright](https://playwright.dev/) (testes end-to-end com relatórios visuais e modo UI)
- **Monitoramento & Observabilidade**: [Sentry for React](https://sentry.io/) (`@sentry/react` com tracing distribuído)
- **Hospedagem & Deploy**: [Firebase Hosting](https://firebase.google.com/docs/hosting) (CD pipeline) e Nginx 1.27 alpine (Docker)

---

## Como Iniciar

### Pré-requisitos
- [Bun](https://bun.sh/) (recomendado) ou [Node.js](https://nodejs.org/) (v20+)

### Passos para Execução Local

1. **Instalar as Dependências**:
   Recomenda-se executar a instalação a partir da raiz do monorepo para resolver as dependências do workspace:

   ```bash
   # Na raiz do monorepo
   bun install

   # Ou dentro do diretório Frontend
   cd Frontend
   bun install
   ```

2. **Compilar a Biblioteca Compartilhada (`@startintech/shared`)**:
   Antes de iniciar o frontend, certifique-se de que o pacote compartilhado foi compilado:

   ```bash
   # Na raiz do monorepo
   bun run build:shared

   # Ou a partir da pasta Frontend
   bun --cwd ../shared build
   ```

3. **Configurar as Variáveis de Ambiente**:
   As variáveis públicas do frontend são carregadas pelo Vite através do prefixo `VITE_`. Configure-as no arquivo `.env` localizado na raiz do monorepo:

   ```bash
   # A partir da raiz do monorepo
   cp .env.example .env
   ```

   Principais variáveis do Frontend:

   ```env
   FRONTEND_PORT="5173"
   VITE_SENTRY_DSN=""
   ```

4. **Iniciar o Servidor de Desenvolvimento**:

   ```bash
   # Dentro da pasta Frontend
   bun run dev

   # Ou a partir da raiz do monorepo
   bun run dev:frontend
   ```

   O aplicativo estará disponível por padrão em `http://localhost:5173`.

---

## Comandos

Abaixo estão os scripts disponíveis no `package.json` do Frontend:
Abaixo estão todos os scripts definidos no `package.json` do Frontend:

| Comando | Descrição |
| --- | --- |
| `bun run dev` | Inicia o servidor de desenvolvimento do Vite com Hot Module Replacement (HMR) |
| `bun run build` | Executa a verificação de tipos com o TypeScript (`tsc -b`) e compila a aplicação para produção |
| `bun run preview` | Inicia um servidor local para visualizar o build de produção compilado |
| `bun run lint` | Executa a verificação estática de código utilizando o ESLint |
| `bun run format` | Formata o código fonte (`src/`) utilizando o Prettier |
| `bun run format:check` | Verifica se os arquivos estão formatados de acordo com as regras do Prettier |
| Comando                   | Descrição                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `bun run dev`             | Inicia o servidor de desenvolvimento do Vite com Hot Module Replacement (HMR) na porta 5173      |
| `bun run build`           | Valida as definições de tipos (`tsc -b`) e compila a SPA para produção na pasta `dist/`          |
| `bun run preview`         | Inicializa um servidor local para inspecionar os arquivos estáticos de produção compilados       |
| `bun run lint`            | Executa a análise estática com o ESLint em todo o código do frontend                             |
| `bun run format`          | Aplica a formatação automática de código com o Prettier (`src/**/*.{ts,tsx,css,html}`)           |
| `bun run format:check`    | Valida se os arquivos estão formatados sem aplicar alterações                                    |
| `bun run test`            | Executa os testes unitários e de componentes com o Vitest em modo de execução única              |
| `bun run test:watch`      | Executa os testes do Vitest em modo watch interativo                                             |
| `bun run test:cov`        | Executa os testes gerando relatório de cobertura de código via `@vitest/coverage-v8`             |
| `bun run test:e2e`        | Executa os testes end-to-end em modo headless utilizando o Playwright                            |
| `bun run test:e2e:ui`     | Executa os testes do Playwright através da interface gráfica interativa                          |
| `bun run test:e2e:report` | Abre o relatório HTML interativo com o resultado da última execução do Playwright                |
| `bun run storybook`       | Inicializa o Storybook na porta 6006 para desenvolvimento e documentação de componentes isolados |
| `bun run build-storybook` | Compila o Storybook em arquivos estáticos prontos para publicação                                |

---

### Storybook & Testes End-to-End

- **Desenvolvimento de Componentes Isolados**:
  Para visualizar e desenvolver novos componentes no Storybook com suporte a acessibilidade e mocks:

  ```bash
  bun run storybook
  ```

  A interface estará disponível em `http://localhost:6006`.

- **Testes End-to-End (E2E)**:
  Para rodar testes de integração ponta a ponta simulando a experiência real de navegação do usuário:

  ```bash
  # Modo headless no terminal
  bun run test:e2e

  # Modo gráfico com gravação e timeline
  bun run test:e2e:ui
  ```

---

### Comandos a partir da Raiz do Monorepo

- `bun run dev:frontend` — Inicia o frontend em modo de desenvolvimento.
- `bun run build:frontend` — Gera o build de produção do frontend.
- `bun run lint:frontend` — Executa a verificação do linter no frontend.
- `bun run format:frontend` — Formata o código do frontend com Prettier.

| Comando                         | Descrição                                                       |
| ------------------------------- | --------------------------------------------------------------- |
| `bun run dev:frontend`          | Inicia o servidor de desenvolvimento do frontend                |
| `bun run build:frontend`        | Compila a versão de produção do frontend                        |
| `bun run lint:frontend`         | Executa o linter ESLint nos arquivos do frontend                |
| `bun run format:frontend`       | Formata os arquivos do frontend com Prettier                    |
| `bun run docker:build:frontend` | Constrói a imagem Docker de produção do frontend (Nginx 1.27)   |
| `bun run docker:up:frontend`    | Constrói e inicializa o container do frontend no Docker Compose |
| `bun run test`                  | Executa as suítes de testes automatizados do Frontend e Backend |
