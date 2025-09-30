import { Button } from "@/components/ui/button/button";
import { Keymap } from "@/components/ui/keymap/keymap";
import { ConfirmationModal } from "@/components/ui/confirmation-modal/confirmation-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
} from "@/components/ui/table/table";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { PencilLine, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export function CategoriesTable() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: categories } = useSuspenseQuery(
    trpc.categories.getCategories.queryOptions(),
  );

  const deleteCategoryMutation = useMutation(
    trpc.categories.deleteCategory.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.categories.getCategories.queryOptions(),
        );
        setDeletionModalOpen(false);
        setCategoryToDelete(null);
      },
    }),
  );

  const handleEdit = useCallback(
    (index: number) => {
      router.replace(`/categories/${categories[index].id}/edit`);
    },
    [router, categories],
  );

  const handleDelete = useCallback(
    (index: number) => {
      const category = categories[index];
      setCategoryToDelete({ id: category.id, name: category.name });
      setDeletionModalOpen(true);
    },
    [categories],
  );

  const handleCancelDelete = useCallback(() => {
    setDeletionModalOpen(false);
    setCategoryToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
    }
  }, [categoryToDelete, deleteCategoryMutation]);

  const actions: TableRowActions = useMemo(
    () => ({
      e: handleEdit,
      d: handleDelete,
    }),
    [handleEdit, handleDelete],
  );

  return (
    <>
      <Table numberOfRows={categories.length}>
        <TableHead>
          <TableRow>
            <TableHeader>Color</TableHeader>
            <TableHeader>Icon</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {categories.map((category, index) => (
            <TableRow key={category.id} rowIndex={index} actions={actions}>
              <TableCell>
                <div
                  className="h-6 w-6 rounded-full border border-gray-600"
                  style={{ backgroundColor: category.color }}
                />
              </TableCell>
              <TableCell>{category.icon || "—"}</TableCell>
              <TableHeader>{category.name}</TableHeader>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    type="link"
                    icon={PencilLine}
                    iconPosition="left"
                    href={`/categories/${category.id}/edit`}
                    size="sm"
                    variant="primary-ghost"
                    tooltip={
                      <>
                        Edit <Keymap text="e" className="ml-1" />
                      </>
                    }
                  />

                  <Button
                    type="button"
                    icon={Trash}
                    iconPosition="left"
                    onClick={() => {}}
                    size="sm"
                    variant="danger-ghost"
                    tooltip={
                      <>
                        Delete <Keymap text="d" className="ml-1" />
                      </>
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmationModal
        isOpen={deletionModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        variant="danger-ghost"
        loading={deleteCategoryMutation.isPending}
      />
    </>
  );
}
