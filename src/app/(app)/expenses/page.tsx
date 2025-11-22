import { ExpensesView } from "@/modules/expenses/ui/views/expenses-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  prefetch(trpc.expenses.getExpenses.queryOptions());

  return (
    <HydrateClient>
      <ExpensesView />
    </HydrateClient>
  );
}
