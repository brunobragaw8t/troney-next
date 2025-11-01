"use client";

import { Button } from "@/components/ui/button/button";
import { Keymap } from "@/components/ui/keymap/keymap";
import { Spinner } from "@/components/ui/spinner/spinner";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import { EarningsTable } from "../sections/earnings-table";

export function EarningsView() {
  const router = useRouter();

  useKeyboardShortcuts({
    shortcuts: useMemo(
      () => [
        {
          key: "n",
          action: () => {
            router.replace("/earnings/create");
          },
        },
      ],
      [router],
    ),
  });

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Earnings</h1>
      <p className="mb-8 text-secondary-4">Manage your income</p>

      <div className="mb-4 flex justify-end">
        <Button
          type="link"
          href="/earnings/create"
          label="Add earning"
          icon={PlusCircle}
          iconPosition="left"
          tooltip={<Keymap text="n" />}
        />
      </div>

      <Suspense fallback={<Spinner message="Loading your earnings" />}>
        <EarningsTable />
      </Suspense>
    </div>
  );
}
