"use client";

import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner/spinner";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ArrowLeft } from "lucide-react";
import { Suspense, useMemo } from "react";
import { EditBucketForm } from "../sections/edit-bucket-form";
import { useRouter } from "next/navigation";

export function EditBucketView() {
  const router = useRouter();

  useKeyboardShortcuts({
    shortcuts: useMemo(
      () => [
        {
          key: "Escape",
          action: () => {
            router.replace("/buckets");
          },
        },
      ],
      [router],
    ),
  });

  function handleGoBack() {
    router.replace("/buckets");
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

        <h1 className="text-3xl font-bold text-white">Edit bucket</h1>
      </div>

      <p className="mb-8 text-secondary-4">Update your bucket details</p>

      <Suspense fallback={<Spinner message="Loading bucket details" />}>
        <EditBucketForm />
      </Suspense>
    </>
  );
}
