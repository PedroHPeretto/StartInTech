# Gitflow

Este documento define o protocolo determinístico de Git que deve ser seguido para manipulação de código, versionamento, abertura de Pull Requests e entrega contínua.

---

## 1. Topologia de Branches e Regras de Ciclo de Vida

O repositório opera exclusivamente sob o padrão de ramificação direta:
$$\text{main} \longrightarrow \text{branch de trabalho} (\text{feature} \mid \text{hotfix} \mid \text{chore}) \longrightarrow \text{main}$$

### 1.1 Branch Permanente
* **`main`**:
  * Única branch de longa duração.
  * Representa o código em estado estável e pronto para produção a qualquer momento.
  * **Regra Rígida**: NUNCA realize commit ou push direto para `origin/main`. Todas as alterações entram via Pull Request (PR) validado por CI.

### 1.2 Branches de Trabalho (Efêmeras)
Toda branch auxiliar deve ser criada a partir de `main` e ser excluída após a integração (merge).

| Tipo de Branch | Padrão de Nomenclatura | Quando Utilizar | Convenção de Commit Principal |
| :--- | :--- | :--- | :--- |
| **`feature`** | `feature/<identificador>-<descricao-kebab>` | Novas funcionalidades, melhorias de regra de negócio, endpoints ou interfaces. | `feat(...)` |
| **`hotfix`** | `hotfix/<identificador>-<descricao-kebab>` | Correção urgente de incidentes críticos que afetam produção. | `fix(...)` |
| **`chore`** | `chore/<identificador>-<descricao-kebab>` | Débito técnico, refatoração, atualização de dependências, ajustes de CI/CD e docs. | `chore(...)`, `refactor(...)`, `test(...)` |

*Exemplos válidos:*
* `feature/PROJ-102-auth-jwt`
* `hotfix/SEC-99-sanitize-sql-input`
* `chore/DEVOPS-45-upgrade-node-version`

---

## 2. Padrão de Mensagens de Commit (Conventional Commits)

Todas as mensagens devem ser formatadas no padrão:
```text
<tipo>(<escopo-opcional>): <descrição no imperativo e minúsculas>

[corpo detalhado opcional explicando o 'porquê' da mudança]

[rodapé com referências: Closes #123, Fixes PROJ-456]
```