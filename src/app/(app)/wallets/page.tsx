import { WalletsView } from "@/modules/wallets/ui/views/wallets-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  prefetch(trpc.wallets.getWallets.queryOptions());

  return (
    <HydrateClient>
      <WalletsView />
    </HydrateClient>
  );
}
