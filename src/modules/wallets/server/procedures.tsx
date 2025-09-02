import { db } from "@/db";
import { wallets } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const walletsRouter = createTRPCRouter({
  getWallets: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, ctx.session.userId));
  }),

  getWallet: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const [wallet] = await db
        .select()
        .from(wallets)
        .where(
          and(eq(wallets.id, input), eq(wallets.userId, ctx.session.userId)),
        );

      if (!wallet) {
        throw new TRPCError({
          message: `Wallet ${input} not found`,
          code: "NOT_FOUND",
        });
      }

      return wallet;
    }),

  createWallet: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Name is required")
          .max(255, "Name must be 255 characters or less")
          .trim(),
        balance: z.number().min(0, "Balance must be 0 or greater").default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [wallet] = await db
        .insert(wallets)
        .values({
          userId: ctx.session.userId,
          name: input.name,
          balance: input.balance.toString(),
        })
        .returning();

      return wallet;
    }),

  updateWallet: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z
          .string()
          .min(1, "Name is required")
          .max(255, "Name must be 255 characters or less")
          .trim(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [wallet] = await db
        .update(wallets)
        .set({
          name: input.name,
        })
        .where(
          and(eq(wallets.id, input.id), eq(wallets.userId, ctx.session.userId)),
        )
        .returning();

      if (!wallet) {
        throw new TRPCError({
          message: `Wallet ${input.id} not found`,
          code: "NOT_FOUND",
        });
      }

      return wallet;
    }),
});
