import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

// SHADOW_DATABASE_URL is only used by `prisma migrate dev`'s diffing during
// local development (see README) — it must stay optional here since it
// isn't set in deployed environments (Vercel, CI), where only
// `prisma migrate deploy` runs. `env()` throws if the var is missing at
// all, so read it directly instead for this one.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
  migrations: {
    seed: "node --experimental-strip-types prisma/seed.ts",
  },
});
