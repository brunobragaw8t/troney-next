"use client";

import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner/spinner";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ArrowLeft } from "lucide-react";
import { Suspense, useMemo } from "react";
import { EditMovementForm } from "../sections/edit-movement-form";
import { useRouter } from "next/navigation";

export function EditMovementView() {
  const router = useRouter();

  useKeyboardShortcuts({
    shortcuts: useMemo(
      () => [
        {
          key: "Escape",
          action: () => {
            router.replace("/movements");
          },
        },
      ],
      [router],
    ),
  });

  function handleGoBack() {
    router.replace("/movements");
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

        <h1 className="text-3xl font-bold text-white">Edit movement</h1>
      </div>

      <p className="mb-8 text-secondary-4">Update your movement details</p>

      <Suspense fallback={<Spinner message="Loading movement details" />}>
        <EditMovementForm />
      </Suspense>
    </>
  );
}
