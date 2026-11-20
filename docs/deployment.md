# Deployment (Vercel + Neon)

Written for: the developer or organiser who sets up Vercel and runs database changes.

## Current status
Development runs on the **dev site only**: `https://play-scheduler-dev.vercel.app`. The production site (`play-scheduler-prod.vercel.app`) is not in use yet and is set up later, before release.

## How it works
- **Dev site:** every merge to `main` is deployed to the dev site by Vercel.
- **Preview:** every pull request gets its own preview URL. Vercel posts it as a comment on the PR, so changes can be checked on a phone before merging.
- **Database:** each environment has its own Neon branch.
  - Dev site and previews → Neon `dev` branch
  - Production (later) → Neon `main` branch

## One-time setup (done by the project owner)
1. In Vercel, import the GitHub repo `Nilanthae/play-scheduler` (Hobby plan). Framework: Next.js. Build command: default (`pnpm run build`).
2. In Vercel → Project → Settings → Environment Variables, add `DATABASE_URL`:
   - Environment **Production**: the connection string for Neon `main`.
   - Environment **Preview**: the connection string for Neon `dev`.
   - Do not add it to *Development*; local work uses `.env.local`.
3. Redeploy so the variables take effect.

Never paste connection strings into the repo, issues or PR comments. Use Vercel and `.env.local` only.

## Database changes (migrations)
Migrations are **not** run automatically during the Vercel build. A schema change is applied by hand, in this order:

1. Change the schema in `src/db/schema/` and run `pnpm run db:generate`. Commit the generated files in `drizzle/`.
2. Apply to the dev branch first (`DATABASE_URL` in `.env.local` points to Neon `dev`):
   ```bash
   pnpm run db:migrate
   ```
3. Test the preview URL of the PR.
4. After merging, apply to production. Set `DATABASE_URL` in your shell to the Neon `main` connection string for this one command only, then run:
   ```bash
   pnpm run db:migrate
   ```
   Do not save the production string in any file.

Why manual: a failed automatic migration during a build could leave the live site and database out of step. Running it on purpose keeps the step visible.

## Checking a deployment
- `https://<production-url>/api/health` should return `{"ok":true,"db":"up"}` once `DATABASE_URL` is set. Until then it returns `503` with `db: "down"`; the site itself still builds and loads.
- Each PR's preview comment links to the preview URL. Check it on a phone before merging.

## Rollback
- In Vercel → Deployments, open a previous successful deployment and choose **Promote to Production**.
- Database rollbacks are not automatic. Ask before changing the production database.
