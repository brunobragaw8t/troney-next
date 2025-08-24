import { ControlPanelView } from "@/modules/control-panel/ui/views/control-panel-view";
import { HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <ControlPanelView />
    </HydrateClient>
  );
}
