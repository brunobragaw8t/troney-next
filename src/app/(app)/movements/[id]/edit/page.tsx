import { EditMovementView } from "@/modules/movements/ui/views/edit-movement-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default function Page() {
  prefetch(trpc.wallets.getWallets.queryOptions());

  return (
    <HydrateClient>
      <EditMovementView />
    </HydrateClient>
  );
}
