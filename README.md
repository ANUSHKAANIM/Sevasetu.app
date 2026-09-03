# SevaSetu — Bridge of Service

An MVP workforce-management and employment-facilitation platform for
India's domestic services sector: standardized wages, digital employment
records, skill development, and mediated payments — built to dignify work
that has historically been informal and opaque.

> **This is an MVP demonstration build.** Payments, PF/ESI, insurance, and
> identity verification are mocked or workflow-only. See
> [docs/LEGAL_AND_COMPLIANCE.md](docs/LEGAL_AND_COMPLIANCE.md) before
> treating any of this as production-ready.

## 1. Project overview

SevaSetu connects **households** with verified, skilled **service
professionals** (maids, cooks, nannies, elderly caregivers, drivers,
live-in help) through a structured employment facilitation platform
rather than an unmediated listings marketplace. **Admins** run
verification, salary rules, matching oversight, disputes, and training.

## 2. Features

- Standardized, admin-configurable **salary engine** with frozen
  per-contract snapshots
- Multi-step **hiring workflow** → job request → accept/decline → active
  contract
- **Attendance** and **leave** management with configurable accrual
- **Mediated (mock) payments** via a swappable `PaymentProvider`
  abstraction
- **Benefits records** (PF/ESI/insurance) — demo/integration-pending
- **Verification workflow** (identity/address/reference/background)
- **Skill assessments**, **skill tiers**, and a **training** catalog
- Transparent, documented **job-matching score**
- **Replacement requests** and a **grievance** system with threaded
  messages and admin internal notes
- In-app **notifications**
- Full **admin portal** for all of the above

## 3. Architecture

```
Browser
  │
  ▼
Next.js App Router (Server Components + Server Actions + Route Handlers)
  │
  ├── app/actions/*        Server Actions (mutations, auth-checked)
  ├── app/api/*             Route Handlers (e.g. salary calculator)
  ├── services/*            Business logic, DB-free where possible
  ├── lib/*                 Auth, authorization, session, shared constants
  └── prisma/                Schema, migrations, seed
        │
        ▼
   PostgreSQL (local via `prisma dev`, no Docker required)
```

Business logic is deliberately kept out of UI components. `SalaryService`,
`MatchingService`, and `LeaveService` are unit-tested independent of the
database (see `services/*.ts` and `tests/*.test.ts`).

## 4. Tech stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript,
  Tailwind CSS v4, a hand-built shadcn-style UI kit on Radix primitives,
  React Hook Form + Zod (auth/profile forms)
- **Backend:** Next.js Server Actions & Route Handlers, service-layer
  business logic
- **Database:** PostgreSQL via Prisma ORM 7 (driver-adapter config,
  `@prisma/adapter-pg`)
- **Auth:** Custom JWT session cookies (`jose`) + `bcryptjs` password
  hashing — no third-party auth provider
- **Testing:** Vitest

## 5. Project structure

```
app/
  (content)/        Static pages: safety, privacy, terms, contact, legal
  actions/           Server Actions grouped by domain
  api/                Route Handlers (salary calculator)
  auth/               Login / register
  household/          Household portal (dashboard, search, hiring, ...)
  helper/             Helper portal (dashboard, profile, training, ...)
  admin/              Admin portal (dashboard, users, salary rules, ...)
components/
  ui/                 Hand-built shadcn-style primitives
  shared/             Cross-portal components (portal shell, grievance UI, ...)
  household/ helper/ admin/   Portal-specific components
lib/                  auth.ts, authz.ts, prisma.ts, constants.ts, validations/
services/              SalaryService, MatchingService, LeaveService, PaymentService, ProfileService
prisma/                schema.prisma, migrations/, seed.ts
tests/                 Vitest unit tests for services/ and lib/authz.ts
docs/                  LEGAL_AND_COMPLIANCE.md, IMPLEMENTATION_STATUS.md
```

## 6. Local setup

Requirements: Node.js ≥ 20.9 (this project was built and tested on
Node 24), npm.

```bash
npm install
```

## 7. Environment variables

Copy `.env.example` to `.env` and fill in real values:

```
DATABASE_URL=          # from `npx prisma dev` (see below)
SHADOW_DATABASE_URL=    # also printed by `npx prisma dev`
SESSION_SECRET=         # random string, e.g.:
                        # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXT_PUBLIC_APP_URL=    # http://localhost:3000
```

## 8. Database setup

No Docker or local PostgreSQL install required. In a **separate terminal**,
from the project root:

```bash
npx prisma dev
```

This starts a local, Postgres-protocol-compatible server and prints a
`DATABASE_URL` / `SHADOW_DATABASE_URL` — paste those into `.env`. Leave
this process running while you develop.

Then, in your main terminal:

```bash
npx prisma migrate dev   # applies migrations (already committed under prisma/migrations/)
npm run db:seed          # populates demo data
```

## 9. Demo accounts

All seeded accounts share the password **`Password123!`**

| Role      | Email                    |
| --------- | ------------------------ |
| Admin     | `admin@sevasetu.in`      |
| Household | `household1@sevasetu.in` (through `household6@sevasetu.in`) |
| Helper    | `helper1@sevasetu.in` (through `helper24@sevasetu.in`) |

## 10. Running the application

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 11. Testing

```bash
npm run lint        # ESLint (flat config, Next 16)
npm run typecheck    # tsc --noEmit
npm test             # Vitest — SalaryService, MatchingService, LeaveService, authz, ProfileService
npm run build        # production build (also type-checks)
```

All four currently pass clean against this codebase.

## 12. Deployment

Deployed on Vercel: **https://sevasetu-anushkas-projects-cfaf755b.vercel.app**

- Database: a managed Prisma Postgres instance (Vercel Storage / Prisma
  marketplace integration), separate from the local `prisma dev` server
  used for development. `DATABASE_URL` is set as a Vercel project env var
  for Production, Preview, and Development.
- `SESSION_SECRET` is a distinct, randomly generated production secret
  (not the one in your local `.env`).
- `postinstall: prisma generate` runs the Prisma Client generation step
  Vercel's build otherwise skips.
- Migrations were applied with `prisma migrate deploy` and the database
  was seeded with the same demo data described above, so the demo
  accounts work on the live URL too.
- Deployment Protection (Vercel SSO) is off, so the URL is publicly
  reachable — anyone can view it, but the app's own login still gates
  every portal.

For a from-scratch deployment elsewhere, you'd need: a managed
PostgreSQL instance in place of `prisma dev`, a real `SESSION_SECRET`,
and — before going anywhere near real users — the items in
[docs/LEGAL_AND_COMPLIANCE.md](docs/LEGAL_AND_COMPLIANCE.md).

## 13. Known limitations

See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) for the
full, current list (session revocation on suspend, no e2e browser tests
yet, no pagination on large admin lists, etc).

## 14. Mocked systems / future integrations

Clearly separated so nothing here is mistaken for a live integration:

| System | Status in this MVP |
| --- | --- |
| Payments | **Mocked.** `MockPaymentProvider` implements a `PaymentProvider` interface; no real money moves. Swap in Razorpay/UPI/banking behind the same interface. |
| PF / ESI | **Record-keeping only.** No EPFO/ESIC integration. |
| Insurance | **Record-keeping only.** No live insurer integration. |
| Identity/address/reference/background verification | **Workflow statuses only,** set by admins. No automated government verification. |
| Email / SMS / WhatsApp | **Not implemented.** In-app notifications only; the data model is ready for a real channel to be added. |
| Savings / emergency loans | **Not implemented,** labeled "Demo / Integration Pending" in the UI. |

---

Built as an MVP demonstration. See
[docs/LEGAL_AND_COMPLIANCE.md](docs/LEGAL_AND_COMPLIANCE.md) before any
production use.
