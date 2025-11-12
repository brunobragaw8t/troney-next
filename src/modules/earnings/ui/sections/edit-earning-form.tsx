"use client";

import { Alert, AlertProps } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Select } from "@/components/ui/select/select";
import { isValidFloat } from "@/lib/validation";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  Euro,
  Wallet,
  FileText,
  TrendingUp,
  Calendar,
  Captions,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export function EditEarningForm() {
  const params = useParams();
  const router = useRouter();
  const earningId = params.id as string;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: earning } = useSuspenseQuery(
    trpc.earnings.getEarning.queryOptions(earningId),
  );

  const { data: wallets = [] } = useQuery(
    trpc.wallets.getWallets.queryOptions(),
  );

  const walletOptions = wallets.map((wallet) => ({
    value: wallet.id,
    label: wallet.name,
  }));

  const [walletId, setWalletId] = useState(earning.walletId ?? "");

  function handleWalletIdChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setWalletId(event.target.value);
  }

  const [title, setTitle] = useState(earning.title);

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  const [description, setDescription] = useState(earning.description);

  function handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
  }

  const [value, setValue] = useState(earning.value);

  function handleValueChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (value === "" || isValidFloat(value)) {
      setValue(value);
    }
  }

  const [source, setSource] = useState(earning.source);

  function handleSourceChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSource(event.target.value);
  }

  const [date, setDate] = useState(earning.date);

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDate(event.target.value);
  }

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<AlertProps>({
    type: "success",
    message: "",
  });

  const updateEarningMutation = useMutation(
    trpc.earnings.updateEarning.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.earnings.getEarning.queryOptions(earningId),
        );

        setAlert({
          type: "success",
          message: "Earning updated successfully!",
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

    updateEarningMutation.mutate({
      id: earningId,
      walletId: walletId,
      title: title.trim(),
      description: description.trim(),
      value: parseFloat(value) || 0,
      source: source.trim(),
      date: new Date(date),
    });
  }

  function handleGoBack() {
    router.replace("/earnings");
  }

  return (
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
            updateEarningMutation.error?.data?.zodError?.fieldErrors?.walletId
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
            updateEarningMutation.error?.data?.zodError?.fieldErrors?.title
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
            updateEarningMutation.error?.data?.zodError?.fieldErrors
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
            updateEarningMutation.error?.data?.zodError?.fieldErrors?.value
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
            updateEarningMutation.error?.data?.zodError?.fieldErrors?.source
          }
        />

        <Input
          label="Date"
          icon={Calendar}
          type="date"
          name="date"
          value={date}
          onChange={handleDateChange}
          error={updateEarningMutation.error?.data?.zodError?.fieldErrors?.date}
        />

        {alert.message && <Alert type={alert.type} message={alert.message} />}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            label="Cancel"
            variant="outline"
            onClick={handleGoBack}
          />

          <Button loading={loading} type="submit" label="Update earning" />
        </div>
      </form>
    </div>
  );
}
