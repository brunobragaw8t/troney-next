"use client";

import { Alert, AlertProps } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Select } from "@/components/ui/select/select";
import { isValidFloat } from "@/lib/validation";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Euro } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export function EditMovementForm() {
  const params = useParams();
  const router = useRouter();
  const movementId = params.id as string;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: movement } = useSuspenseQuery(
    trpc.movements.getMovement.queryOptions(movementId),
  );

  const { data: wallets } = useSuspenseQuery(
    trpc.wallets.getWallets.queryOptions(),
  );

  const walletOptions = wallets.map((wallet) => ({
    value: wallet.id,
    label: wallet.name,
  }));

  const [walletIdSource, setWalletIdSource] = useState(
    movement.walletIdSource || "",
  );

  function handleWalletIdSourceChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setWalletIdSource(event.target.value);
  }

  const [walletIdTarget, setWalletIdTarget] = useState(
    movement.walletIdTarget || "",
  );

  function handleWalletIdTargetChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setWalletIdTarget(event.target.value);
  }

  const [value, setValue] = useState(movement.value);

  function handleValueChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (value === "" || isValidFloat(value)) {
      setValue(value);
    }
  }

  const [date, setDate] = useState(movement.date);

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDate(event.target.value);
  }

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<AlertProps>({
    type: "success",
    message: "",
  });

  const updateMovementMutation = useMutation(
    trpc.movements.updateMovement.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.movements.getMovement.queryOptions(movementId),
        );
        queryClient.invalidateQueries(
          trpc.movements.getMovements.queryOptions(),
        );
        queryClient.invalidateQueries(trpc.wallets.getWallets.queryOptions());

        setAlert({
          type: "success",
          message: "Movement updated successfully!",
        });

        setTimeout(() => {
          router.replace("/movements");
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

    updateMovementMutation.mutate({
      id: movementId,
      walletIdSource,
      walletIdTarget,
      value: parseFloat(value),
      date: new Date(date),
    });
  }

  function handleGoBack() {
    router.replace("/movements");
  }

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="From wallet"
          name="walletIdSource"
          options={walletOptions}
          value={walletIdSource}
          onChange={handleWalletIdSourceChange}
          placeholder="Select source wallet"
          error={
            updateMovementMutation.error?.data?.zodError?.fieldErrors
              ?.walletIdSource
          }
        />

        <Select
          label="To wallet"
          name="walletIdTarget"
          options={walletOptions}
          value={walletIdTarget}
          onChange={handleWalletIdTargetChange}
          placeholder="Select target wallet"
          error={
            updateMovementMutation.error?.data?.zodError?.fieldErrors
              ?.walletIdTarget
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
            updateMovementMutation.error?.data?.zodError?.fieldErrors?.value
          }
        />

        <Input
          label="Date"
          type="date"
          name="date"
          value={date}
          onChange={handleDateChange}
          error={
            updateMovementMutation.error?.data?.zodError?.fieldErrors?.date
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

          <Button loading={loading} type="submit" label="Update movement" />
        </div>
      </form>
    </div>
  );
}
