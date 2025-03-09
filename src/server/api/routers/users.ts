import { z } from "zod";
import * as bcrypt from "bcrypt";
import * as nodemailer from "nodemailer";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { activationTokens, users } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import jwt from "jsonwebtoken";

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

  login: publicProcedure
    .input(
      z.object({
        email: z.string().max(256).email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const selectUserByEmailResult = await ctx.db
        .select()
        .from(users)
        .where(sql`email=${input.email}`);

      const user = selectUserByEmailResult[0];

      if (!user || !bcrypt.compareSync(input.password, user.password)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Incorrect email and/or password.",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      return { token };
    }),

  resendActivationEmail: publicProcedure
    .input(z.string().email())
    .mutation(async ({ ctx, input }) => {
      const selectUserByEmailResult = await ctx.db
        .select()
        .from(users)
        .where(sql`email=${input}`)
        .leftJoin(activationTokens, eq(activationTokens.userId, users.id));

      const res = selectUserByEmailResult[0];

      if (!res) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const { users: user, activation_tokens: activationToken } = res;

      if (user.activatedAt !== null) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already activated.",
        });
      }

      if (!activationToken) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected error",
        });
      }

      if (activationToken.resentAt !== null) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Activation email already resent.",
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

      await ctx.db
        .update(activationTokens)
        .set({ resentAt: sql`NOW()` })
        .where(sql`id=${activationToken.id}`);
    }),

  activate: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const selectActivationTokensResult = await ctx.db
        .select()
        .from(activationTokens)
        .where(sql`value=${input}`)
        .leftJoin(users, eq(users.id, activationTokens.userId));

      const activationToken = selectActivationTokensResult[0];

      if (!activationToken || !activationToken.users) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activation token not found.",
        });
      }

      const [updateUserResult] = await ctx.db
        .update(users)
        .set({ activatedAt: sql`NOW()` })
        .where(sql`id=${activationToken.users.id}`);

      if (updateUserResult.affectedRows === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not activate user",
        });
      }

      await ctx.db
        .delete(activationTokens)
        .where(sql`id=${activationToken.activation_tokens.id}`);
    }),
});
