import { CreateMovementView } from "@/modules/movements/ui/views/create-movement-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default function Page() {
  prefetch(trpc.wallets.getWallets.queryOptions());

  return (
    <HydrateClient>
      <CreateMovementView />
    </HydrateClient>
  );
}
