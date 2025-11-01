"use client";

import { Alert, AlertProps } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Euro, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function CreateWalletView() {
  const router = useRouter();

  useKeyboardShortcuts({
    shortcuts: useMemo(
      () => [
        {
          key: "Escape",
          action: () => {
            router.replace("/wallets");
          },
        },
      ],
      [router],
    ),
  });

  const [name, setName] = useState("");

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  const [balance, setBalance] = useState("");

  function handleBalanceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setBalance(value);
    }
  }

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<AlertProps>({
    type: "success",
    message: "",
  });

  const trpc = useTRPC();

  const createWalletMutation = useMutation(
    trpc.wallets.createWallet.mutationOptions({
      onSuccess: () => {
        setAlert({
          type: "success",
          message: "Wallet created successfully!",
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

    createWalletMutation.mutate({
      name: name.trim(),
      balance: parseFloat(balance) || 0,
    });
  }

  function handleGoBack() {
    router.replace("/wallets");
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

        <h1 className="text-3xl font-bold text-white">Create wallet</h1>
      </div>

      <p className="mb-8 text-secondary-4">
        Add a new wallet to store your money
      </p>

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
            error={
              createWalletMutation.error?.data?.zodError?.fieldErrors?.name
            }
          />

          <Input
            label="Initial balance"
            icon={Euro}
            type="text"
            name="balance"
            value={balance}
            onChange={handleBalanceChange}
            placeholder="0.00"
            error={
              createWalletMutation.error?.data?.zodError?.fieldErrors?.balance
            }
          />

          {alert.message && <Alert type={alert.type} message={alert.message} />}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              label="Cancel"
              variant="outline"
              onClick={handleGoBack}
            />

            <Button loading={loading} type="submit" label="Create wallet" />
          </div>
        </form>
      </div>
    </div>
  );
}
