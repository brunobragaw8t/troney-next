"use client";

import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner/spinner";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ArrowLeft } from "lucide-react";
import { Suspense, useMemo } from "react";
import { EditEarningForm } from "../sections/edit-earning-form";
import { useRouter } from "next/navigation";

export function EditEarningView() {
  const router = useRouter();

  useKeyboardShortcuts({
    shortcuts: useMemo(
      () => [
        {
          key: "Escape",
          action: () => {
            router.replace("/earnings");
          },
        },
      ],
      [router],
    ),
  });

  function handleGoBack() {
    router.replace("/earnings");
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

        <h1 className="text-3xl font-bold text-white">Edit earning</h1>
      </div>

      <p className="mb-8 text-secondary-4">Update your earning details</p>

      <Suspense fallback={<Spinner message="Loading earning details" />}>
        <EditEarningForm />
      </Suspense>
    </>
  );
}
