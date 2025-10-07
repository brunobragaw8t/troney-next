import { BucketsView } from "@/modules/buckets/ui/views/buckets-view";
import { HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <BucketsView />
    </HydrateClient>
  );
}
