# Play Scheduler – Requirements (v1.0)

> Status: **v1.0 – decisions recorded 2026-11-17** (see *Decisions* at the bottom; 2 small confirmations pending).
> Audience: team members, management, developers, and Claude Code.

## 1. Vision

A simple app for our badminton group to **plan play days, track who is coming, and share costs fairly**. It replaces the WhatsApp polls and spreadsheets we use today.

We build a **web app first** (works on phone browsers), then a **mobile app** that reuses the same backend.

## 2. Goals and non-goals

| Goals (v1.0 web) | Non-goals (for now) |
|---|---|
| Recurring play schedule (e.g. every Wed & Sat 7–9 pm) | Online card payments |
| Members say whether they're coming (RSVP), with a waitlist when courts are full | Tournament brackets / scoring |
| Members sign up for the coming month by the 1st | |
| Admin records actual attendance | Court booking integration with venues |
| Record the monthly court fee | Multi-language UI |
| Split costs fairly and show each member's balance | Native mobile app (comes in phase 2) |
| | Shuttlecock and other expenses (future release) |
| Monthly statement per member and for the group | |

## 3. Users and roles

| Role | Who | Can do |
|---|---|---|
| **Admin** (organiser) | 1–3 people who run the group | Everything: manage members, schedule, attendance, expenses, payments, close months |
| **Member** | Regular players | View schedule, RSVP, see own attendance, balance and statements, update own profile |
| **Guest** | Occasional non-member players | No account. Added to a session by an admin by name only. **Never charged.** |

## 4. Functional requirements

IDs are referenced by the tasks in `docs/02-backlog.md`.

### 4.1 Accounts and members (FR-1)
- FR-1.1 Users sign in securely with **Google sign-in** (other methods may be added later).
- FR-1.2 Admin invites members with a shareable invite link.
- FR-1.3 Admin can change a member's role or deactivate them (history is kept).
- FR-1.4 Members maintain a profile: display name, phone number, photo (optional).

### 4.2 Play schedule (FR-2)
- FR-2.1 Admin defines a **venue** (name, address, number of courts).
- FR-2.2 Admin defines a **recurring schedule**: weekday(s) (normally 2 per week), start/end time, venue, RSVP cutoff (e.g. 3 hours before), and an **optional** player capacity (no fixed limit by default).
- FR-2.3 The system generates individual **sessions** for the coming weeks from the schedule.
- FR-2.4 Admin can cancel or edit a single session (e.g. holiday) without changing the schedule.
- FR-2.5 Everyone sees upcoming sessions in a list and a week/calendar view.

### 4.3 Attendance (FR-3)
- FR-3.1 Members RSVP to a session: **Going / Not going / Maybe**, changeable until the cutoff.
- FR-3.2 *Only if a capacity is set for the session:* when "Going" reaches capacity, further members join a **waitlist** in order. With no capacity, everyone can join.
- FR-3.3 If someone drops out of a full session, the first person on the waitlist is promoted automatically.
- FR-3.4 After the session, admin marks **who actually played** (check-in). This is for records and history only; it does **not** affect the fee.
- FR-3.5 Each member sees their own attendance history.
- FR-3.6 Admin can add **guests** (name only, optional "brought by" member) to a session's attendance. Guests are shown in the attendee list but are **excluded from cost sharing**.

### 4.4 Expenses and cost sharing (FR-4)
- FR-4.1 Admin records the **monthly court fee** (month, amount in LKR, paid date, note). *Shuttlecocks and other expense categories are a future release; the data model keeps a `category` field so they can be added later.*
- FR-4.2 **Monthly sign-up and fee (decided):** the court must be paid for the **full month before the first play day**, so the group works month by month:
  1. **Open month** – admin creates the month (e.g. November) with the court fee and a sign-up deadline (default: **the 1st of the month**).
  2. **Sign up** – members tap *"I'm playing this month"* before the deadline. They can withdraw until the deadline.
  3. **Lock** – at the deadline the admin locks sign-ups. The app calculates:
     `share per member = monthly court fee ÷ number of signed-up members`
     e.g. LKR 40,000 ÷ 16 = LKR 2,500 each.
  4. **Collect** – members pay their share in the **first week**; the admin records payments and pays the court.
  - Signed-up members pay the full share **even if they play only once or not at all**.
  - Members who did not sign up pay nothing for that month.
  - Guests are never charged and are not counted.
  - Cents are distributed so shares add up exactly to the fee (largest-remainder rounding).
  - Late joiners after lock: admin can add them manually; they pay the same share *(assumption – shares of others are not recalculated)*.
- FR-4.3 Admin records payments received from members (cash / bank transfer, date, amount).
- FR-4.4 Each member has a **running balance** (owed vs paid).
- FR-4.5 Admin can **close a month** after it ends: figures are locked and monthly statements are produced. Before lock, the app shows a live *estimated* share based on sign-ups so far.

### 4.5 Reports (FR-5)
- FR-5.1 Member monthly statement: signed up (yes/no), share, payment, balance, sessions played.
- FR-5.2 Admin monthly summary: total expenses by category, total collected, outstanding per member.
- FR-5.3 Dashboard: next session and my RSVP, my balance, quick actions.

## 5. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Mobile-first** responsive UI; usable on a phone browser one-handed. |
| NFR-2 | Money is stored as **integer cents** (no floating point); currency LKR. |
| NFR-3 | Times stored in UTC, displayed in **Asia/Colombo**. |
| NFR-4 | Only signed-in members of the group can see group data; only admins can change finances. |
| NFR-5 | Every pull request runs lint, type check, tests and build automatically (CI). |
| NFR-6 | Runs on free tiers: GitHub, Vercel Hobby, Neon Free. |
| NFR-7 | The backend/API must be reusable by the future mobile app. |
| NFR-8 | Financial changes are auditable (who changed what, when). |

## 6. Technology stack (proposed)

| Layer | Choice | Why |
|---|---|---|
| Web framework | **Next.js (App Router) + TypeScript** | One codebase for UI and API; first-class on Vercel |
| UI | Tailwind CSS + shadcn/ui | Fast, accessible, mobile-friendly components |
| Database | **Neon Postgres** | Free serverless Postgres; branches for previews |
| ORM | **Drizzle ORM** + drizzle-kit migrations | Typed SQL, simple migrations |
| Auth | Auth.js or Better Auth (decide in T-011) | Free, self-hosted, works with Drizzle |
| Validation | Zod | Shared validation for forms and API |
| Tests | Vitest (unit) + Playwright (end-to-end) | Free, fast, CI-friendly |
| Hosting / CD | **Vercel Hobby** | Free; auto-deploys `main`, preview URL per PR |
| CI | **GitHub Actions** | Free for public repos; 2,000 min/month for private repos |
| Planning | **GitHub Issues + GitHub Projects** | Free; Claude Code works with it directly via the `gh` CLI |
| Mobile (phase 2) | Expo (React Native) or PWA (decide in T-032) | Reuses TypeScript skills and the same API |

## 7. Decisions (2026-11-17)

| # | Question | Decision |
|---|---|---|
| 1 | Cost split rule | Monthly court fee ÷ number of members who **signed up for the month by the 1st** (equal share, see FR-4.2). |
| 2 | Court payment | Full month paid to the court before the first play day; fees collected from members in the first week. Signed-up members pay even if they don't play. |
| 3 | Capacity | No fixed rule. Capacity is optional per schedule/session; waitlist applies only when set. |
| 4 | Sign-in | Google sign-in only for now. |
| 5 | Guests | Allowed; added by name by an admin; never charged and not counted in the split. |
| 6 | One group or many | Assumed **one group** for v1 (data model still keeps a `group` so more can be added later). |
| 7 | Notifications | Assumed **not in v1** web; revisit for the mobile app (push). |

| 8 | Shuttlecocks / other costs | **Future release.** v1 handles the court fee only. |
| 9 | Played once vs every session | Same full share (it's based on sign-up, not attendance). |
| 10 | When members pay | At the start of the month, after signing up by the 1st. |

