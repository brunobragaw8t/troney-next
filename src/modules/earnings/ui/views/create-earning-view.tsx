"use client";

import { Alert, AlertProps } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Select } from "@/components/ui/select/select";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { isValidFloat } from "@/lib/validation";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Euro,
  Wallet,
  FileText,
  TrendingUp,
  Calendar,
  Captions,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function CreateEarningView() {
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

  const trpc = useTRPC();

  const { data: wallets = [] } = useQuery(
    trpc.wallets.getWallets.queryOptions(),
  );

  const walletOptions = wallets.map((wallet) => ({
    value: wallet.id,
    label: wallet.name,
  }));

  const [walletId, setWalletId] = useState("");

  function handleWalletIdChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setWalletId(event.target.value);
  }

  const [title, setTitle] = useState("");

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  const [description, setDescription] = useState("");

  function handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
  }

  const [value, setValue] = useState("");

  function handleValueChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (value === "" || isValidFloat(value)) {
      setValue(value);
    }
  }

  const [source, setSource] = useState("");

  function handleSourceChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSource(event.target.value);
  }

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDate(event.target.value);
  }

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<AlertProps>({
    type: "success",
    message: "",
  });

  const createEarningMutation = useMutation(
    trpc.earnings.createEarning.mutationOptions({
      onSuccess: () => {
        setAlert({
          type: "success",
          message: "Earning created successfully!",
        });

        setTimeout(() => {
          router.replace("/earnings");
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

    createEarningMutation.mutate({
      walletId: walletId,
      title: title.trim(),
      description: description.trim(),
      value: parseFloat(value) || 0,
      source: source,
      date: new Date(date),
    });
  }

  function handleGoBack() {
    router.replace("/earnings");
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

        <h1 className="text-3xl font-bold text-white">Create earning</h1>
      </div>

      <p className="mb-8 text-secondary-4">
        Add money to your wallet and buckets
      </p>

      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label="Wallet"
            icon={Wallet}
            name="walletId"
            value={walletId}
            onChange={handleWalletIdChange}
            placeholder="Select a wallet"
            options={walletOptions}
            autoFocus={true}
            error={
              createEarningMutation.error?.data?.zodError?.fieldErrors?.walletId
            }
          />

          <Input
            label="Title"
            icon={Captions}
            type="text"
            name="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Salary, Freelance work..."
            error={
              createEarningMutation.error?.data?.zodError?.fieldErrors?.title
            }
          />

          <Input
            label="Description"
            icon={FileText}
            type="text"
            name="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Monthly salary, Project payment..."
            error={
              createEarningMutation.error?.data?.zodError?.fieldErrors
                ?.description
            }
          />

          <Input
            label="Value"
            icon={Euro}
            type="text"
            name="value"
            value={value}
            onChange={handleValueChange}
            placeholder="0.00"
            error={
              createEarningMutation.error?.data?.zodError?.fieldErrors?.value
            }
          />

          <Input
            label="Source"
            icon={TrendingUp}
            type="text"
            name="source"
            value={source}
            onChange={handleSourceChange}
            placeholder="Company name, Client..."
            error={
              createEarningMutation.error?.data?.zodError?.fieldErrors?.source
            }
          />

          <Input
            label="Date"
            icon={Calendar}
            type="date"
            name="date"
            value={date}
            onChange={handleDateChange}
            error={
              createEarningMutation.error?.data?.zodError?.fieldErrors?.date
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

            <Button loading={loading} type="submit" label="Create earning" />
          </div>
        </form>
      </div>
    </div>
  );
}
