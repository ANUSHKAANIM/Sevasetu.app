"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIES } from "@/lib/constants";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );
  const [role, setRole] = useState<"HOUSEHOLD" | "HELPER">("HOUSEHOLD");
  const [city, setCity] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label>I am registering as a...</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("HOUSEHOLD")}
            className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
              role === "HOUSEHOLD"
                ? "border-primary bg-primary/5 text-primary"
                : "border-input text-muted-foreground hover:bg-muted"
            }`}
          >
            Household
          </button>
          <button
            type="button"
            onClick={() => setRole("HELPER")}
            className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
              role === "HELPER"
                ? "border-primary bg-primary/5 text-primary"
                : "border-input text-muted-foreground hover:bg-muted"
            }`}
          >
            Service Professional
          </button>
        </div>
        <input type="hidden" name="role" value={role} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required autoComplete="name" />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
          {state.fieldErrors?.email && (
            <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="city">City</Label>
        <Select name="city" value={city} onValueChange={setCity}>
          <SelectTrigger id="city">
            <SelectValue placeholder="Select your city" />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="city" value={city} />
        {state.fieldErrors?.city && (
          <p className="text-xs text-destructive">{state.fieldErrors.city}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
          />
          {state.fieldErrors?.password && (
            <p className="text-xs text-destructive">{state.fieldErrors.password}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
          />
          {state.fieldErrors?.confirmPassword && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
