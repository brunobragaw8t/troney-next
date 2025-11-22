import { EditExpenseView } from "@/modules/expenses/ui/views/edit-expense-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  prefetch(trpc.expenses.getExpense.queryOptions(id));

  return (
    <HydrateClient>
      <EditExpenseView />
    </HydrateClient>
  );
}
