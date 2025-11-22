"use client";

import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner/spinner";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ArrowLeft } from "lucide-react";
import { Suspense, useMemo } from "react";
import { EditExpenseForm } from "../sections/edit-expense-form";
import { useRouter } from "next/navigation";

export function EditExpenseView() {
  const router = useRouter();

  useKeyboardShortcuts({
    shortcuts: useMemo(
      () => [
        {
          key: "Escape",
          action: () => {
            router.replace("/expenses");
          },
        },
      ],
      [router],
    ),
  });

  function handleGoBack() {
    router.replace("/expenses");
  }

  return (
    <>
      <div className="mb-2 flex items-center gap-3">
        <Button
          type="button"
          icon={ArrowLeft}
          iconPosition="left"
          variant="outline"
          size="sm"
          onClick={handleGoBack}
        />

        <h1 className="text-3xl font-bold text-white">Edit expense</h1>
      </div>

      <p className="mb-8 text-secondary-4">
        Track your expenses and categorize
      </p>

      <Suspense fallback={<Spinner message="Loading expense details" />}>
        <EditExpenseForm />
      </Suspense>
    </>
  );
}
