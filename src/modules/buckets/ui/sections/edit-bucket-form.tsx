"use client";

import { Alert, AlertProps } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Select } from "@/components/ui/select/select";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { PackageOpen, Percent } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export function EditBucketForm() {
  const params = useParams();
  const router = useRouter();
  const bucketId = params.id as string;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: bucket } = useSuspenseQuery(
    trpc.buckets.getBucket.queryOptions(bucketId),
  );

  const [name, setName] = useState(bucket.name);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  const [budget, setBudget] = useState(bucket.budget.toString());

  function handleBudgetChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setBudget(value);
    }
  }

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<AlertProps>({
    type: "success",
    message: "",
  });

  const updateBucketMutation = useMutation(
    trpc.buckets.updateBucket.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.buckets.getBucket.queryOptions(bucketId),
        );

        setAlert({
          type: "success",
          message: "Bucket updated successfully!",
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

    updateBucketMutation.mutate({
      id: bucketId,
      name: name.trim(),
      budget: parseFloat(budget) || 0,
    });
  }

  function handleGoBack() {
    router.replace("/buckets");
  }

  return (
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
          error={updateBucketMutation.error?.data?.zodError?.fieldErrors?.name}
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
            updateBucketMutation.error?.data?.zodError?.fieldErrors?.budget
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

          <Button loading={loading} type="submit" label="Update bucket" />
        </div>
      </form>
    </div>
  );
}
