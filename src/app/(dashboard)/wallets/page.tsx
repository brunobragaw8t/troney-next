import { WalletsView } from "@/modules/wallets/ui/views/wallets-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function WalletsPage() {
  prefetch(trpc.wallets.getWallets.queryOptions());

  return (
    <HydrateClient>
      <WalletsView />
    </HydrateClient>
  );
}
