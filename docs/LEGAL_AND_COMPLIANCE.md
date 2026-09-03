# Legal & Compliance Notes

> **Professional legal and regulatory review is required before production
> deployment.** SevaSetu is an MVP demonstration platform built to show the
> product and technical shape of a domestic-worker employment facilitation
> service. Nothing in this codebase, its UI copy, or this document should be
> read as a claim of legal compliance in any jurisdiction.

## Areas that need professional legal review before launch

### Employment & labour law

- **Employment classification.** Whether a helper engaged through SevaSetu
  is an independent contractor, a household's direct employee, or an
  employee of a staffing intermediary differs by jurisdiction and materially
  changes who owes what (wages, notice, termination protections, PF/ESI).
  This MVP does not take a legal position on classification.
- **Domestic worker–specific regulations.** India does not yet have a single
  central law governing domestic workers; protections come from a mix of
  state-level acts, minimum wage notifications, and (in some states)
  registration/welfare board schemes. These must be reviewed per state of
  operation.
- **Minimum wage requirements.** `SalaryRule` records in this MVP are
  platform-defined defaults for demonstration purposes — they are **not**
  sourced from or reconciled against any state's official minimum wage
  notifications. Before launch, wage floors per state/sector must be
  reviewed and the salary engine's admin-configurable rules updated
  accordingly.
- **Working hours, leave, and termination.** The leave accrual logic in
  `services/leave-service.ts` (15 annual / 12 sick days at full-time,
  prorated for part-time) is a platform default modeled loosely on common
  shops-and-establishments conventions — it has not been validated against
  any specific state's Shops & Establishments Act or equivalent.

### Statutory benefits (PF / ESI)

- `BenefitContribution` records in this MVP are bookkeeping entries only.
  There is **no integration with EPFO (Employees' Provident Fund
  Organisation) or ESIC (Employees' State Insurance Corporation)**.
  Real PF/ESI applicability depends on establishment type, headcount, and
  wage thresholds that this MVP does not evaluate.
- Insurance (`InsuranceEnrollment`) is similarly a workflow record with no
  connection to a licensed insurer.

### Data protection

- User data handling should be reviewed against India's Digital Personal
  Data Protection Act (DPDP Act, 2023) and any other applicable data
  protection regime before launch — including consent flows, data
  retention/deletion, breach notification, and cross-border transfer if
  infrastructure is hosted outside India.
- This MVP does not store government ID numbers (e.g. Aadhaar) in plain
  text and does not implement an ID-document upload/storage flow at all.
  A production identity-verification flow would need its own dedicated
  security and compliance review (encryption at rest, access controls,
  retention limits, DPDP consent).

### Digital contracts

- The `EmploymentContract` record and its rendered "employment agreement"
  view are structured records for transparency and dispute reference, not
  represented as legally binding, government-approved contracts. Whether
  and how a digital record like this becomes an enforceable contract
  (e.g. under the Indian Contract Act, IT Act provisions on electronic
  records, or a specific state's requirements) needs legal sign-off.

### Payments

- All payment flows are simulated via `MockPaymentProvider`
  (`services/payment-service.ts`). No real money moves. Before integrating
  a real provider (Razorpay, a UPI PSP, or a bank), review:
  - RBI Payment Aggregator / Payment Gateway (PA-PG) guidelines
  - Nodal/escrow account requirements for a platform mediating payments
    between two other parties (household and helper)
  - KYC obligations for both payer and payee

### Insurance

- `InsuranceEnrollment` records are demonstration-only. Offering or
  facilitating insurance products in India requires IRDAI-compliant
  distribution arrangements with a licensed insurer or intermediary.

## What this MVP explicitly does NOT claim

- ❌ Automated government identity/address verification
- ❌ Live EPFO or ESIC integration
- ❌ Live insurance underwriting or claims
- ❌ Real payment processing
- ❌ Legally binding digital contract execution
- ❌ Certified compliance with any state's minimum wage notification

## What this MVP does provide

- ✅ A configurable, transparent, auditable **wage calculation architecture**
  (`SalaryRule` → `SalaryService` → frozen `SalaryCalculation` snapshots)
  that a compliance team can populate with jurisdiction-correct figures.
- ✅ A **verification status workflow** (`NOT_STARTED` → `PENDING` →
  `VERIFIED` / `REJECTED`) ready to be backed by a real verification
  provider.
- ✅ A **benefits record architecture** (`BenefitContribution`,
  `InsuranceEnrollment`) ready to be backed by real EPFO/ESIC/insurer
  integrations behind the same data model.
- ✅ A **mediated payment architecture** (`PaymentProvider` interface,
  `MockPaymentProvider` implementation) designed so a real gateway can be
  swapped in without changing the rest of the application.
- ✅ Auditable records for attendance, leave, grievances and contract
  changes.

## Recommended next steps before any production launch

1. Engage employment/labour counsel per state of operation.
2. Engage a data protection specialist for a DPDP Act gap assessment.
3. Replace `MockPaymentProvider` with a licensed payment aggregator
   integration, with the appropriate escrow/nodal account structure.
4. Replace workflow-only verification with a real background-check /
   identity-verification vendor, under a documented data retention policy.
5. Have counsel review and, if appropriate, formally draft the employment
   agreement template rendered by the contract view.
6. Validate every seeded `SalaryRule` figure against actual, current
   state minimum wage notifications before using them for real wages.
