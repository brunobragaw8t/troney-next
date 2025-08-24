"use client";

import Link from "next/link";
import {
  BarChart3,
  CreditCard,
  TrendingUp,
  ArrowLeftRight,
  Wallet,
  Folder,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Keymap } from "@/components/ui/keymap/keymap";
import { useCallback, useEffect } from "react";

export function AppMenu() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/control-panel",
      icon: BarChart3,
      label: "Control panel",
      keymap: "p",
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

  const router = useRouter();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const activeElement = document.activeElement;

    const fieldIsFocused =
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement instanceof HTMLSelectElement;

    if (fieldIsFocused) return;

    if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
      return;
    }

    const item = navItems.find((item) => item.keymap === event.key);

    if (item) {
      router.replace(item.href);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
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

              <Keymap
                text={item.keymap}
                className="group-hover:text-primary-1"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
