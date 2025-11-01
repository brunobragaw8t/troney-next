import { db } from "@/db";
import { earnings, buckets, earningAllocations, wallets } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import z from "zod";

export const earningsRouter = createTRPCRouter({
  getEarnings: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select({
        id: earnings.id,
        userId: earnings.userId,
        walletId: earnings.walletId,
        title: earnings.title,
        description: earnings.description,
        value: earnings.value,
        source: earnings.source,
        date: earnings.date,
        createdAt: earnings.createdAt,
        updatedAt: earnings.updatedAt,
        walletName: wallets.name,
      })
      .from(earnings)
      .leftJoin(wallets, eq(earnings.walletId, wallets.id))
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
        walletId: z
          .string()
          .uuid("Please select in which wallet the earning will be stored"),
        title: z
          .string()
          .min(1, "Title is required")
          .max(100, "Title must be 100 characters or less")
          .trim(),
        description: z
          .string()
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
        date: z.coerce.date().max(new Date(), "Date must be in the past"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const [wallet] = await tx
          .select()
          .from(wallets)
          .where(
            and(
              eq(wallets.id, input.walletId),
              eq(wallets.userId, ctx.session.userId),
            ),
          );

        if (!wallet) {
          throw new TRPCError({
            message: `Wallet ${input.walletId} not found`,
            code: "NOT_FOUND",
          });
        }

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
            walletId: input.walletId,
            title: input.title,
            description: input.description,
            value: input.value.toString(),
            source: input.source,
            date: input.date.toISOString().split("T")[0],
          })
          .returning();

        const newWalletBalance = parseFloat(wallet.balance) + input.value;

        await tx
          .update(wallets)
          .set({ balance: newWalletBalance.toString() })
          .where(eq(wallets.id, input.walletId));

        const allocationsAndBucketBalanceUpdates = userBuckets
          .map((bucket) => {
            const bucketAllocationPercentage = parseFloat(bucket.budget) / 100;
            const allocationValue = input.value * bucketAllocationPercentage;
            const newBucketBalance =
              parseFloat(bucket.balance) + allocationValue;

            return [
              tx.insert(earningAllocations).values({
                earningId: earning.id,
                bucketId: bucket.id,
                value: allocationValue.toString(),
                bucketPercentage: bucket.budget,
              }),
              tx
                .update(buckets)
                .set({ balance: newBucketBalance.toString() })
                .where(eq(buckets.id, bucket.id)),
            ];
          })
          .flat();

        await Promise.all(allocationsAndBucketBalanceUpdates);

        return earning;
      });
    }),
});
