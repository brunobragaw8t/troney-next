import { CategoriesView } from "@/modules/categories/ui/views/categories-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  prefetch(trpc.categories.getCategories.queryOptions());

  return (
    <HydrateClient>
      <CategoriesView />
    </HydrateClient>
  );
}
