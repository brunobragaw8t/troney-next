import { CategoriesView } from "@/modules/categories/ui/views/categories-view";
import { HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <CategoriesView />
    </HydrateClient>
  );
}
