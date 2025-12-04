import { MovementsView } from "@/modules/movements/ui/views/movements-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  prefetch(trpc.movements.getMovements.queryOptions());

  return (
    <HydrateClient>
      <MovementsView />
    </HydrateClient>
  );
}
