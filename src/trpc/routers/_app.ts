import { createTRPCRouter } from "../init";
import { authRouter } from "@/modules/auth/server/procedures";
import { usersRouter } from "@/modules/users/server/procedures";
import { walletsRouter } from "@/modules/wallets/server/procedures";
import { categoriesRouter } from "@/modules/categories/server/procedures";
import { bucketsRouter } from "@/modules/buckets/server/procedures";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  wallets: walletsRouter,
  buckets: bucketsRouter,
  categories: categoriesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
