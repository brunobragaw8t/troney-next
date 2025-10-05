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
import { Folder, Palette, Hash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export function EditCategoryForm() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: category } = useSuspenseQuery(
    trpc.categories.getCategory.queryOptions(categoryId),
  );

  const [name, setName] = useState(category.name);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  const [color, setColor] = useState(category.color);

  function handleColorChange(event: React.ChangeEvent<HTMLInputElement>) {
    setColor(event.target.value.toLowerCase());
  }

  const [icon, setIcon] = useState(category.icon || "");

  function handleIconChange(event: React.ChangeEvent<HTMLInputElement>) {
    setIcon(event.target.value);
  }

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<AlertProps>({
    type: "success",
    message: "",
  });

  const updateCategoryMutation = useMutation(
    trpc.categories.updateCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.categories.getCategory.queryOptions(categoryId),
        );

        setAlert({
          type: "success",
          message: "Category updated successfully!",
        });

        setTimeout(() => {
          router.replace("/categories");
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

    const hexColorRegex = /^#([a-f0-9]{6})$/;
    if (!hexColorRegex.test(color)) {
      setAlert({
        type: "error",
        message: "Color must be a valid hexadecimal color (e.g.: #ff0000)",
      });
      setLoading(false);
      return;
    }

    updateCategoryMutation.mutate({
      id: categoryId,
      name: name.trim(),
      color: color,
      icon: icon.trim() || undefined,
    });
  }

  function handleGoBack() {
    router.replace("/categories");
  }

  return (
    <div className="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          icon={Folder}
          type="text"
          name="name"
          value={name}
          onChange={handleNameChange}
          placeholder="Food, Transport, Entertainment..."
          autoFocus={true}
          error={
            updateCategoryMutation.error?.data?.zodError?.fieldErrors?.name
          }
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Color"
              icon={Palette}
              type="text"
              name="color"
              value={color}
              onChange={handleColorChange}
              error={
                updateCategoryMutation.error?.data?.zodError?.fieldErrors?.color
              }
            />
          </div>
          <div
            className="mt-6 h-12 w-12 rounded-full border border-gray-600"
            style={{ backgroundColor: color }}
          />
        </div>

        <Input
          label="Icon (optional)"
          icon={Hash}
          type="text"
          name="icon"
          value={icon}
          onChange={handleIconChange}
          placeholder="🍔, 🚗, 🎬..."
          error={
            updateCategoryMutation.error?.data?.zodError?.fieldErrors?.icon
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

          <Button loading={loading} type="submit" label="Update category" />
        </div>
      </form>
    </div>
  );
}
