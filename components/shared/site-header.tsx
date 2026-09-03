import Link from "next/link";
import { getSession } from "@/lib/auth";
import { roleHomePath } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-serif text-xl font-semibold text-primary">
          SevaSetu
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 md:flex">
          <Link href="/#services" className="hover:text-foreground">
            Services
          </Link>
          <Link href="/#how-it-works" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/#why-sevasetu" className="hover:text-foreground">
            Why SevaSetu
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <Button asChild size="sm">
              <Link href={roleHomePath(session.role)}>Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
