import { db } from "@/db";
import { categories } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, sql } from "drizzle-orm";
import z from "zod";

export const categoriesRouter = createTRPCRouter({
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, ctx.session.userId))
      .orderBy(asc(sql`LOWER(${categories.name})`));
  }),

  getCategory: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const [category] = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.id, input),
            eq(categories.userId, ctx.session.userId),
          ),
        );

      if (!category) {
        throw new TRPCError({
          message: `Category ${input} not found`,
          code: "NOT_FOUND",
        });
      }

      return category;
    }),

  createCategory: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Name is required")
          .max(255, "Name must be 255 characters or less")
          .trim(),
        color: z
          .string()
          .regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color")
          .default("#3b82f6"),
        icon: z
          .string()
          .max(255, "Icon must be 255 characters or less")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [category] = await db
        .insert(categories)
        .values({
          userId: ctx.session.userId,
          name: input.name,
          color: input.color,
          icon: input.icon || null,
        })
        .returning();

      return category;
    }),

  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z
          .string()
          .min(1, "Name is required")
          .max(255, "Name must be 255 characters or less")
          .trim(),
        color: z
          .string()
          .regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color"),
        icon: z
          .string()
          .max(255, "Icon must be 255 characters or less")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [category] = await db
        .update(categories)
        .set({
          name: input.name,
          color: input.color,
          icon: input.icon || null,
        })
        .where(
          and(
            eq(categories.id, input.id),
            eq(categories.userId, ctx.session.userId),
          ),
        )
        .returning();

      if (!category) {
        throw new TRPCError({
          message: `Category ${input.id} not found`,
          code: "NOT_FOUND",
        });
      }

      return category;
    }),

  deleteCategory: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const [category] = await db
        .delete(categories)
        .where(
          and(
            eq(categories.id, input),
            eq(categories.userId, ctx.session.userId),
          ),
        )
        .returning();

      if (!category) {
        throw new TRPCError({
          message: `Category ${input} not found`,
          code: "NOT_FOUND",
        });
      }

      return category;
    }),
});
