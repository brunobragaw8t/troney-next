import { db } from "@/db";
import { movements, wallets } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";

export const movementsRouter = createTRPCRouter({
  getMovements: protectedProcedure.query(async ({ ctx }) => {
    const sourceWallet = alias(wallets, "sourceWallet");
    const targetWallet = alias(wallets, "targetWallet");

    return await db
      .select({
        id: movements.id,
        userId: movements.userId,
        walletIdSource: movements.walletIdSource,
        sourceWalletName: sourceWallet.name,
        walletIdTarget: movements.walletIdTarget,
        targetWalletName: targetWallet.name,
        value: movements.value,
        date: movements.date,
        createdAt: movements.createdAt,
        updatedAt: movements.updatedAt,
      })
      .from(movements)
      .leftJoin(sourceWallet, eq(movements.walletIdSource, sourceWallet.id))
      .leftJoin(targetWallet, eq(movements.walletIdTarget, targetWallet.id))
      .where(eq(movements.userId, ctx.session.userId))
      .orderBy(desc(movements.date));
  }),

  getMovement: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const [movement] = await db
        .select()
        .from(movements)
        .where(
          and(
            eq(movements.id, input),
            eq(movements.userId, ctx.session.userId),
          ),
        );

      if (!movement) {
        throw new TRPCError({
          message: `Movement ${input} not found`,
          code: "NOT_FOUND",
        });
      }

      return movement;
    }),

  createMovement: protectedProcedure
    .input(
      z.object({
        walletIdSource: z.string().uuid("Please select the source wallet"),
        walletIdTarget: z.string().uuid("Please select the target wallet"),
        value: z
          .number()
          .min(0.01, "Value must be greater than 0")
          .max(999999.99, "Value must be less than 1,000,000"),
        date: z.coerce.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.walletIdSource === input.walletIdTarget) {
        throw new TRPCError({
          message: "Source and target wallets must be different",
          code: "BAD_REQUEST",
        });
      }

      return await db.transaction(async (tx) => {
        const [sourceWallet] = await tx
          .select()
          .from(wallets)
          .where(
            and(
              eq(wallets.id, input.walletIdSource),
              eq(wallets.userId, ctx.session.userId),
            ),
          );

        if (!sourceWallet) {
          throw new TRPCError({
            message: `Source wallet ${input.walletIdSource} not found`,
            code: "NOT_FOUND",
          });
        }

        const [targetWallet] = await tx
          .select()
          .from(wallets)
          .where(
            and(
              eq(wallets.id, input.walletIdTarget),
              eq(wallets.userId, ctx.session.userId),
            ),
          );

        if (!targetWallet) {
          throw new TRPCError({
            message: `Target wallet ${input.walletIdTarget} not found`,
            code: "NOT_FOUND",
          });
        }

        const [movement] = await tx
          .insert(movements)
          .values({
            userId: ctx.session.userId,
            walletIdSource: input.walletIdSource,
            walletIdTarget: input.walletIdTarget,
            value: input.value.toString(),
            date: input.date.toISOString().split("T")[0],
          })
          .returning();

        const newSourceBalance = parseFloat(sourceWallet.balance) - input.value;

        await tx
          .update(wallets)
          .set({ balance: newSourceBalance.toString() })
          .where(eq(wallets.id, input.walletIdSource));

        const newTargetBalance = parseFloat(targetWallet.balance) + input.value;

        await tx
          .update(wallets)
          .set({ balance: newTargetBalance.toString() })
          .where(eq(wallets.id, input.walletIdTarget));

        return movement;
      });
    }),

  updateMovement: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        walletIdSource: z.string().uuid("Please select the source wallet"),
        walletIdTarget: z.string().uuid("Please select the target wallet"),
        value: z
          .number()
          .min(0.01, "Value must be greater than 0")
          .max(999999.99, "Value must be less than 1,000,000"),
        date: z.coerce.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.walletIdSource === input.walletIdTarget) {
        throw new TRPCError({
          message: "Source and target wallets must be different",
          code: "BAD_REQUEST",
        });
      }

      return await db.transaction(async (tx) => {
        const [existingMovement] = await tx
          .select()
          .from(movements)
          .where(
            and(
              eq(movements.id, input.id),
              eq(movements.userId, ctx.session.userId),
            ),
          );

        if (!existingMovement) {
          throw new TRPCError({
            message: `Movement ${input.id} not found`,
            code: "NOT_FOUND",
          });
        }

        const [sourceWallet] = await tx
          .select()
          .from(wallets)
          .where(
            and(
              eq(wallets.id, input.walletIdSource),
              eq(wallets.userId, ctx.session.userId),
            ),
          );

        if (!sourceWallet) {
          throw new TRPCError({
            message: `Source wallet ${input.walletIdSource} not found`,
            code: "NOT_FOUND",
          });
        }

        const [targetWallet] = await tx
          .select()
          .from(wallets)
          .where(
            and(
              eq(wallets.id, input.walletIdTarget),
              eq(wallets.userId, ctx.session.userId),
            ),
          );

        if (!targetWallet) {
          throw new TRPCError({
            message: `Target wallet ${input.walletIdTarget} not found`,
            code: "NOT_FOUND",
          });
        }

        const oldValue = parseFloat(existingMovement.value);
        const newValue = input.value;

        // Reverse old movement

        if (existingMovement.walletIdSource) {
          const [oldSourceWallet] = await tx
            .select()
            .from(wallets)
            .where(eq(wallets.id, existingMovement.walletIdSource));

          if (oldSourceWallet) {
            const updatedOldSourceBalance =
              parseFloat(oldSourceWallet.balance) + oldValue;
            await tx
              .update(wallets)
              .set({ balance: updatedOldSourceBalance.toString() })
              .where(eq(wallets.id, existingMovement.walletIdSource));
          }
        }

        if (existingMovement.walletIdTarget) {
          const [oldTargetWallet] = await tx
            .select()
            .from(wallets)
            .where(eq(wallets.id, existingMovement.walletIdTarget));

          if (oldTargetWallet) {
            const updatedOldTargetBalance =
              parseFloat(oldTargetWallet.balance) - oldValue;
            await tx
              .update(wallets)
              .set({ balance: updatedOldTargetBalance.toString() })
              .where(eq(wallets.id, existingMovement.walletIdTarget));
          }
        }

        // Apply new movement

        const newSourceBalance = parseFloat(sourceWallet.balance) - newValue;
        await tx
          .update(wallets)
          .set({ balance: newSourceBalance.toString() })
          .where(eq(wallets.id, input.walletIdSource));

        const newTargetBalance = parseFloat(targetWallet.balance) + newValue;
        await tx
          .update(wallets)
          .set({ balance: newTargetBalance.toString() })
          .where(eq(wallets.id, input.walletIdTarget));

        const [updatedMovement] = await tx
          .update(movements)
          .set({
            walletIdSource: input.walletIdSource,
            walletIdTarget: input.walletIdTarget,
            value: input.value.toString(),
            date: input.date.toISOString().split("T")[0],
            updatedAt: new Date(),
          })
          .where(eq(movements.id, input.id))
          .returning();

        return updatedMovement;
      });
    }),

  deleteMovement: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const [existingMovement] = await tx
          .select()
          .from(movements)
          .where(
            and(
              eq(movements.id, input),
              eq(movements.userId, ctx.session.userId),
            ),
          );

        if (!existingMovement) {
          throw new TRPCError({
            message: `Movement ${input} not found`,
            code: "NOT_FOUND",
          });
        }

        const movementValue = parseFloat(existingMovement.value);

        if (existingMovement.walletIdSource) {
          const [sourceWallet] = await tx
            .select()
            .from(wallets)
            .where(
              and(
                eq(wallets.id, existingMovement.walletIdSource),
                eq(wallets.userId, ctx.session.userId),
              ),
            );

          if (sourceWallet) {
            const updatedSourceBalance =
              parseFloat(sourceWallet.balance) + movementValue;

            await tx
              .update(wallets)
              .set({ balance: updatedSourceBalance.toString() })
              .where(eq(wallets.id, existingMovement.walletIdSource));
          }
        }

        if (existingMovement.walletIdTarget) {
          const [targetWallet] = await tx
            .select()
            .from(wallets)
            .where(
              and(
                eq(wallets.id, existingMovement.walletIdTarget),
                eq(wallets.userId, ctx.session.userId),
              ),
            );

          if (targetWallet) {
            const updatedTargetBalance =
              parseFloat(targetWallet.balance) - movementValue;

            await tx
              .update(wallets)
              .set({ balance: updatedTargetBalance.toString() })
              .where(eq(wallets.id, existingMovement.walletIdTarget));
          }
        }

        const [deletedMovement] = await tx
          .delete(movements)
          .where(
            and(
              eq(movements.id, input),
              eq(movements.userId, ctx.session.userId),
            ),
          )
          .returning();

        return deletedMovement;
      });
    }),
});
