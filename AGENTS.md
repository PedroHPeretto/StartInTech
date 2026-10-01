# Project Goal

> Empower students and entry-level professionals to find their first job in technology through automated ATS resume analysis, gap analysis, career roadmaps, and intelligent job matching.

---

# Monorepo Commands Reference

This project uses `bun` as it's package manager. Always use `bun` for commands and manage dependencies.

| Action | Root Monorepo Script | Subpackage Direct Command |
| :--- | :--- | :--- |
| **Run Frontend Dev** | `bun run dev:frontend` | `bun --cwd Frontend dev` |
| **Run Backend Dev** | `bun run dev:backend` | `bun --cwd Backend start:dev` |
| **Build Shared** | `bun run build:shared` | `bun --cwd shared build` |
| **Build Backend** | `bun run build:backend` | `bun --cwd Backend build` |
| **Build Frontend** | `bun run build:frontend` | `bun --cwd Frontend build` |
| **Build All** | `bun run build` | — |
| **Lint Backend** | `bun run lint:backend` | `bun --cwd Backend lint` |
| **Lint Frontend** | `bun run lint:frontend` | `bun --cwd Frontend lint` |
| **Lint Monorepo** | `bun run lint` | — |
| **Format Backend** | `bun run format:backend` | `bun --cwd Backend format` |
| **Format Frontend** | `bun run format:frontend` | `bun --cwd Frontend format` |
| **Format Monorepo** | `bun run format` | — |
| **Run Tests** | `bun run test` | `bun --cwd Backend test` |

---

# Agent Tools

- Before performing specialized tasks, inspect `.agents` to discover available reusable skills and MCPs.

- When creating reusable agent capabilities, package them into modular subdirectories inside `.agents/`.

---

# References

- To understand more about the project structure and architecture, read `docs/STRUCTURE.md`.
- To understand the codebase patterns and standards, read `docs/STANDARDS.md`.
- To get the full workflow to implement features, read `docs/WORKFLOW.md`.

---
