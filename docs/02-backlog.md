# Play Scheduler – Development Backlog

How to read this: work is grouped into **milestones** (roughly 1–2 weeks each for a learning project). Each **task** becomes one GitHub issue via `scripts/seed-issues.mjs` and is written so a non-developer can understand *what* and *why*, and a developer (or Claude Code) knows *how* and *when it's done*.

Every task has:
- **Labels** – type, area, size (S ≈ ½ day, M ≈ 1–2 days, L ≈ 3+ days) and the **suggested Claude model** (`model:opus` for design/tricky logic, `model:sonnet` for normal coding, `model:haiku` for simple/mechanical work).
- **Requirement** – which part of `docs/01-requirements.md` it delivers.
- **Acceptance criteria** – the checklist that defines "done".

<!-- Format note for the seed script: "## Milestone:" starts a milestone, "### T-" starts a task. Keep the "- **Labels:**" line. -->

## Milestone: M0 – Foundations
Project setup: board, repo conventions, app skeleton, database, CI/CD and testing. After this milestone, every change is automatically checked and deployed.

### T-001 · Review and confirm requirements
- **Labels:** type:docs, area:planning, size:S, model:opus, priority:P1
- **Requirement:** All
- **Depends on:** —
- **Status:** ✅ Decisions recorded 2026-11-17

**What & why (plain English)**
Before building, the team agrees on what the app must do. We review the draft requirements and answer the open questions (especially how costs are split), so we don't build the wrong thing.

**Scope**
- Read `docs/01-requirements.md` with the team/admins.
- Answer the 7 open questions; update the document; bump to v1.0.
- Adjust this backlog if answers change scope.

**Acceptance criteria**
- [ ] All open questions answered and recorded in the doc.
- [ ] Requirements doc marked "v1.0 – approved" and merged to `main`.

**Claude Code tip**
`/model opus` → "Review docs/01-requirements.md, interview me on the open questions one at a time, then update the doc."

### T-002 · Set up the GitHub task board
- **Labels:** type:chore, area:planning, size:S, model:haiku, priority:P1
- **Requirement:** NFR-5
- **Depends on:** —

**What & why (plain English)**
Creates the shared board where everyone (including management) can see what's planned, in progress and done. Each card is one of these tasks.

**Scope**
- Run `scripts/seed-issues.mjs` to create labels, milestones and issues.
- Create a GitHub Project (board view) with columns: Backlog, Ready, In progress, In review, Done.
- Turn on the project's built-in workflows: *Item closed → Done*, *Pull request merged → Done*.
- Add a "Roadmap" view grouped by milestone.

**Acceptance criteria**
- [ ] All backlog tasks exist as issues with labels and milestones.
- [ ] Board shows them in Backlog; closing an issue moves it to Done automatically.

### T-003 · Create the web app skeleton
- **Labels:** type:chore, area:setup, size:S, model:sonnet, priority:P1
- **Requirement:** §6 Technology stack
- **Depends on:** —

**What & why (plain English)**
Creates the empty starting application that everything else is built on, with consistent code style rules so the code stays clean.

**Scope**
- `npx create-next-app@latest` with TypeScript, App Router, Tailwind, ESLint, `src/` dir.
- Add Prettier, shadcn/ui, Zod.
- npm scripts: `dev`, `build`, `lint`, `typecheck` (`tsc --noEmit`), `test`, `format`.
- Simple home page with the app name.

**Acceptance criteria**
- [ ] `npm run dev` shows the home page.
- [ ] `npm run lint`, `npm run typecheck` and `npm run build` all pass.

### T-004 · Add Claude Code instructions and team conventions
- **Labels:** type:docs, area:setup, size:S, model:haiku, priority:P1
- **Requirement:** NFR-5
- **Depends on:** T-003

**What & why (plain English)**
Writes down how we work (branches, commit messages, pull requests) so every contributor — human or Claude — works the same way.

**Scope**
- Commit the provided `CLAUDE.md`, PR template and issue template.
- Protect `main`: require a pull request and passing CI before merge.
- Adopt Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).

**Acceptance criteria**
- [ ] `CLAUDE.md`, `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/task.yml` on `main`.
- [ ] Direct pushes to `main` are blocked by branch protection.

### T-005 · Connect the database (Neon + Drizzle)
- **Labels:** type:chore, area:db, size:M, model:sonnet, priority:P1
- **Requirement:** §6, NFR-2, NFR-3
- **Depends on:** T-003

**What & why (plain English)**
Connects the app to a free cloud database where all schedules, attendance and money records will be stored, with a safe, repeatable way to change the database structure (migrations).

**Scope**
- Create Neon project with branches `main` (production) and `dev`.
- Install `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`.
- `src/db/index.ts` (client), `src/db/schema/` folder, `drizzle.config.ts`.
- Scripts: `db:generate`, `db:migrate`, `db:studio`.
- `.env.example` documenting `DATABASE_URL`; real values only in `.env.local` / Vercel.

**Acceptance criteria**
- [ ] A trivial `health` table migrates successfully to the `dev` branch.
- [ ] `/api/health` returns `{ ok: true, db: "up" }`.
- [ ] No secrets committed (checked in PR review).

### T-006 · Continuous Integration (CI) pipeline
- **Labels:** type:ci, area:devops, size:S, model:sonnet, priority:P1
- **Requirement:** NFR-5
- **Depends on:** T-003

**What & why (plain English)**
Every time someone proposes a change, GitHub automatically checks it (style, types, tests, build). Broken changes can't be merged. This protects quality without manual effort.

**Scope**
- Commit the provided `.github/workflows/ci.yml` (lint → typecheck → unit tests → build).
- Make the CI check "required" in branch protection.

**Acceptance criteria**
- [ ] A PR shows a green "CI" check; a deliberately broken PR shows red and cannot merge.

### T-007 · Continuous Deployment to Vercel
- **Labels:** type:ci, area:devops, size:S, model:sonnet, priority:P1
- **Requirement:** NFR-6
- **Depends on:** T-005

**What & why (plain English)**
Makes the app live on the internet automatically. Every merged change goes to the live site; every pull request gets its own preview link so changes can be checked on a phone before release.

**Scope**
- Import the GitHub repo in Vercel (Hobby plan).
- Set env vars: production → Neon `main`, preview → Neon `dev`.
- Run `db:migrate` as part of the production build, or as a manual step documented in `docs/`.

**Acceptance criteria**
- [ ] Merging to `main` updates the production URL.
- [ ] Each PR gets a Vercel preview URL comment.

### T-008 · Testing setup (unit + end-to-end)
- **Labels:** type:test, area:quality, size:S, model:sonnet, priority:P1
- **Requirement:** NFR-5
- **Depends on:** T-003

**What & why (plain English)**
Sets up automatic tests: small tests for logic (like cost splitting) and browser tests that click through the app like a real user.

**Scope**
- Vitest + Testing Library for unit/component tests.
- Playwright for end-to-end tests (Chromium only, to save CI minutes).
- One sample test each; `test` and `test:e2e` scripts.

**Acceptance criteria**
- [ ] `npm test` and `npm run test:e2e` pass locally; unit tests run in CI.

### T-009 · Architecture and data model design
- **Labels:** type:docs, area:architecture, size:M, model:opus, priority:P1
- **Requirement:** All FRs, NFR-7, NFR-8
- **Depends on:** T-001

**What & why (plain English)**
A one-page blueprint of how the app is structured and what data it stores, so later tasks fit together and the future mobile app can reuse the backend.

**Scope**
- `docs/03-architecture.md`: folder structure, server actions vs API routes (API routes for anything mobile will need), auth flow, error handling.
- Entity-relationship diagram (Mermaid) for: users, groups, memberships, venues, schedules, sessions, rsvps, attendance, expenses, expense_shares, payments, month_closes, audit_log.
- Money in integer cents; timestamps UTC.

**Acceptance criteria**
- [ ] Doc + Mermaid ERD merged; reviewed by owner.
- [ ] Each later schema task references this design.

## Milestone: M1 – Members & sign-in
People can sign in, join the group via an invite link, and admins can manage members.

### T-010 · Database schema for users, groups and memberships
- **Labels:** type:feature, area:db, size:S, model:sonnet, priority:P1
- **Requirement:** FR-1
- **Depends on:** T-005, T-009

**What & why (plain English)**
Creates the database tables that store who our members are and what they're allowed to do.

**Scope**
- Drizzle tables: `users`, `groups`, `memberships` (role: admin|member, status: active|inactive, joinedAt).
- Migration + seed script with one group and one admin.

**Acceptance criteria**
- [ ] Migration applies cleanly on a fresh Neon branch.
- [ ] Seed creates a demo group and admin.

### T-011 · Sign-in (authentication)
- **Labels:** type:feature, area:auth, size:M, model:opus, priority:P1
- **Requirement:** FR-1.1, NFR-4
- **Depends on:** T-010

**What & why (plain English)**
Lets members log in securely so only our group sees our data.

**Scope**
- Decide Auth.js vs Better Auth (short note in `docs/03-architecture.md`), then implement with the Drizzle adapter.
- Google sign-in only (decided in T-001).
- Sign-in / sign-out pages; session available on server.

**Acceptance criteria**
- [ ] A user can sign in with Google and sign out.
- [ ] Protected pages redirect to sign-in when logged out.
- [ ] E2E test covers the redirect.

**Claude Code tip**
Use plan mode (`opusplan`) for the decision, then let it implement on Sonnet.

### T-012 · Role-based access control
- **Labels:** type:feature, area:auth, size:S, model:sonnet, priority:P1
- **Requirement:** NFR-4
- **Depends on:** T-011

**What & why (plain English)**
Makes sure only organisers can change schedules and money records, while members can only see and RSVP.

**Scope**
- Helpers `requireMember(groupId)` and `requireAdmin(groupId)` used by every server action / API route.
- Unit tests for allowed/denied cases.

**Acceptance criteria**
- [ ] A member calling an admin action gets 403.
- [ ] Tests cover admin, member, inactive member and non-member.

### T-013 · Member management (invite, list, roles)
- **Labels:** type:feature, area:ui, size:M, model:sonnet, priority:P1
- **Requirement:** FR-1.2, FR-1.3
- **Depends on:** T-012

**What & why (plain English)**
Organisers invite players by sharing a link (e.g. in WhatsApp), see the member list, promote someone to admin, or deactivate people who left.

**Scope**
- Invite link with token + expiry; join page.
- Members page: list, role change, deactivate/reactivate (admin only).

**Acceptance criteria**
- [ ] Opening a valid invite link while signed in adds the user as a member.
- [ ] Expired/used links show a friendly error.
- [ ] Deactivated members can't RSVP but their history remains.

### T-014 · Member profile
- **Labels:** type:feature, area:ui, size:S, model:haiku, priority:P2
- **Requirement:** FR-1.4
- **Depends on:** T-011

**What & why (plain English)**
Members can set their display name and phone number so organisers can contact them.

**Scope**
- Profile page with form (Zod validation), avatar from Google by default.

**Acceptance criteria**
- [ ] Changes save and appear in member list.
- [ ] Invalid phone numbers are rejected with a clear message.

## Milestone: M2 – Schedule & attendance
Organisers set up the weekly play schedule; members say if they're coming; organisers record who actually played.

### T-015 · Database schema for venues, schedules, sessions and RSVPs
- **Labels:** type:feature, area:db, size:M, model:sonnet, priority:P1
- **Requirement:** FR-2, FR-3
- **Depends on:** T-010

**What & why (plain English)**
Creates the tables that store where and when we play and who is coming.

**Scope**
- `venues`, `schedules` (weekday, start, end, **capacity nullable = no limit**, rsvpCutoffMinutes), `sessions` (date, status: scheduled|cancelled|completed, capacity override nullable), `rsvps` (status: going|not_going|maybe|waitlisted, position, updatedAt), `attendance` (memberId, played: boolean), `session_guests` (name, broughtByMemberId nullable).
- Unique constraint: one RSVP per member per session.

**Acceptance criteria**
- [ ] Migration applies; constraints verified by a test.

### T-016 · Recurring play schedule
- **Labels:** type:feature, area:ui, size:M, model:sonnet, priority:P1
- **Requirement:** FR-2.1–FR-2.4
- **Depends on:** T-015, T-012

**What & why (plain English)**
Organisers set "we play every Wednesday and Saturday 7–9 pm at X" once, and the app creates the play days automatically for the coming weeks. They can still cancel a single day (e.g. a holiday).

**Scope**
- Admin pages: venues CRUD, schedules CRUD.
- Session generator: creates sessions for the next 8 weeks (idempotent; run on schedule save and by a daily Vercel cron).
- Cancel/edit single session.

**Acceptance criteria**
- [ ] Saving a schedule creates the correct dates in Asia/Colombo time.
- [ ] Running the generator twice creates no duplicates (unit test).
- [ ] Cancelled sessions show as cancelled to members.

### T-017 · Upcoming sessions and RSVP
- **Labels:** type:feature, area:ui, size:M, model:sonnet, priority:P1
- **Requirement:** FR-3.1, FR-2.5
- **Depends on:** T-016

**What & why (plain English)**
Members see upcoming play days and tap Going / Not going / Maybe. Everyone can see who is coming — replacing the WhatsApp poll.

**Scope**
- Sessions list (mobile-first cards) and session detail with attendee list.
- RSVP buttons; locked after cutoff.

**Acceptance criteria**
- [ ] RSVP changes are visible to others on refresh.
- [ ] After the cutoff, RSVP buttons are disabled with an explanation.
- [ ] E2E test: member RSVPs "Going".

### T-018 · Capacity limit and waitlist
- **Labels:** type:feature, area:logic, size:M, model:opus, priority:P2
- **Requirement:** FR-3.2, FR-3.3
- **Depends on:** T-017

**What & why (plain English)**
We have no fixed player limit, so by default everyone can join. If an organiser sets a limit for a session (e.g. only one court available), extra players go on a waitlist in order and move up automatically when someone drops out.

**Scope**
- Pure function for RSVP state transitions + DB transaction to avoid race conditions (two people taking the last spot).
- Show waitlist position in UI.

**Acceptance criteria**
- [ ] Unit tests: no capacity = unlimited, fill to capacity, overflow to waitlist, drop-out promotes #1, maybe/not-going don't consume capacity.
- [ ] Concurrent RSVPs never exceed capacity (transaction test).

### T-019 · Record actual attendance
- **Labels:** type:feature, area:ui, size:S, model:sonnet, priority:P1
- **Requirement:** FR-3.4, FR-3.5
- **Depends on:** T-017

**What & why (plain English)**
After play, an organiser ticks who actually came and adds any guests by name. This is a record of who played; it does not change anyone's fee.

**Scope**
- Check-in screen pre-filled from "Going"; admin can add walk-in members and **guests (name only)**.
- Session marked "completed"; member attendance history page.

**Acceptance criteria**
- [ ] Attendance saved and shown in each member's history.
- [ ] Guests appear in the session's attendee list, marked "Guest".
- [ ] Only admins can edit; edits after month close are blocked (see T-025).

### T-020 · Week / calendar view
- **Labels:** type:feature, area:ui, size:S, model:haiku, priority:P3
- **Requirement:** FR-2.5
- **Depends on:** T-017

**What & why (plain English)**
A simple week view so people can see the play days at a glance.

**Scope**
- Week view with prev/next; highlights my RSVP status.

**Acceptance criteria**
- [ ] Works on a 375px-wide phone screen.

## Milestone: M3 – Expenses & settlement
Record what the group spends, split it fairly, track payments and produce monthly statements.

### T-021 · Database schema for expenses, shares and payments
- **Labels:** type:feature, area:db, size:S, model:sonnet, priority:P1
- **Requirement:** FR-4, NFR-2, NFR-8
- **Depends on:** T-015

**What & why (plain English)**
Creates the tables that store money spent, each person's share, and money received.

**Scope**
- `billing_months` (month, courtFeeCents, signupDeadline, status: open|locked|closed), `month_signups` (memberId, signedUpAt, withdrawnAt), `expenses` (category default 'court', amountCents, monthId, note, createdBy), `expense_shares` (memberId, amountCents), `payments` (memberId, amountCents, method, date), `audit_log`.

**Acceptance criteria**
- [ ] Amounts are integer columns; migration applies.

### T-022 · Record expenses
- **Labels:** type:feature, area:ui, size:M, model:sonnet, priority:P1
- **Requirement:** FR-4.1
- **Depends on:** T-021, T-012

**What & why (plain English)**
Organisers enter the court fee paid in advance for the month, so the monthly total is known. (Shuttlecocks and other costs come in a later release.)

**Scope**
- Expense form (LKR input → cents), list with filters by month/category, edit/delete with audit log entry.

**Acceptance criteria**
- [ ] Entering "1,250.50" stores 125050 cents and displays "LKR 1,250.50".
- [ ] Every create/edit/delete writes an audit log row.

### T-023 · Fee calculation (monthly share)
- **Labels:** type:feature, area:logic, size:S, model:opus, priority:P1
- **Requirement:** FR-4.2
- **Depends on:** T-033

**What & why (plain English)**
Works out each member's share of the court fee, exactly to the cent. Rule agreed in T-001: **monthly court fee ÷ number of members who signed up by the 1st.** Example: LKR 40,000 ÷ 16 = LKR 2,500 each. Signed-up members pay the full share whether they play once or every day; guests and non-signed-up members pay nothing.

**Scope**
- Pure, fully tested function `splitMonthly(feeCents, memberIds)` in `src/lib/split/`.
- Largest-remainder rounding so shares sum exactly to the fee.
- Live estimate while sign-ups are open; final shares written to `expense_shares` when the month is locked.
- Late joiner added after lock pays the same per-member share (others not recalculated).

**Acceptance criteria**
- [ ] LKR 40,000 / 16 members → 16 × LKR 2,500.
- [ ] Edge cases tested: 1 member, nobody signed up (admin warned, no shares), uneven cents (LKR 1,000.00 ÷ 3), late joiner, member deactivated after signing up (still owes).
- [ ] Sum of shares always equals the fee (property test).

### T-033 · Monthly sign-up ("I'm playing this month")
- **Labels:** type:feature, area:ui, size:M, model:sonnet, priority:P1
- **Requirement:** FR-4.2
- **Depends on:** T-021, T-012

**What & why (plain English)**
Replaces the WhatsApp head-count. The organiser opens next month with the court fee; members tap *"I'm playing in November"* before the 1st; the organiser locks sign-ups and everyone immediately sees their share and pays in the first week.

**Scope**
- Admin: "Open month" (month, court fee, deadline default = 1st of month), "Lock sign-ups", "Add late joiner".
- Member: sign up / withdraw before the deadline; see live head-count and estimated share.
- After lock: share shown on dashboard and balance page (uses T-023).

**Acceptance criteria**
- [ ] Member can sign up and withdraw until the deadline; not after lock.
- [ ] Head-count and estimated share update as people sign up.
- [ ] Locking creates one share per signed-up member that sums to the fee.
- [ ] E2E test: admin opens month → 3 members sign up → lock → each sees correct share.

### T-024 · Balances and payments
- **Labels:** type:feature, area:ui, size:M, model:sonnet, priority:P1
- **Requirement:** FR-4.3, FR-4.4
- **Depends on:** T-023

**What & why (plain English)**
Shows each member how much they owe or have in credit, and lets organisers record payments received.

**Scope**
- Admin: record payment (amount, method, date).
- Member: "My balance" page with transactions list.
- Admin: balances table for all members, sortable by amount owed.

**Acceptance criteria**
- [ ] Balance = shares − payments, verified by unit test.
- [ ] Members can only see their own balance; admins see all.

### T-025 · Monthly statements and month close
- **Labels:** type:feature, area:reports, size:M, model:sonnet, priority:P1
- **Requirement:** FR-4.5, FR-5.1, FR-5.2
- **Depends on:** T-024

**What & why (plain English)**
At month end the organiser "closes" the month: numbers are locked and everyone gets a clear statement of sessions played, their share and what they paid. Management gets a summary of total spend and collections.

**Scope**
- Close month action (admin, after month ends) → locks payments and attendance edits for that month.
- Member statement page; admin summary (by category, collected, outstanding).
- Print-friendly / "Share as image" optional.

**Acceptance criteria**
- [ ] Editing data in a closed month is rejected.
- [ ] Statement totals match the balances page.

## Milestone: M4 – Polish & release v1.0 (web)
Make it pleasant on phones, harden quality, and ship v1.0 with release notes.

### T-026 · Home dashboard
- **Labels:** type:feature, area:ui, size:S, model:sonnet, priority:P2
- **Requirement:** FR-5.3
- **Depends on:** T-017, T-024

**What & why (plain English)**
The first screen shows what matters: next play day and my RSVP, my balance, and quick actions.

**Acceptance criteria**
- [ ] One-tap RSVP from the dashboard.
- [ ] Loads under 2 s on a mid-range phone (Lighthouse check).

### T-027 · Mobile polish and installable app (PWA)
- **Labels:** type:feature, area:ui, size:M, model:sonnet, priority:P2
- **Requirement:** NFR-1
- **Depends on:** T-026

**What & why (plain English)**
Makes the website feel like an app: installable to the phone home screen with an icon, bottom navigation, large tap targets. A quick win before the real mobile app.

**Scope**
- Web app manifest + icons; bottom nav; accessibility pass (contrast, labels).

**Acceptance criteria**
- [ ] "Add to Home Screen" works on Android Chrome and iOS Safari.
- [ ] Lighthouse accessibility score ≥ 90.

### T-028 · End-to-end tests for core journeys
- **Labels:** type:test, area:quality, size:M, model:sonnet, priority:P1
- **Requirement:** NFR-5
- **Depends on:** T-025

**What & why (plain English)**
Automated "robot user" tests for the most important journeys so future changes don't silently break them.

**Scope**
- Playwright: sign-in (test auth bypass in test env), monthly sign-up + lock, record payment, RSVP, record attendance with a guest, view statement.
- Run e2e in CI against a Neon test branch (or on Vercel preview URL).

**Acceptance criteria**
- [ ] All core journeys pass in CI.

### T-029 · Database branch per pull request
- **Labels:** type:ci, area:devops, size:S, model:sonnet, priority:P3
- **Requirement:** NFR-5
- **Depends on:** T-007

**What & why (plain English)**
Each proposed change gets its own copy of the database so testing never touches real data.

**Scope**
- Use Neon's GitHub Action (or Neon–Vercel integration) to create/delete a branch per PR and pass its URL to the preview.

**Acceptance criteria**
- [ ] Opening a PR creates a Neon branch; closing it deletes the branch.

### T-030 · Release process and v1.0 release notes
- **Labels:** type:docs, area:devops, size:S, model:haiku, priority:P1
- **Requirement:** NFR-5
- **Depends on:** T-028

**What & why (plain English)**
A repeatable way to publish a version with human-readable release notes for the team and management.

**Scope**
- Commit provided `.github/release.yml` (groups notes by label) and `.github/workflows/release.yml` (tag `v*` → GitHub Release with generated notes).
- Write `docs/user-guide.md` (short, with screenshots).
- Tag `v1.0.0`.

**Acceptance criteria**
- [ ] GitHub Release v1.0.0 exists with notes grouped into Features / Fixes / Docs / Maintenance.
- [ ] User guide linked from the README.

### T-031 · Security and data review
- **Labels:** type:chore, area:quality, size:S, model:opus, priority:P1
- **Requirement:** NFR-4, NFR-8
- **Depends on:** T-025

**What & why (plain English)**
An independent check that member data and money records are protected before we invite the whole team.

**Scope**
- Review every server action / API route for auth checks; check for leaked secrets; dependency audit (`npm audit`); enable GitHub Dependabot alerts.

**Acceptance criteria**
- [ ] Findings listed in an issue; all high/critical fixed.

## Milestone: M5 – Mobile app (phase 2)
Plan the native mobile app reusing the same backend.

### T-032 · Mobile approach decision and plan
- **Labels:** type:docs, area:architecture, size:M, model:opus, priority:P2
- **Requirement:** NFR-7
- **Depends on:** T-030

**What & why (plain English)**
Decide how to build the phone app (e.g. Expo/React Native vs. improving the installable web app) and plan the work, reusing the backend we already built.

**Scope**
- Compare options (effort, cost, push notifications, app store needs).
- List API endpoints the app needs; gaps become new issues.
- Create milestone M6 with tasks.

**Acceptance criteria**
- [ ] Decision record merged in `docs/`; M6 tasks created on the board.
