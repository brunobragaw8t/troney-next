import { EditWalletView } from "@/modules/wallets/ui/views/edit-wallet-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  prefetch(trpc.wallets.getWallet.queryOptions(id));

  return (
    <HydrateClient>
      <EditWalletView />
    </HydrateClient>
  );
}
