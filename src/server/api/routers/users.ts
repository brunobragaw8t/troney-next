import { z } from "zod";
import * as bcrypt from "bcrypt";
import * as nodemailer from "nodemailer";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { activationTokens, users } from "~/server/db/schema";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

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

export const usersRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z
        .object({
          name: z
            .string()
            .min(2, { message: "Name must contain at least 2 characters" })
            .max(256, { message: "Name must contain at most 256 characters" }),
          email: z.string().max(256).email(),
          password: passwordSchema,
          repassword: passwordSchema,
        })
        .refine((data) => data.password === data.repassword, {
          message: "Passwords don't match",
          path: ["repassword"],
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const conflictingUser = await ctx.db.query.users.findFirst({
        where: sql`email=${input.email}`,
      });

      if (conflictingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `The email ${input.email} is already registered.`,
        });
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(input.password, salt);

      const insertUserRes = await ctx.db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          password: hashedPassword,
        })
        .$returningId();

      const userRow = insertUserRes[0];

      if (!userRow) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unknown error has occurred. Please try again.",
        });
      }

      const user = await ctx.db.query.users.findFirst({
        where: sql`id=${userRow.id}`,
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unknown error has occurred. Please try again.",
        });
      }

      const insertActivationTokenRes = await ctx.db
        .insert(activationTokens)
        .values({ userId: user.id })
        .$returningId();

      const activationTokenRow = insertActivationTokenRes[0];

      if (!activationTokenRow) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unknown error has occurred. Please try again.",
        });
      }

      const activationToken = await ctx.db.query.activationTokens.findFirst({
        where: sql`id=${activationTokenRow.id}`,
      });

      if (!activationToken) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unknown error has occurred. Please try again.",
        });
      }

      const transport = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        secure: "true" === env.SMTP_SECURE,
        auth: {
          user: env.SMTP_AUTH_USER,
          pass: env.SMTP_AUTH_PASS,
        },
      });

      const activationLink = `${env.APP_URL}/activate/${activationToken.value}`;

      await transport.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: user.email,
        subject: "Troney | Activate your account",
        html: `Hi, ${user.name}.<br />
          Your account was successfully created. Please click the following link to active it:<br />
          <br />
          <a href="${activationLink}" target="_blank">${activationLink}</a>`,
      });
    }),
});
