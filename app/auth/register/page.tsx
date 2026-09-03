import type { Metadata } from "next";
import { RegisterForm } from "@/components/shared/register-form";

export const metadata: Metadata = { title: "Create an account — SevaSetu" };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-xl font-semibold">Create your account</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Join SevaSetu as a household or a service professional.
      </p>
      <RegisterForm />
    </div>
  );
}
