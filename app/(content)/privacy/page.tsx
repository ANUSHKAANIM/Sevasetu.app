import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy — SevaSetu" };

export default function PrivacyPage() {
  return (
    <article className="prose-sm max-w-none space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Privacy notice</h1>
      <p className="text-muted-foreground">
        SevaSetu is currently an MVP demonstration platform. This notice describes how the
        product is designed to handle data — it is not a substitute for a legally reviewed
        privacy policy, which is required before any production launch (see{" "}
        <a href="/legal" className="underline">legal &amp; compliance notes</a>).
      </p>

      <section>
        <h2 className="font-serif text-xl font-semibold">What we store</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Account details: name, email, phone, hashed password (never stored in plain text).</li>
          <li>Household and helper profile details you provide (city, languages, experience, etc).</li>
          <li>Employment records: contracts, attendance, leave, payments and reviews tied to your account.</li>
          <li>Grievance and notification history.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">What we deliberately do not store</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          SevaSetu does not store sensitive identity documents (such as Aadhaar numbers) in plain
          text. Verification is tracked as a status, not a document store, in this MVP.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">Third parties</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Payments, benefits (PF/ESI) and insurance are currently mocked/demo features — no data
          is shared with a real payment gateway, EPFO, ESIC, or an insurance provider. See the
          Mocked / Future Integrations section of the README for details.
        </p>
      </section>
    </article>
  );
}
