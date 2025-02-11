import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { activationTokens, users } from "~/server/db/schema";

export const activationTokensRouter = createTRPCRouter({
  getItem: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const selectActivationTokensResult = await ctx.db
        .select()
        .from(activationTokens)
        .where(sql`value=${input}`)
        .leftJoin(users, eq(users.id, activationTokens.userId));

      const activationToken = selectActivationTokensResult[0];

      if (!activationToken || !activationToken.users) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Activation token not found.",
        });
      }

      const [updateUserResult] = await ctx.db
        .update(users)
        .set({ activatedAt: sql`NOW()` })
        .where(sql`id=${activationToken.users.id}`);

      if (updateUserResult.affectedRows === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not activate user",
        });
      }

      await ctx.db
        .delete(activationTokens)
        .where(sql`id=${activationToken.activation_tokens.id}`);
    }),
});
