import { EditEarningView } from "@/modules/earnings/ui/views/edit-earning-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  prefetch(trpc.earnings.getEarning.queryOptions(id));

  return (
    <HydrateClient>
      <EditEarningView />
    </HydrateClient>
  );
}
