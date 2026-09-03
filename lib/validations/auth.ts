import { z } from "zod";

export const registerSchema = z
  .object({
    role: z.enum(["HOUSEHOLD", "HELPER"], {
      message: "Select whether you are a household or a service professional.",
    }),
    name: z.string().trim().min(2, "Enter your full name."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .min(10, "Enter a valid phone number.")
      .optional()
      .or(z.literal("")),
    city: z.string().trim().min(2, "Select your city."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Za-z]/, "Password must include a letter.")
      .regex(/[0-9]/, "Password must include a number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginInput = z.infer<typeof loginSchema>;
