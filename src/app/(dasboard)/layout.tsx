"use client";

import { Logo } from "@/components/brand/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  TrendingUp,
  ArrowLeftRight,
  Wallet,
  Folder,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      icon: BarChart3,
      label: "Dashboard",
      keymap: "d",
    },
    {
      href: "/earnings",
      icon: TrendingUp,
      label: "Earnings",
      keymap: "r",
    },
    {
      href: "/expenses",
      icon: CreditCard,
      label: "Expenses",
      keymap: "x",
    },
    {
      href: "/movements",
      icon: ArrowLeftRight,
      label: "Movements",
      keymap: "m",
    },
    {
      href: "/wallets",
      icon: Wallet,
      label: "Wallets",
      keymap: "w",
    },
    {
      href: "/categories",
      icon: Folder,
      label: "Categories",
      keymap: "c",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col gap-5 border-r border-secondary-3 bg-secondary-2 p-6">
        <Logo />

        <nav>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-secondary-4 hover:text-primary-1 ${
                    pathname.startsWith(item.href)
                      ? "bg-primary-2 bg-opacity-10 !text-primary-1"
                      : ""
                  }`}
                >
                  <item.icon size={20} />

                  <span>{item.label}</span>

                  <span className="ml-auto min-w-5 rounded bg-secondary-3 px-1.5 py-0.5 text-center text-xs text-secondary-4 group-hover:text-primary-1">
                    {item.keymap}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="p-6">{children}</main>
    </div>
  );
}
