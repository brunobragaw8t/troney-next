import { db } from "@/db";
import { wallets } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { eq } from "drizzle-orm";
import z from "zod";

export const walletsRouter = createTRPCRouter({
  getWallets: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, ctx.session.userId));
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
});
