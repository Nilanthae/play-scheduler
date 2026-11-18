# CLAUDE.md – Play Scheduler

Badminton group app: play schedule, RSVP/attendance, expenses and cost sharing. Web first (Next.js), mobile later.

## Key docs (read when relevant, not every time)
- `docs/01-requirements.md` – what we build (FR-/NFR- ids)
- `docs/02-backlog.md` – task source of truth (mirrored as GitHub issues)
- `docs/03-architecture.md` – structure and data model (after T-009)

## Stack
Next.js App Router + TypeScript, Tailwind + shadcn/ui, Drizzle ORM + Neon Postgres, Zod, Vitest, Playwright, Vercel, GitHub Actions.

## Commands
- `pnpm run dev` / `pnpm run build`
- `pnpm run lint` / `pnpm run typecheck` / `pnpm test` / `pnpm run test:e2e`
- `pnpm run db:generate` (after schema change) → `pnpm run db:migrate`

## Rules
- Money is integer cents (LKR). Never use floats for money.
- Store times in UTC; display in Asia/Colombo.
- Every server action / API route that reads group data calls `requireMember`; anything that changes schedules or money calls `requireAdmin`.
- Validate all input with Zod.
- Business logic (RSVP/waitlist, cost split) lives in pure functions under `src/lib/` with unit tests.
- Never commit secrets; use `.env.local` and keep `.env.example` updated.
- Don't edit generated migration SQL by hand; change the schema and regenerate.

## Workflow for a task
1. `gh issue view <n>` to read the task and its acceptance criteria.
2. Branch: `git switch -c <type>/<n>-short-name` (e.g. `feat/17-rsvp`).
3. Plan first for M/L tasks (plan mode), then implement in small commits.
4. Conventional Commits: `feat: …`, `fix: …`, `docs: …`, `test: …`, `chore: …`, `ci: …`.
5. Before PR: lint, typecheck and tests must pass locally.
6. `gh pr create --fill` with body containing `Closes #<n>` and the acceptance-criteria checklist ticked.
7. Move the issue to "In review" on the board (`gh project item-edit`, or ask the user).

## Keep tokens low
- Read only the files you need; prefer `rg` to find code over opening whole folders.
- Don't re-read files you just edited.
- Keep answers short; show diffs, not full files.
