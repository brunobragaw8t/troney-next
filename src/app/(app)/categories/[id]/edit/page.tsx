import { EditCategoryView } from "@/modules/categories/ui/views/edit-category-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  prefetch(trpc.categories.getCategory.queryOptions(id));

  return (
    <HydrateClient>
      <EditCategoryView />
    </HydrateClient>
  );
}
