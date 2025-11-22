import { CreateExpenseView } from "@/modules/expenses/ui/views/create-expense-view";
import { HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <CreateExpenseView />
    </HydrateClient>
  );
}
