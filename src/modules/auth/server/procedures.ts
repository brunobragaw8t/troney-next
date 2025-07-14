import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { db } from "@/db";
import { users, activationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import z from "zod";

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

      await db.insert(activationTokens).values({
        userId: user.id,
        value: activationTokenValue,
        expiresAt,
      });

      return true;
    }),
});
