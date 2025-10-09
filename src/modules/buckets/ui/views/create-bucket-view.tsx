"use client";

import { Alert, AlertProps } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Select } from "@/components/ui/select/select";
// import { Select } from "@/components/ui/select/select";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Euro, PackageOpen, Percent } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateBucketView() {
  const router = useRouter();

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

  const [type, setType] = useState<"absolute" | "percentage">("percentage");

  function handleTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setType(event.target.value as "absolute" | "percentage");
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
      type,
    });
  }

  function handleGoBack() {
    router.replace("/buckets");
  }

  const typeOptions = [
    { value: "percentage", label: "Percentage (%)" },
    { value: "absolute", label: "Absolute (€)" },
  ];

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
            icon={type === "percentage" ? Percent : Euro}
            type="text"
            name="budget"
            value={budget}
            onChange={handleBudgetChange}
            placeholder={type === "percentage" ? "10" : "500.00"}
            error={
              createBucketMutation.error?.data?.zodError?.fieldErrors?.budget
            }
          />

          <Select
            label="Type"
            name="type"
            value={type}
            onChange={handleTypeChange}
            options={typeOptions}
            error={
              createBucketMutation.error?.data?.zodError?.fieldErrors?.type
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
