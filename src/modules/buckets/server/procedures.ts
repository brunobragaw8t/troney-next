import { db } from "@/db";
import { buckets } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, sql } from "drizzle-orm";
import z from "zod";

export const bucketsRouter = createTRPCRouter({
  getBuckets: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(buckets)
      .where(eq(buckets.userId, ctx.session.userId))
      .orderBy(asc(sql`LOWER(${buckets.name})`));
  }),

  getBucket: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const [bucket] = await db
        .select()
        .from(buckets)
        .where(
          and(eq(buckets.id, input), eq(buckets.userId, ctx.session.userId)),
        );

      if (!bucket) {
        throw new TRPCError({
          message: `Bucket ${input} not found`,
          code: "NOT_FOUND",
        });
      }

      return bucket;
    }),

  createBucket: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Name is required")
          .max(255, "Name must be 255 characters or less")
          .trim(),
        budget: z
          .number()
          .min(0, "Budget must be 0 or greater")
          .max(100, "Budget must be 100 or less")
          .default(0),
        initialBalance: z
          .number()
          .min(0, "Initial balance must be 0 or greater")
          .default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [bucket] = await db
        .insert(buckets)
        .values({
          userId: ctx.session.userId,
          name: input.name,
          budget: input.budget.toString(),
          initialBalance: input.initialBalance.toString(),
        })
        .returning();

      return bucket;
    }),

  updateBucket: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z
          .string()
          .min(1, "Name is required")
          .max(255, "Name must be 255 characters or less")
          .trim(),
        budget: z
          .number()
          .min(0, "Budget must be 0 or greater")
          .max(100, "Budget must be 100 or less"),
        initialBalance: z
          .number()
          .min(0, "Initial balance must be 0 or greater")
          .default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [bucket] = await db
        .update(buckets)
        .set({
          name: input.name,
          budget: input.budget.toString(),
          initialBalance: input.initialBalance.toString(),
        })
        .where(
          and(eq(buckets.id, input.id), eq(buckets.userId, ctx.session.userId)),
        )
        .returning();

      if (!bucket) {
        throw new TRPCError({
          message: `Bucket ${input.id} not found`,
          code: "NOT_FOUND",
        });
      }

      return bucket;
    }),

  deleteBucket: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [bucket] = await db
        .delete(buckets)
        .where(
          and(eq(buckets.id, input), eq(buckets.userId, ctx.session.userId)),
        )
        .returning();

      if (!bucket) {
        throw new TRPCError({
          message: `Bucket ${input} not found`,
          code: "NOT_FOUND",
        });
      }

      return bucket;
    }),
});
