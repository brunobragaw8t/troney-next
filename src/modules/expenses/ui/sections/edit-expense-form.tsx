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
  TrendingDown,
  Calendar,
  Captions,
  Archive,
  Tag,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export function EditExpenseForm() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params.id as string;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: expense } = useSuspenseQuery(
    trpc.expenses.getExpense.queryOptions(expenseId),
  );

  const { data: wallets = [] } = useQuery(
    trpc.wallets.getWallets.queryOptions(),
  );

  const walletOptions = wallets.map((wallet) => ({
    value: wallet.id,
    label: wallet.name,
  }));

  const [walletId, setWalletId] = useState(expense.walletId ?? "");

  function handleWalletIdChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setWalletId(event.target.value);
  }

  const { data: buckets = [] } = useQuery(
    trpc.buckets.getBuckets.queryOptions(),
  );

  const bucketOptions = buckets.map((bucket) => ({
    value: bucket.id,
    label: bucket.name,
  }));

  const [bucketId, setBucketId] = useState(expense.bucketId ?? "");

  function handleBucketIdChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setBucketId(event.target.value);
  }

  const { data: categories = [] } = useQuery(
    trpc.categories.getCategories.queryOptions(),
  );

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const [categoryId, setCategoryId] = useState(expense.categoryId ?? "");

  function handleCategoryIdChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setCategoryId(event.target.value);
  }

  const [title, setTitle] = useState(expense.title);

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
  }

  const [description, setDescription] = useState(expense.description);

  function handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
  }

  const [value, setValue] = useState(expense.value);

  function handleValueChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (value === "" || isValidFloat(value)) {
      setValue(value);
    }
  }

  const [source, setSource] = useState(expense.source);

  function handleSourceChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSource(event.target.value);
  }

  const [date, setDate] = useState(expense.date);

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDate(event.target.value);
  }

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<AlertProps>({
    type: "success",
    message: "",
  });

  const updateExpenseMutation = useMutation(
    trpc.expenses.updateExpense.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.expenses.getExpense.queryOptions(expenseId),
        );

        setAlert({
          type: "success",
          message: "Expense updated successfully!",
        });

        setTimeout(() => {
          router.replace("/expenses");
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

    updateExpenseMutation.mutate({
      id: expenseId,
      walletId: walletId,
      bucketId: bucketId,
      categoryId: categoryId,
      title: title.trim(),
      description: description.trim(),
      value: parseFloat(value) || 0,
      source: source.trim(),
      date: new Date(date),
    });
  }

  function handleGoBack() {
    router.replace("/expenses");
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
            updateExpenseMutation.error?.data?.zodError?.fieldErrors?.walletId
          }
        />

        <Select
          label="Bucket"
          icon={Archive}
          name="bucketId"
          value={bucketId}
          onChange={handleBucketIdChange}
          placeholder="Select a bucket"
          options={bucketOptions}
          error={
            updateExpenseMutation.error?.data?.zodError?.fieldErrors?.bucketId
          }
        />

        <Select
          label="Category"
          icon={Tag}
          name="categoryId"
          value={categoryId}
          onChange={handleCategoryIdChange}
          placeholder="Select a category"
          options={categoryOptions}
          error={
            updateExpenseMutation.error?.data?.zodError?.fieldErrors?.categoryId
          }
        />

        <Input
          label="Title"
          icon={Captions}
          type="text"
          name="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Groceries, Rent, Utilities..."
          error={
            updateExpenseMutation.error?.data?.zodError?.fieldErrors?.title
          }
        />

        <Input
          label="Description"
          icon={FileText}
          type="text"
          name="description"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Weekly groceries, Monthly rent..."
          error={
            updateExpenseMutation.error?.data?.zodError?.fieldErrors
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
            updateExpenseMutation.error?.data?.zodError?.fieldErrors?.value
          }
        />

        <Input
          label="Source"
          icon={TrendingDown}
          type="text"
          name="source"
          value={source}
          onChange={handleSourceChange}
          placeholder="Store name, Service provider..."
          error={
            updateExpenseMutation.error?.data?.zodError?.fieldErrors?.source
          }
        />

        <Input
          label="Date"
          icon={Calendar}
          type="date"
          name="date"
          value={date}
          onChange={handleDateChange}
          error={updateExpenseMutation.error?.data?.zodError?.fieldErrors?.date}
        />

        {alert.message && <Alert type={alert.type} message={alert.message} />}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            label="Cancel"
            variant="outline"
            onClick={handleGoBack}
          />

          <Button loading={loading} type="submit" label="Update expense" />
        </div>
      </form>
    </div>
  );
}
