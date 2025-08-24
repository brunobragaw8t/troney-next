import { MovementsView } from "@/modules/movements/ui/views/movements-view";
import { HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <MovementsView />
    </HydrateClient>
  );
}
