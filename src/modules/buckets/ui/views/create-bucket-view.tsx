"use client";

import { Alert, AlertProps } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Select } from "@/components/ui/select/select";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Euro, PackageOpen, Percent } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function CreateBucketView() {
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

  const [name, setName] = useState("");

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  const [budget, setBudget] = useState("");

  function handleBudgetChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setBudget(value);
    }
  }

  const [balance, setBalance] = useState("0");

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

  const createBucketMutation = useMutation(
    trpc.buckets.createBucket.mutationOptions({
      onSuccess: () => {
        setAlert({
          type: "success",
          message: "Bucket created successfully!",
        });

        setTimeout(() => {
          router.replace("/buckets");
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

    createBucketMutation.mutate({
      name: name.trim(),
      budget: parseFloat(budget) || 0,
      balance: parseFloat(balance) || 0,
    });
  }

  function handleGoBack() {
    router.replace("/buckets");
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

        <h1 className="text-3xl font-bold text-white">Create bucket</h1>
      </div>

      <p className="mb-8 text-secondary-4">
        Add a new bucket to manage your budgets
      </p>

      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            icon={PackageOpen}
            type="text"
            name="name"
            value={name}
            onChange={handleNameChange}
            placeholder="Groceries, Entertainment..."
            autoFocus={true}
            error={
              createBucketMutation.error?.data?.zodError?.fieldErrors?.name
            }
          />

          <Input
            label="Budget"
            icon={Percent}
            type="text"
            name="budget"
            value={budget}
            onChange={handleBudgetChange}
            placeholder="10"
            error={
              createBucketMutation.error?.data?.zodError?.fieldErrors?.budget
            }
          />

          <Input
            label="Initial balance"
            icon={Euro}
            type="text"
            name="balance"
            value={balance}
            onChange={handleBalanceChange}
            placeholder="0"
            error={
              createBucketMutation.error?.data?.zodError?.fieldErrors?.balance
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

            <Button loading={loading} type="submit" label="Create bucket" />
          </div>
        </form>
      </div>
    </div>
  );
}
