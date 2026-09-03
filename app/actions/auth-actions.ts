"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSessionCookie,
  clearSessionCookie,
  hashPassword,
  verifyPassword,
  roleHomePath,
} from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { CITY_TIER } from "@/lib/constants";

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    role: formData.get("role"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const { role, name, email, phone, city, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      error: "Registration failed.",
      fieldErrors: { email: "An account with this email already exists." },
    };
  }

  const locationTier = CITY_TIER[city] ?? "TIER_2";
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      name,
      phone: phone || undefined,
      ...(role === "HOUSEHOLD"
        ? { householdProfile: { create: { city, locationTier } } }
        : {
            helperProfile: {
              create: { city, locationTier, languages: [] },
            },
          }),
    },
  });

  await createSessionCookie({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect(roleHomePath(user.role));
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSessionCookie({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect(roleHomePath(user.role));
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
