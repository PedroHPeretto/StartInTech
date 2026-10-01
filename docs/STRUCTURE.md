# Structure

The repository is a monorepo managed with **Bun Workspaces**. Always use `bun` as the package manager and runtime. Never use `npm`, `yarn`, or `pnpm`.

```text
StartInTech/
├── .github/              # CI/CD and Agent workflow configurations
├── Backend/              # RESTful API built with NestJS 12, Express & TypeScript
├── Frontend/             # Modern SPA built with React 19, Vite 8 & TypeScript
├── shared/               # Shared package (@startintech/shared) with types, DTOs & utils
├── Infra/                # Terraform IaC for Cloud providers
├── docs/                 # Product specs, data model, architecture diagrams & brand guidelines
│   ├── Arquitetura.pdf                 # Cloud Run, Cloud SQL, Cloud Storage, External APIs
│   ├── Modelagem_de_dados.pdf          # Database schema (PostgreSQL 17, UUIDs, JSONB)
│   ├── Requisitos.pdf                  # Functional & non-functional requirements (RF01 - RF11)
│   ├── Manual_de_Identidade_Visual.pdf # Official brand identity, color palette & typography
│   └── diagrams/                       # Sequence, state, and activity SVG diagrams
└── .agents/               # Autonomous agent configuration and skills
    ├── mcp_servers.json   # Useful MCP Servers for autonomous agents
    └── skills/            # Modular, specialized agent skills and scripts
```

---
