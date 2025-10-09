import { EditBucketView } from "@/modules/buckets/ui/views/edit-bucket-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  prefetch(trpc.buckets.getBucket.queryOptions(id));

  return (
    <HydrateClient>
      <EditBucketView />
    </HydrateClient>
  );
}
