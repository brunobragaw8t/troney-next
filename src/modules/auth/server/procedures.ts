import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { db } from "@/db";
import { users, activationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import z from "zod";
import * as nodemailer from "nodemailer";
import { env } from "@/env";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(256)
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

export const authRouter = createTRPCRouter({
  register: baseProcedure
    .input(
      z
        .object({
          name: z.string().min(2).max(256),
          email: z.string().email(),
          password: passwordSchema,
          passwordConfirmation: passwordSchema,
        })
        .refine((data) => data.password === data.passwordConfirmation, {
          message: "Passwords do not match",
          path: ["passwordConfirmation"],
        }),
    )
    .mutation(async ({ input }) => {
      const { name, email, password } = input;

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const [user] = await db
        .insert(users)
        .values({
          name,
          email,
          passwordHash,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
        });

      const activationTokenValue = crypto.randomBytes(16).toString("hex");
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + TWENTY_FOUR_HOURS);

      const [activationToken] = await db
        .insert(activationTokens)
        .values({
          userId: user.id,
          value: activationTokenValue,
          expiresAt,
        })
        .returning({
          id: activationTokens.id,
          userId: activationTokens.userId,
          value: activationTokens.value,
          expiresAt: activationTokens.expiresAt,
        });

      const transport = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_AUTH_USER,
          pass: env.SMTP_AUTH_PASS,
        },
      });

      const activationLink = `${env.NEXT_PUBLIC_APP_URL}/activate/${activationToken.value}`;

      await transport.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: user.email,
        subject: "Troney | Activate your account",
        html: `Hi, ${user.name}.<br />
          Your account was successfully created. Please click the following link to active it:<br />
          <br />
          <a href="${activationLink}" target="_blank">${activationLink}</a>`,
      });

      return true;
    }),

  activate: baseProcedure
    .input(
      z.object({
        token: z.string().min(1, "Activation token is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const { token } = input;

      const [data] = await db
        .select({
          id: activationTokens.id,
          userId: activationTokens.userId,
          expiresAt: activationTokens.expiresAt,
          userActivatedAt: users.activatedAt,
        })
        .from(activationTokens)
        .innerJoin(users, eq(activationTokens.userId, users.id))
        .where(eq(activationTokens.value, token));

      if (!data || new Date() > data.expiresAt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activation token is invalid or expired",
        });
      }

      if (data.userActivatedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is already activated",
        });
      }

      await db
        .update(users)
        .set({ activatedAt: new Date() })
        .where(eq(users.id, data.userId));

      await db
        .delete(activationTokens)
        .where(eq(activationTokens.userId, data.userId));

      return true;
    }),
});
