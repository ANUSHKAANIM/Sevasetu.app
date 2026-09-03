import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-2xl font-semibold text-primary">
            SevaSetu
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">Bridge of Service</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
