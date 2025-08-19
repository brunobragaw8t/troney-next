import { db } from "@/db";
import { wallets } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { eq } from "drizzle-orm";

export const walletsRouter = createTRPCRouter({
  getWallets: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, ctx.session.userId));
  }),
});
