import { z } from "zod";
import * as bcrypt from "bcrypt";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

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
      const usersWithSameEmail = await ctx.db
        .select()
        .from(users)
        .where(sql`email = ${input.email}`);

      if (usersWithSameEmail.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `The email ${input.email} is already registered.`,
        });
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(input.password, salt);

      await ctx.db.insert(users).values({
        name: input.name,
        email: input.email,
        password: hashedPassword,
      });
    }),
});
