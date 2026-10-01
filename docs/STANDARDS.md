# Backend Standards (`Backend/`)

- **Framework**: NestJS 12 (Express platform) running on Bun/Node.js.
- **Module Resolution & ECMAScript Imports**:
  - The project uses `"module": "nodenext"` and `"moduleResolution": "nodenext"`.
  - **CRITICAL RULE**: All relative local imports in TypeScript files **MUST include the explicit `.js` extension**.
    ```typescript
    // ✅ CORRECT:
    import { AppModule } from './app.module.js';
    import { UserService } from './user.service.js';
    import { CreateUserDto } from './dto/create-user.dto.js';

    // ❌ WRONG (will cause TS2835 compile errors):
    import { AppModule } from './app.module';
    import { UserService } from './user.service';
    ```
- **Architecture & Layering**:
  - **Controllers**: Responsible for route definitions, HTTP status codes, request validation, and calling services. No heavy business logic.
  - **Services**: Encapsulate business logic, domain rules, and database operations.
  - **Modules**: Group related controllers and services into cohesive domain modules. Register each new module in `AppModule`.
- **Validation & DTOs**:
  - Use strongly typed DTOs with `class-validator` and `class-transformer` or validation schemas.
  - Reuse shared types and enums from `@startintech/shared`.
- **Error Handling & Observability**:
  - Use built-in NestJS exceptions (`NotFoundException`, `BadRequestException`, `ConflictException`, `ForbiddenException`, `InternalServerErrorException`).
  - Keep `@sentry/nestjs` integrated for uncaught exceptions and tracing. Do not disable or circumvent error instrumentation.
- **Database Model Adherence**:
  - Align with `docs/Modelagem_de_dados.pdf`:
    - Entities: `users`, `profiles`, `career_tracks`, `career_roadmaps`, `roadmap_nodes`, `resume_analyses`, `resume_analysis_skills`, `skills`, `job_opportunities`, `job_skills`.
    - Primary Keys: UUIDs.
    - Status/Priority fields: Use strict Enums (`ESSENTIAL`, `RECOMMENDED`, `ADVANCED`, `REMOTE`, `HYBRID`, `ON_SITE`, etc.).
    - Unstructured analysis output: Store in PostgreSQL `JSONB` fields (e.g. `feedback_report`).
- **Backend Testing**:
  - Write unit and integration tests under `Backend/test/` with `*-spec.ts` naming.
  - Run tests with `bun test ./test/*-spec.ts`.

---

# Frontend Standards (`Frontend/`)
- **Framework & Build**: React 19 + Vite 8 + TypeScript.
- **React Compiler**:
  - The project uses `babel-plugin-react-compiler` via `@rolldown/plugin-babel`.
  - Write pure, idiomatic React code. Avoid manual memoization anti-patterns (`useMemo`, `useCallback`) unless strictly necessary for external library interop or referential stability in custom hooks.
- **Design System & Visual Identity** (per `docs/Manual_de_Identidade_Visual.pdf`):
  - **Color Palette**:
    - **Azul Tech** (`#0284C7`): Primary brand color, primary action buttons, key accents.
    - **Verde Esmeralda** (`#10B981`): Success indicators, match percentage scores, positive highlights.
    - **Azul Noturno** (`#0F172A`): Headings, high-contrast text, dark surfaces.
    - **Cinza Neutro Claro** (`#F8FAFC`): Card surfaces, screen backgrounds, soft borders.
  - **Typography**:
    - Headings / Titles / H1 / H2: `Comfortaa` (approachable, modern).
    - Body text / Tables / Menus: `Plus Jakarta Sans` (high legibility).
  - **UX Patterns**:
    - Card-based modular layout for job opportunities and resume insights.
    - Prominent match score indicator badges (using Verde Esmeralda).
    - Accessibility: Maintain WCAG AA contrast between texts and card surfaces.
- **Observability**:
  - Keep `@sentry/react` initialized in `src/main.tsx`.

---

# Shared Package Standards (`shared/`)
- **Package Name**: `@startintech/shared`.
- **Purpose**: Single source of truth for DTOs, Enums, API request/response contracts, domain interfaces, and anything else that both Backend and Frontend utilizes.  
- **Rules**:
  - Keep external runtime dependencies minimal or zero.
  - All exports must be centralized and exported from `shared/src/index.ts`.
  - Always run `bun run build:shared` after editing shared code so dependent packages resolve new definitions immediately.

---

# Security, Secrets & Infrastructure (`Infra/`)

You should **NOT** modify anything on Infra/ folder unless explicity asked by the user.
