"use client";

import { Suspense, useMemo } from "react";
import { BucketsTable } from "../sections/buckets-table";
import { Spinner } from "@/components/ui/spinner/spinner";
import { Button } from "@/components/ui/button/button";
import { PlusCircle } from "lucide-react";
import { Keymap } from "@/components/ui/keymap/keymap";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useRouter } from "next/navigation";
// import { ErrorBoundary } from "react-error-boundary";

export function BucketsView() {
  const router = useRouter();

  useKeyboardShortcuts({
    shortcuts: useMemo(
      () => [
        {
          key: "n",
          action: () => {
            router.replace("/buckets/create");
          },
        },
      ],
      [router],
    ),
  });

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Buckets</h1>
      <p className="mb-8 text-secondary-4">Manage your budgets and savings</p>

      <div className="mb-4 flex justify-end">
        <Button
          type="link"
          href="/buckets/create"
          label="Add bucket"
          icon={PlusCircle}
          iconPosition="left"
          tooltip={<Keymap text="n" />}
        />
      </div>

      {/*<ErrorBoundary fallback={<div>Something went wrong</div>}>*/}
      <Suspense fallback={<Spinner message="Loading your buckets" />}>
        <BucketsTable />
      </Suspense>
      {/*</ErrorBoundary>*/}
    </div>
  );
}
