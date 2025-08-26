// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
