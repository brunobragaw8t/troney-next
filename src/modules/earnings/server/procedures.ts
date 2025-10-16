import { db } from "@/db";
import { earnings, buckets } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import z from "zod";

export const earningsRouter = createTRPCRouter({
  getEarnings: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(earnings)
      .where(eq(earnings.userId, ctx.session.userId))
      .orderBy(desc(earnings.date));
  }),

  getEarning: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const [earning] = await db
        .select()
        .from(earnings)
        .where(
          and(eq(earnings.id, input), eq(earnings.userId, ctx.session.userId)),
        );

      if (!earning) {
        throw new TRPCError({
          message: `Earning ${input} not found`,
          code: "NOT_FOUND",
        });
      }

      return earning;
    }),
});
