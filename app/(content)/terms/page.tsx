import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms — SevaSetu" };

export default function TermsPage() {
  return (
    <article className="prose-sm max-w-none space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Terms of use (MVP)</h1>
      <p className="text-muted-foreground">
        This is a demonstration MVP, not a production consumer service, and these terms are a
        simplified placeholder. Professional legal review is required before any production
        launch — see <a href="/legal" className="underline">legal &amp; compliance notes</a>.
      </p>

      <section>
        <h2 className="font-serif text-xl font-semibold">Nature of the platform</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          SevaSetu facilitates connections between households and independent service
          professionals and provides tools for standardized wage calculation, digital employment
          records, attendance, leave and mediated payments. Employment classification, minimum
          wage compliance, and statutory obligations vary by jurisdiction and are the
          responsibility of the parties involved, subject to applicable law.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">Digital agreements</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Employment agreements generated in this MVP are structured records for transparency and
          record-keeping. They are not represented as legally binding, government-approved
          contracts.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">Payments</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          All payment flows in this MVP are simulated (mock) and do not move real money.
        </p>
      </section>
    </article>
  );
}
