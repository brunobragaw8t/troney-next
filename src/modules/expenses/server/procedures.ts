import { db } from "@/db";
import { buckets, categories, expenses, wallets } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

export const expensesRouter = createTRPCRouter({
  getExpenses: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select({
        id: expenses.id,
        userId: expenses.userId,
        walletId: expenses.walletId,
        walletName: wallets.name,
        bucketId: expenses.bucketId,
        bucketName: buckets.name,
        categoryId: expenses.categoryId,
        categoryName: categories.name,
        title: expenses.title,
        description: expenses.description,
        value: expenses.value,
        source: expenses.source,
        date: expenses.date,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
      })
      .from(expenses)
      .leftJoin(wallets, eq(expenses.walletId, wallets.id))
      .leftJoin(buckets, eq(expenses.bucketId, buckets.id))
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(eq(expenses.userId, ctx.session.userId))
      .orderBy(desc(expenses.date), desc(expenses.createdAt));
  }),

  getExpense: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const [expense] = await db
        .select()
        .from(expenses)
        .where(
          and(eq(expenses.id, input), eq(expenses.userId, ctx.session.userId)),
        );

      if (!expense) {
        throw new TRPCError({
          message: `Expense ${input} not found`,
          code: "NOT_FOUND",
        });
      }

      return expense;
    }),

  createExpense: protectedProcedure
    .input(
      z.object({
        walletId: z
          .string()
          .uuid("Please select from which wallet you paid this expense"),
        bucketId: z
          .string()
          .uuid("Please select from which bucket the expense will be deducted"),
        categoryId: z.string().uuid("Please select a category for the expense"),
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
          .min(-999999.99, "Value must be greater than -1,000,000")
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

        const [bucket] = await tx
          .select()
          .from(buckets)
          .where(
            and(
              eq(buckets.id, input.bucketId),
              eq(buckets.userId, ctx.session.userId),
            ),
          );

        if (!bucket) {
          throw new TRPCError({
            message: `Bucket ${input.bucketId} not found`,
            code: "NOT_FOUND",
          });
        }

        const [category] = await tx
          .select()
          .from(categories)
          .where(
            and(
              eq(categories.id, input.categoryId),
              eq(categories.userId, ctx.session.userId),
            ),
          );

        if (!category) {
          throw new TRPCError({
            message: `Category ${input.categoryId} not found`,
            code: "NOT_FOUND",
          });
        }

        const [expense] = await tx
          .insert(expenses)
          .values({
            userId: ctx.session.userId,
            walletId: input.walletId,
            bucketId: input.bucketId,
            categoryId: input.categoryId,
            title: input.title,
            description: input.description,
            value: input.value.toString(),
            source: input.source,
            date: input.date.toISOString().split("T")[0],
          })
          .returning();

        const newWalletBalance = parseFloat(wallet.balance) - input.value;

        await tx
          .update(wallets)
          .set({ balance: newWalletBalance.toString() })
          .where(eq(wallets.id, input.walletId));

        const newBucketBalance = parseFloat(bucket.balance) - input.value;

        await tx
          .update(buckets)
          .set({ balance: newBucketBalance.toString() })
          .where(eq(buckets.id, input.bucketId));

        return expense;
      });
    }),

  updateExpense: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        walletId: z
          .string()
          .uuid("Please select from which wallet you paid this expense"),
        bucketId: z
          .string()
          .uuid("Please select from which bucket the expense will be deducted"),
        categoryId: z.string().uuid("Please select a category for the expense"),
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
          .min(-999999.99, "Value must be greater than -1,000,000")
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
        const [existingExpense] = await tx
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.id, input.id),
              eq(expenses.userId, ctx.session.userId),
            ),
          );

        if (!existingExpense) {
          throw new TRPCError({
            message: `Expense ${input.id} not found`,
            code: "NOT_FOUND",
          });
        }

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

        const [bucket] = await tx
          .select()
          .from(buckets)
          .where(
            and(
              eq(buckets.id, input.bucketId),
              eq(buckets.userId, ctx.session.userId),
            ),
          );

        if (!bucket) {
          throw new TRPCError({
            message: `Bucket ${input.bucketId} not found`,
            code: "NOT_FOUND",
          });
        }

        const [category] = await tx
          .select()
          .from(categories)
          .where(
            and(
              eq(categories.id, input.categoryId),
              eq(categories.userId, ctx.session.userId),
            ),
          );

        if (!category) {
          throw new TRPCError({
            message: `Category ${input.categoryId} not found`,
            code: "NOT_FOUND",
          });
        }

        const oldValue = parseFloat(existingExpense.value);
        const newValue = input.value;
        const valueDifference = newValue - oldValue;

        // If wallet changed, move funds from old wallet to new wallet
        // Otherwise, just add the expense value to the new wallet
        if (
          existingExpense.walletId &&
          existingExpense.walletId !== input.walletId
        ) {
          const [oldWallet] = await tx
            .select()
            .from(wallets)
            .where(eq(wallets.id, existingExpense.walletId));

          if (oldWallet) {
            const updatedOldWalletBalance =
              parseFloat(oldWallet.balance) + oldValue;
            await tx
              .update(wallets)
              .set({ balance: updatedOldWalletBalance.toString() })
              .where(eq(wallets.id, existingExpense.walletId));
          }

          const updatedNewWalletBalance = parseFloat(wallet.balance) - newValue;
          await tx
            .update(wallets)
            .set({ balance: updatedNewWalletBalance.toString() })
            .where(eq(wallets.id, input.walletId));
        } else {
          const updatedWalletBalance =
            parseFloat(wallet.balance) - valueDifference;

          await tx
            .update(wallets)
            .set({ balance: updatedWalletBalance.toString() })
            .where(eq(wallets.id, input.walletId));
        }

        // If bucket changed, move funds from old bucket to new bucket
        // Otherwise, just add the expense value to the new bucket
        if (
          existingExpense.bucketId &&
          existingExpense.bucketId !== input.bucketId
        ) {
          const [oldBucket] = await tx
            .select()
            .from(buckets)
            .where(eq(buckets.id, existingExpense.bucketId));

          if (oldBucket) {
            const updatedOldBucketBalance =
              parseFloat(oldBucket.balance) + oldValue;
            await tx
              .update(buckets)
              .set({ balance: updatedOldBucketBalance.toString() })
              .where(eq(buckets.id, existingExpense.bucketId));
          }

          const updatedNewBucketBalance = parseFloat(bucket.balance) - newValue;
          await tx
            .update(buckets)
            .set({ balance: updatedNewBucketBalance.toString() })
            .where(eq(buckets.id, input.bucketId));
        } else {
          const updatedBucketBalance =
            parseFloat(bucket.balance) - valueDifference;

          await tx
            .update(buckets)
            .set({ balance: updatedBucketBalance.toString() })
            .where(eq(buckets.id, input.bucketId));
        }

        const [updatedExpense] = await tx
          .update(expenses)
          .set({
            walletId: input.walletId,
            bucketId: input.bucketId,
            categoryId: input.categoryId,
            title: input.title,
            description: input.description,
            value: input.value.toString(),
            source: input.source,
            date: input.date.toISOString().split("T")[0],
            updatedAt: new Date(),
          })
          .where(eq(expenses.id, input.id))
          .returning();

        return updatedExpense;
      });
    }),

  deleteExpense: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const [existingExpense] = await tx
          .select()
          .from(expenses)
          .where(
            and(
              eq(expenses.id, input),
              eq(expenses.userId, ctx.session.userId),
            ),
          );

        if (!existingExpense) {
          throw new TRPCError({
            message: `Expense ${input} not found`,
            code: "NOT_FOUND",
          });
        }

        const expenseValue = parseFloat(existingExpense.value);

        if (existingExpense.walletId) {
          const [wallet] = await tx
            .select()
            .from(wallets)
            .where(
              and(
                eq(wallets.id, existingExpense.walletId),
                eq(wallets.userId, ctx.session.userId),
              ),
            );

          if (wallet) {
            const updatedWalletBalance =
              parseFloat(wallet.balance) + expenseValue;

            await tx
              .update(wallets)
              .set({ balance: updatedWalletBalance.toString() })
              .where(eq(wallets.id, existingExpense.walletId));
          }
        }

        if (existingExpense.bucketId) {
          const [bucket] = await tx
            .select()
            .from(buckets)
            .where(eq(buckets.id, existingExpense.bucketId));

          if (bucket) {
            const updatedBucketBalance =
              parseFloat(bucket.balance) + expenseValue;

            await tx
              .update(buckets)
              .set({ balance: updatedBucketBalance.toString() })
              .where(eq(buckets.id, existingExpense.bucketId));
          }
        }

        const [deletedExpense] = await tx
          .delete(expenses)
          .where(
            and(
              eq(expenses.id, input),
              eq(expenses.userId, ctx.session.userId),
            ),
          )
          .returning();

        return deletedExpense;
      });
    }),
});
