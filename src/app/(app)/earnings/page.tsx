import { EarningsView } from "@/modules/earnings/ui/views/earnings-view";
import { HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <EarningsView />
    </HydrateClient>
  );
}
