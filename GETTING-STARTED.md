# Getting started – Play Scheduler starter kit

Copy everything in this kit into the root of your GitHub repo, then follow these steps.

## 1. One-time tools (all free)
- Node.js 22+, Git, GitHub CLI (`gh`): `gh auth login`, then `gh auth refresh -s project` (lets it manage boards)
- Claude Code (already installed)
- Accounts: GitHub, Neon (free), Vercel (Hobby, sign in with GitHub)

## 2. Create the task board
```bash
# create a board (Project) under your account and note its number
gh project create --owner @me --title "Play Scheduler"
gh project link <NUMBER> --owner @me --repo <OWNER>/<REPO>

# preview, then create labels, milestones and 32 issues and add them to the board
node scripts/seed-issues.mjs --dry-run
node scripts/seed-issues.mjs --repo <OWNER>/<REPO> --project <NUMBER> --owner <OWNER>
```
Then in the board on github.com (one time, in the browser):
- Add a **Board** view; set Status columns: Backlog, Ready, In progress, In review, Done.
- Settings → Workflows: enable *Item closed* → Done and *Pull request merged* → Done.
- Add a **Roadmap** view grouped by Milestone. This view is the one to share with management.

## 3. Daily loop with Claude Code
```
claude --model opusplan        # Opus plans, Sonnet writes code
> /plan  (or Shift+Tab to plan mode)
> Work on issue #17. Read it with gh, plan, then implement per CLAUDE.md.
```
Claude reads the issue, creates a branch, writes code and tests, and opens a PR with `Closes #17`. CI runs automatically, Vercel posts a preview link, you review and merge, and the board card moves to Done.

## 4. Which model when (token saving)
| Work | Model | How |
|---|---|---|
| Requirements, architecture, tricky logic (waitlist, cost split), security review | Opus | `/model opus`, or plan mode under `opusplan` |
| Normal feature coding, tests, CI fixes | Sonnet | `/model sonnet` (default under `opusplan` when not planning) |
| Small edits, docs, labels, renames, boilerplate | Haiku | `/model haiku` |

Each issue has a `model:*` label that tells you which model to use.

Other ways to save tokens:
- Run `/clear` between tasks. One issue per session.
- Keep `CLAUDE.md` short (it's loaded every session).
- Point Claude at specific files; don't say "look at the whole project".
- Use `/compact` when a long session gets slow.

## 5. Releases
Tag a version and push it. GitHub then writes release notes from merged PRs, grouped by label:
```bash
git tag v1.0.0 && git push origin v1.0.0
```
