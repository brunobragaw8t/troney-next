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
import { currency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export function ExpensesTable() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { data: expenses } = useSuspenseQuery(
    trpc.expenses.getExpenses.queryOptions(),
  );

  const deleteExpenseMutation = useMutation(
    trpc.expenses.deleteExpense.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.expenses.getExpenses.queryOptions());
        setDeletionModalOpen(false);
        setExpenseToDelete(null);
      },
    }),
  );

  const handleEdit = useCallback(
    (index: number) => {
      router.replace(`/expenses/${expenses[index].id}/edit`);
    },
    [router, expenses],
  );

  const handleDelete = useCallback(
    (index: number) => {
      const expense = expenses[index];
      setExpenseToDelete({ id: expense.id, title: expense.title });
      setDeletionModalOpen(true);
    },
    [expenses],
  );

  const handleCancelDelete = useCallback(() => {
    setDeletionModalOpen(false);
    setExpenseToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (expenseToDelete) {
      deleteExpenseMutation.mutate(expenseToDelete.id);
    }
  }, [expenseToDelete, deleteExpenseMutation]);

  const actions: TableRowActions = useMemo(
    () => ({
      e: handleEdit,
      d: handleDelete,
    }),
    [handleEdit, handleDelete],
  );

  return (
    <>
      <Table numberOfRows={expenses.length}>
        <TableHead>
          <TableRow>
            <TableHeader>Title</TableHeader>
            <TableHeader>Value</TableHeader>
            <TableHeader>Source</TableHeader>
            <TableHeader>Category</TableHeader>
            <TableHeader>Bucket</TableHeader>
            <TableHeader>Wallet</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {expenses.map((expense, index) => (
            <TableRow key={expense.id} rowIndex={index} actions={actions}>
              <TableCell>{expense.title}</TableCell>
              <TableCell>{currency(parseFloat(expense.value))}</TableCell>
              <TableCell>{expense.source}</TableCell>
              <TableCell>{expense.categoryName || "No category"}</TableCell>
              <TableCell>{expense.bucketName || "No bucket"}</TableCell>
              <TableCell>{expense.walletName || "No wallet"}</TableCell>
              <TableCell>{expense.date}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    type="link"
                    icon={PencilLine}
                    iconPosition="left"
                    href={`/expenses/${expense.id}/edit`}
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
                    onClick={() => handleDelete(index)}
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
        title="Delete expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        variant="danger-ghost"
        loading={deleteExpenseMutation.isPending}
      />
    </>
  );
}
