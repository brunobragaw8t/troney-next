"use client";

import { Button } from "@/components/ui/button/button";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { CreateMovementForm } from "../sections/create-movement-form";

export function CreateMovementView() {
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
    <div>
      <div className="mb-2 flex items-center gap-3">
        <Button
          type="button"
          icon={ArrowLeft}
          iconPosition="left"
          variant="outline"
          size="sm"
          onClick={handleGoBack}
        />

        <h1 className="text-3xl font-bold text-white">Create movement</h1>
      </div>

      <p className="mb-8 text-secondary-4">
        Move currency from one wallet to another
      </p>

      <CreateMovementForm />
    </div>
  );
}
