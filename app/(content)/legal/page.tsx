import type { Metadata } from "next";

export const metadata: Metadata = { title: "Legal & Compliance — SevaSetu" };

const AREAS = [
  "Domestic worker regulations (state-specific, India)",
  "Employment classification (contractor vs. employee)",
  "Labour law applicability",
  "State-specific minimum wage requirements",
  "Provident Fund (PF) and ESI obligations",
  "Data protection and privacy law compliance",
  "Enforceability of digital contracts",
  "Insurance product regulations",
  "Payment aggregator / PA-PG regulations",
];

export default function LegalPage() {
  return (
    <article className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Legal &amp; compliance notes</h1>
      <p className="rounded-md bg-warning/10 p-4 text-sm">
        <strong>SevaSetu is an MVP demonstration platform.</strong> Professional legal and
        regulatory review is required before any production deployment. Nothing on this page or
        elsewhere in the product should be read as a legal compliance claim.
      </p>

      <section>
        <h2 className="font-serif text-xl font-semibold">Areas requiring professional review</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {AREAS.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">What is mocked or workflow-only in this MVP</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Payments — simulated via a MockPaymentProvider; no real money moves.</li>
          <li>PF / ESI — contribution records only, not connected to EPFO or ESIC.</li>
          <li>Insurance — enrollment records only, not connected to a live insurer.</li>
          <li>Identity/address/reference/background verification — internal workflow statuses, not automated government verification.</li>
          <li>Digital employment agreements — structured records for transparency, not represented as legally binding contracts.</li>
        </ul>
      </section>

      <p className="text-sm text-muted-foreground">
        The full engineering-facing version of this document lives at{" "}
        <code>docs/LEGAL_AND_COMPLIANCE.md</code> in the project repository.
      </p>
    </article>
  );
}
