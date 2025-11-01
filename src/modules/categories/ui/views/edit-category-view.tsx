"use client";

import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner/spinner";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ArrowLeft } from "lucide-react";
import { Suspense, useEffect, useMemo } from "react";
import { EditCategoryForm } from "../sections/edit-category-form";
import { useRouter } from "next/navigation";

export function EditCategoryView() {
  const router = useRouter();

  useKeyboardShortcuts({
    shortcuts: useMemo(
      () => [
        {
          key: "Escape",
          action: () => {
            router.replace("/categories");
          },
        },
      ],
      [router],
    ),
  });

  function handleGoBack() {
    router.replace("/categories");
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

        <h1 className="text-3xl font-bold text-white">Edit category</h1>
      </div>

      <p className="mb-8 text-secondary-4">Update your category details</p>

      <Suspense fallback={<Spinner message="Loading category details" />}>
        <EditCategoryForm />
      </Suspense>
    </>
  );
}
