"use client";

import { Button } from "@/components/ui/button/button";
import { Spinner } from "@/components/ui/spinner/spinner";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { EditWalletForm } from "../sections/edit-wallet-form";
import { useRouter } from "next/navigation";

export function EditWalletView() {
  const router = useRouter();

  function handleGoBack() {
    router.replace("/wallets");
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

        <h1 className="text-3xl font-bold text-white">Edit wallet</h1>
      </div>

      <p className="mb-8 text-secondary-4">Update your wallet details</p>

      <Suspense fallback={<Spinner message="Loading wallet details" />}>
        <EditWalletForm />
      </Suspense>
    </>
  );
}
