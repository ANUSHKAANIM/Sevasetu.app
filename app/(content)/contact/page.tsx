import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact — SevaSetu" };

export default function ContactPage() {
  return (
    <article className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Contact</h1>
      <p className="text-muted-foreground">
        This MVP deployment does not yet have a live support inbox connected. If you are
        evaluating SevaSetu for development purposes, contact details would go here in a
        production deployment (support email, phone, and office address).
      </p>
      <p className="text-sm text-muted-foreground">
        For account-specific issues, sign in and use the Grievances section of your dashboard —
        it creates a tracked thread reviewed by the SevaSetu operations team.
      </p>
    </article>
  );
}
