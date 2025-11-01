"use client";

import { Alert, AlertProps } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Folder, Palette, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function CreateCategoryView() {
  const router = useRouter();

  useKeyboardShortcuts({
    shortcuts: useMemo(
      () => [
        {
          key: "Escape",
          action: () => {
            router.replace("/categories");
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

  const [color, setColor] = useState("#3b82f6");

  function handleColorChange(event: React.ChangeEvent<HTMLInputElement>) {
    setColor(event.target.value.toLowerCase());
  }

  const [icon, setIcon] = useState("");

  function handleIconChange(event: React.ChangeEvent<HTMLInputElement>) {
    setIcon(event.target.value);
  }

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<AlertProps>({
    type: "success",
    message: "",
  });

  const trpc = useTRPC();

  const createCategoryMutation = useMutation(
    trpc.categories.createCategory.mutationOptions({
      onSuccess: () => {
        setAlert({
          type: "success",
          message: "Category created successfully!",
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

    createCategoryMutation.mutate({
      name: name.trim(),
      color: color,
      icon: icon.trim() || undefined,
    });
  }

  function handleGoBack() {
    router.replace("/categories");
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

        <h1 className="text-3xl font-bold text-white">Create category</h1>
      </div>

      <p className="mb-8 text-secondary-4">
        Add a new category to organize your expenses
      </p>

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
              createCategoryMutation.error?.data?.zodError?.fieldErrors?.name
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
                  createCategoryMutation.error?.data?.zodError?.fieldErrors
                    ?.color
                }
              />
            </div>

            <div
              className="mt-6 h-12 w-12 rounded-full border border-gray-600"
              style={{ backgroundColor: color }}
            />
          </div>

          <Input
            label="Icon"
            icon={Hash}
            type="text"
            name="icon"
            value={icon}
            onChange={handleIconChange}
            placeholder="🍔, 🚗, 🎬..."
            error={
              createCategoryMutation.error?.data?.zodError?.fieldErrors?.icon
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

            <Button loading={loading} type="submit" label="Create category" />
          </div>
        </form>
      </div>
    </div>
  );
}
