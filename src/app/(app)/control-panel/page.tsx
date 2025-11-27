import { ControlPanelView } from "@/modules/control-panel/ui/views/control-panel-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  prefetch(trpc.wallets.getWallets.queryOptions());

  return (
    <HydrateClient>
      <ControlPanelView />
    </HydrateClient>
  );
}
