import { BucketsView } from "@/modules/buckets/ui/views/buckets-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  prefetch(trpc.buckets.getBuckets.queryOptions());

  return (
    <HydrateClient>
      <BucketsView />
    </HydrateClient>
  );
}
