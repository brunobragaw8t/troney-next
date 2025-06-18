import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    JWT_SECRET: z.string(),
    DATABASE_URL: z.string(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z.coerce.boolean().default(false),
    SMTP_AUTH_USER: z.string().email(),
    SMTP_AUTH_PASS: z.string(),
    SMTP_FROM_NAME: z.string().default('Troney'),
    SMTP_FROM_EMAIL: z.string().email(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  // runtimeEnv: {},
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
