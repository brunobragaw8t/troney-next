import { ExpensesView } from "@/modules/expenses/ui/views/expenses-view";
import { HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <ExpensesView />
    </HydrateClient>
  );
}
