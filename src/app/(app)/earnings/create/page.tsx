import { CreateEarningView } from "@/modules/earnings/ui/views/create-earning-view";
import { HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <CreateEarningView />
    </HydrateClient>
  );
}
