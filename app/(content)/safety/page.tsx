import type { Metadata } from "next";

export const metadata: Metadata = { title: "Safety — SevaSetu" };

export default function SafetyPage() {
  return (
    <article className="prose-sm max-w-none space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Safety on SevaSetu</h1>
      <p className="text-muted-foreground">
        SevaSetu is designed around structured verification and transparent records, but no
        platform can guarantee safety in someone&apos;s home. Please read this page carefully.
      </p>

      <section>
        <h2 className="font-serif text-xl font-semibold">Verification workflow</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Helpers on SevaSetu go through an identity, address, reference and background-check
          workflow tracked in their profile. For this MVP, these are internal workflow statuses
          managed by the SevaSetu operations team — they are <strong>not</strong> automated
          verifications against government databases. Always exercise your own judgment when
          hiring, meet candidates before finalizing an engagement, and trust your instincts.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">In an emergency</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          If you or someone else is in immediate danger, contact local emergency services first.
          SevaSetu&apos;s in-app grievance system is for workplace disputes, payment issues and
          policy violations — it is not a substitute for emergency response and is not monitored
          24/7 in this MVP.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">Reporting a concern</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the Grievances section of your dashboard to raise a concern. Our team reviews and
          responds through that thread, and can escalate serious issues internally.
        </p>
      </section>
    </article>
  );
}
