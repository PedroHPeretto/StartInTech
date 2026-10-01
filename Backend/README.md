# StartInTech API

API Backend do projeto **StartInTech**, uma plataforma desenvolvida para ajudar profissionais a encontrarem seu primeiro emprego na área de tecnologia de maneira fácil e rápida.

---

## Descrição do Produto

O **StartInTech API** é a camada de backend da plataforma StartInTech. Trata-se de um serviço RESTful escalável e modular responsável pela gestão da lógica de negócios, autenticação, processamento de currículos com inteligência artificial, geração de roteiros de carreira, persistência relacional e monitoramento de observabilidade.

### Principais Objetivos:

- Prover endpoints REST documentados e validados para consumo da aplicação Frontend.
- Gerenciar entidades de usuários, perfis, trilhas de carreira, roteiros, análise de currículos e oportunidades de trabalho em conformidade com `docs/Modelagem_de_dados.pdf`.
- Integração de modelos de IA para análise de compatibilidade e lacunas de habilidades.
- Garantir alta disponibilidade, tolerância a falhas e rastreamento de incidentes em tempo real com Sentry.

---

## Tech Stack

- **Framework Backend**: [NestJS](https://nestjs.com/) (v12)
- **Plataforma HTTP**: [Express](https://expressjs.com/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) (ES2023 / NodeNext ESM)
- **Banco de Dados & ORM**: PostgreSQL 17, [TypeORM](https://typeorm.io/) (`@nestjs/typeorm`, `typeorm`), driver `pg`
- **Validação & Transformação**: `class-validator`, `class-transformer`, `@nestjs/config`
- **Runtime & Gerenciador de Pacotes**: [Bun](https://bun.sh/) (monorepo workspaces) / [Node.js](https://nodejs.org/) (v20+)
- **Monitoramento & Observabilidade**: [Sentry](https://sentry.io/) (`@sentry/nestjs`)
- **Testes Automatizados**: Vitest e Supertest
- **Infraestrutura & Deploy**: Google Cloud Run, Google Artifact Registry & Terraform
- **Qualidade & Padronização**: ESLint, Prettier, `@startintech/shared`

---

## Como Iniciar

### Pré-requisitos

- [Bun](https://bun.sh/) (recomendado como gerenciador padrão do monorepo) ou [Node.js](https://nodejs.org/) (v20+)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) (para executar o container do PostgreSQL 17)

### Passos para Execução Local

1. **Instalar as Dependências**:
   Recomenda-se instalar as dependências a partir da raiz do monorepo para correta resolução de links do workspace:

   ```bash
   # Na raiz do monorepo
   bun install

   # Ou dentro do diretório Backend
   cd Backend
   bun install
   ```

2. **Compilar a Biblioteca Compartilhada (`@startintech/shared`)**:
   Antes de iniciar o backend, certifique-se de que os contratos compartilhados estão compilados:

   ```bash
   # Na raiz do monorepo
   bun run build:shared

   # Ou a partir da pasta Backend
   bun --cwd ../shared build
   ```

3. **Configurar as Variáveis de Ambiente**:
   O arquivo de variáveis de ambiente deve ser configurado com base no modelo central `.env.example` localizado na **raiz do monorepo**:

   ```bash
   # A partir da raiz do monorepo
   cp .env.example .env

   # Ou a partir do diretório Backend
   cp ../.env.example .env
   ```

   Principais variáveis utilizadas pelo Backend:

   ```env
   NODE_ENV="development"
   PORT="3000"
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/startintech_db"
   OPENROUTER_API_KEY=""
   SENTRY_DSN=""
   ```

4. **Inicializar o Banco de Dados Local**:
   Suba o container do banco de dados PostgreSQL 17 utilizando o Docker Compose da raiz:

   ```bash
   # A partir da raiz do monorepo
   docker compose up -d postgres

   # Ou a partir de Backend
   docker compose -f ../docker-compose.yml up -d postgres
   ```

5. **Executar as Migrações do Banco de Dados**:
   Execute as migrações do TypeORM para sincronizar o schema das entidades:

   ```bash
   # Dentro da pasta Backend
   bun run db:migrate

   # Ou a partir da raiz do monorepo
   bun --cwd Backend run db:migrate
   ```

6. **Iniciar o Servidor em Modo de Desenvolvimento**:

   ```bash
   # Dentro da pasta Backend
   bun run start:dev

   # Ou a partir da raiz do monorepo
   bun run dev:backend
   ```

   A API estará acessível em `http://localhost:3000`.

---

## Padrão Arquitetural & Regra de Imports (NodeNext ESM)

> [!IMPORTANT]
> O Backend utiliza a configuração `"moduleResolution": "nodenext"` e ESM nativo. Em conformidade com as diretrizes do projeto (`AGENTS.md`), **todos os imports relativos locais no TypeScript DEVEM incluir a extensão explícita `.js`**.
>
> ```typescript
> // ✅ CORRETO:
> import { AppModule } from './app.module.js';
> import { dataSourceOptions } from './database/data-source.js';
>
> // ❌ INCORRETO (gera erro de compilação TS2835):
> import { AppModule } from './app.module';
> ```

---

## Comandos

Abaixo estão todos os scripts disponíveis no `package.json` do Backend:

| Comando               | Descrição                                                                 |
| --------------------- | ------------------------------------------------------------------------- |
| `bun run start`       | Inicia a aplicação NestJS compilada                                       |
| `bun run start:dev`   | Inicia o servidor em modo de desenvolvimento com auto-reload (watch mode) |
| `bun run start:debug` | Inicia o servidor NestJS com debugger ativado e auto-reload               |
| `bun run start:prod`  | Executa a versão compilada em ambiente de produção (`node dist/main`)     |
| `bun run build`       | Compila a aplicação TypeScript via Nest CLI (`nest build`)                |
| `bun run test`        | Executa a suíte de testes unitários e de integração com o Vitest          |
| `bun run test:watch`  | Executa os testes no modo interativo (watch)                              |
| `bun run test:cov`    | Gera relatório de cobertura de código dos testes                          |
| `bun run typeorm`     | Invoca a CLI do TypeORM para operações de schema, migrações e entidades   |
| `bun run db:migrate`  | Executa as migrações pendentes do TypeORM no banco de dados               |
| `bun run lint`        | Executa o ESLint em todo o código fonte (`src/` e `test/`)                |
| `bun run lint:fix`    | Executa o ESLint corrigindo automaticamente erros passíveis de correção   |
| `bun run format`      | Formata todo o código fonte com o Prettier                                |

---

### Comandos a partir da Raiz do Monorepo

| Comando                        | Descrição                                                                |
| ------------------------------ | ------------------------------------------------------------------------ |
| `bun run dev:backend`          | Inicia o servidor de desenvolvimento da API                              |
| `bun run build:backend`        | Compila a versão de produção do backend                                  |
| `bun run lint:backend`         | Executa o linter ESLint nos arquivos do backend                          |
| `bun run format:backend`       | Formata os arquivos do backend com Prettier                              |
| `bun run docker:build:backend` | Constrói a imagem Docker de produção do backend                          |
| `bun run docker:up:backend`    | Constrói e inicializa o container do backend e dependências (PostgreSQL) |
| `bun run test`                 | Executa os testes automatizados do Backend e Frontend                    |
