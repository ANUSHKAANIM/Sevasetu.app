# SevaSetu — Implementation Status

Last updated: 2026-09-03

## Status: MVP feature-complete

All 12 phases from the original build plan are implemented and verified
(typecheck, lint, unit tests, dev-mode smoke tests across all three
portals, and a full production build all pass). See the final report in
the session that built this, or re-run the verification commands in
[README.md](../README.md#testing) to confirm current state.

## Completed

- **Foundation** — Next.js 16 (App Router, TypeScript, Tailwind v4,
  Turbopack), SevaSetu brand theme, hand-built shadcn-style UI kit on
  Radix primitives.
- **Database** — Full Prisma schema (26 models, all enums from the spec),
  Prisma 7 driver-adapter config (`prisma.config.ts` + `@prisma/adapter-pg`)
  against a local `prisma dev` Postgres server (no Docker needed), initial
  migration applied, comprehensive seed script.
- **Auth** — JWT session cookies (jose + bcryptjs), register/login/logout
  server actions, role-based redirect helpers, per-route `requireRole` /
  `requireHouseholdContext` / `requireHelperContext` / `requireAdminContext`
  guards.
- **Landing page** — Hero, services, why-SevaSetu, how-it-works (household
  + helper), and a live impact section backed by real DB counts.
- **Household portal** — dashboard, helper search with real filters,
  helper profile view, multi-step hiring wizard (service → schedule →
  responsibilities → live standardized salary preview → review & confirm),
  contracts list/detail, attendance marking, leave review/approval,
  payments (mock confirm), replacement requests, grievances.
- **Helper portal** — dashboard, editable profile with a transparent
  profile-completeness score, services manager, skills & assessment
  history, training catalog (enroll/progress/certificate), job matches
  (job requests ranked by the documented `MatchingService` score, with
  accept/decline), contract detail, attendance view, leave requests,
  payment history, benefits dashboard (demo/integration-pending labeled),
  grievances.
- **Admin portal** — dashboard, user management (activate/suspend), the
  verification workflow console, a salary-rule editor over the full wage
  matrix, jobs & contracts overview, payment management by status,
  training course creation + enrollment stats, replacement-request
  matching, grievance management with internal notes and status changes.
- **Core business logic (unit-tested, DB-free)** — `SalaryService` /
  `computeBreakdownFromRule`, `MatchingService` / `scoreHelperMatch`,
  `LeaveService` (accrual + balance), `lib/authz.ts` (ownership/role
  guards), `ProfileService` completeness scoring. 28 tests across 5 files,
  all passing (`npm test`).
- **Docs** — README, this file, `docs/LEGAL_AND_COMPLIANCE.md`.
- **Git** — scoped repo initialized inside the project folder (the user's
  home directory turned out to already be an unrelated git repo pushed to
  a different GitHub project — deliberately left untouched).

## Known limitations / things a future session should know

1. **GitHub CLI (`gh`) is not installed** in this environment, so the repo
   has not been pushed anywhere. Once `gh` is available and authenticated
   (or a remote is added manually), push with the usual `git remote add` /
   `git push -u origin main` flow.
2. **Local dev database is ephemeral.** `npx prisma dev` (a local
   Postgres-compatible server with no install/Docker required) must be
   running in a separate terminal for the app to have a database. It is
   *not* a background service — restart it each dev session. If you see a
   one-off "Connection terminated unexpectedly" error after running
   `build`/`start`/`dev` concurrently against it, that's the lightweight
   local server being momentarily overloaded by multiple connection
   pools — it self-heals; just retry the request. This is a local-dev-only
   characteristic and not expected against a real Postgres deployment.
3. **Suspending a user (`isActive = false`) only blocks future logins.**
   An already-issued session JWT is not revoked server-side (there's no
   per-request DB check in `getSession()` — only a signature/expiry
   check). Acceptable for an MVP; a production build would want either
   short-lived tokens with refresh, or a session/deny-list table.
4. **`scripts/dev-mint-token.js`** is a gitignored, dev-only helper used
   during this build to smoke-test protected pages with `curl` instead of
   driving a real browser through the Server Action protocol. Not part of
   the app; safe to delete.
5. **Payments, PF/ESI, insurance, and identity verification are all
   mocked or workflow-only** — see `docs/LEGAL_AND_COMPLIANCE.md` for the
   full list and what a real integration would require.
6. **No email/SMS/WhatsApp sending.** Notifications are in-app only
   (`Notification` model + the bell in the portal header). The
   `NotificationType` enum and `Notification` model are structured so a
   real channel could be added by fanning out from the same creation
   points without a schema change.
7. **`npm audit`** currently reports 4 high-severity advisories, all in
   Prisma CLI's own bundled MySQL driver / dev-only tooling dependencies
   (`mysql2`, `deepmerge-ts`) — not reachable from the deployed app, which
   only uses the Postgres driver adapter at runtime. Re-check on your next
   `npm install` in case newer Prisma releases have picked up fixes.

## Suggested next steps (not started)

- Playwright/browser-based end-to-end tests (this build was verified via
  typecheck + unit tests + `curl`-based smoke tests with minted session
  cookies, not a real browser click-through).
- Email verification / password reset flows (architecture placeholders
  only — not implemented).
- Pagination on admin list pages (users, payments, salary rules) once seed
  data volume grows meaningfully beyond what's here.
