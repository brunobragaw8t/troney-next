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

  createEarning: protectedProcedure
    .input(
      z.object({
        walletId: z.string().uuid().optional(),
        title: z
          .string()
          .min(1, "Title is required")
          .max(100, "Title must be 100 characters or less")
          .trim(),
        description: z
          .string()
          .min(1, "Description is required")
          .max(255, "Description must be 255 characters or less")
          .trim(),
        value: z
          .number()
          .min(0.01, "Value must be greater than 0")
          .max(999999.99, "Value must be less than 1,000,000"),
        source: z
          .string()
          .max(100, "Source must be 100 characters or less")
          .trim(),
        date: z.date().max(new Date(), "Date must be in the past"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const userBuckets = await tx
          .select()
          .from(buckets)
          .where(eq(buckets.userId, ctx.session.userId))
          .orderBy(asc(buckets.name));

        if (userBuckets.length === 0) {
          throw new TRPCError({
            message:
              "You must have at least one bucket before creating an earning",
            code: "PRECONDITION_FAILED",
          });
        }

        const totalBudget = userBuckets.reduce(
          (sum, bucket) => sum + parseFloat(bucket.budget),
          0,
        );

        if (totalBudget !== 100) {
          throw new TRPCError({
            message: "Total bucket budget percentage must be 100",
            code: "PRECONDITION_FAILED",
          });
        }

        const [earning] = await tx
          .insert(earnings)
          .values({
            userId: ctx.session.userId,
            title: input.title,
            description: input.description,
            value: input.value.toString(),
            source: input.source,
            date: input.date.toString(),
          })
          .returning();

        await Promise.all(
          userBuckets.map((bucket) => {
            const bucketPercentage = parseFloat(bucket.budget) / 100;
            const distributionAmount = input.value * bucketPercentage;

            return tx
              .update(buckets)
              .set({
                balance: bucket.balance + distributionAmount,
              })
              .where(eq(buckets.id, bucket.id));
          }),
        );

        return earning;
      });
    }),

});
