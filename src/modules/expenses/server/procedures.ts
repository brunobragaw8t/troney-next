import { db } from "@/db";
import { buckets, categories, expenses, wallets } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { desc, eq } from "drizzle-orm";

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
      .orderBy(desc(expenses.date));
  }),
});
