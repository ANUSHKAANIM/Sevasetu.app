import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="font-serif text-lg font-semibold text-primary">SevaSetu</p>
          <p className="mt-2 text-sm text-muted-foreground">Bridge of Service</p>
        </div>
        <div>
          <p className="text-sm font-semibold">About</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/#why-sevasetu" className="hover:text-foreground">Our approach</Link></li>
            <li><Link href="/#services" className="hover:text-foreground">Services</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Trust & Safety</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/safety" className="hover:text-foreground">Safety</Link></li>
            <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/contact" className="hover:text-foreground">Get in touch</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} SevaSetu. This is an MVP demonstration platform — see{" "}
        <Link href="/legal" className="underline">
          legal &amp; compliance notes
        </Link>
        .
      </div>
    </footer>
  );
}
