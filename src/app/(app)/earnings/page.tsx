import { EarningsView } from "@/modules/earnings/ui/views/earnings-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  prefetch(trpc.earnings.getEarnings.queryOptions());

  return (
    <HydrateClient>
      <EarningsView />
    </HydrateClient>
  );
}
