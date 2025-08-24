import { Logo } from "@/components/brand/logo";
import { AppMenu } from "@/modules/app/ui/app-menu";
import { AppUser } from "@/modules/app/ui/app-user";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col gap-5 border-r border-secondary-3 bg-secondary-2 p-6">
        <Logo />
        <AppMenu />
        <AppUser />
      </aside>

      <main className="grow p-8">{children}</main>
    </div>
  );
}
