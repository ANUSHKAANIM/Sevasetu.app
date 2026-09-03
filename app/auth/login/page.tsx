import type { Metadata } from "next";
import { LoginForm } from "@/components/shared/login-form";

export const metadata: Metadata = { title: "Sign in — SevaSetu" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Sign in to your SevaSetu account.
      </p>
      <LoginForm />
    </div>
  );
}
