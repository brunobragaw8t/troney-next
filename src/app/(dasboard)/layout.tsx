import { Logo } from "@/components/brand/logo";
import { LayoutMenu } from "./layout-menu";
import { LayoutUser } from "./layout-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col gap-5 border-r border-secondary-3 bg-secondary-2 p-6">
        <Logo />
        <LayoutMenu />
        <LayoutUser />
      </aside>

      <main className="p-6">{children}</main>
    </div>
  );
}
