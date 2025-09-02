"use client";

import { Alert, AlertProps } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Euro, Wallet } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export function EditWalletForm() {
  const params = useParams();
  const router = useRouter();
  const walletId = params.id as string;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: wallet } = useSuspenseQuery(
    trpc.wallets.getWallet.queryOptions(walletId),
  );

  const [name, setName] = useState(wallet.name);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  const [balance] = useState(wallet.balance.toString());

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<AlertProps>({
    type: "success",
    message: "",
  });

  const updateWalletMutation = useMutation(
    trpc.wallets.updateWallet.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.wallets.getWallet.queryOptions(walletId),
        );

        setAlert({
          type: "success",
          message: "Wallet updated successfully!",
        });

        setTimeout(() => {
          router.replace("/wallets");
        }, 1500);
      },
      onError: (error) => {
        setAlert({
          type: "error",
          message: error.data?.zodError
            ? "There are errors that need your attention."
            : error.message,
        });

        setLoading(false);
      },
    }),
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);

    setAlert({
      type: "success",
      message: "",
    });

    updateWalletMutation.mutate({
      id: walletId,
      name: name.trim(),
    });
  }

  function handleGoBack() {
    router.replace("/wallets");
  }

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          icon={Wallet}
          type="text"
          name="name"
          value={name}
          onChange={handleNameChange}
          placeholder="Main account, Cash..."
          autoFocus={true}
          error={updateWalletMutation.error?.data?.zodError?.fieldErrors?.name}
        />

        <Input
          label="Balance"
          icon={Euro}
          type="text"
          name="balance"
          value={balance}
          disabled={true}
        />

        {alert.message && <Alert type={alert.type} message={alert.message} />}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            label="Cancel"
            variant="outline"
            onClick={handleGoBack}
          />

          <Button loading={loading} type="submit" label="Update wallet" />
        </div>
      </form>
    </div>
  );
}
