import { Button } from "@/components/ui/button/button";
import { currency } from "@/lib/utils";
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

export function MovementsTable() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<{
    id: string;
    sourceWalletName: string;
    targetWalletName: string;
  } | null>(null);

  const { data: movements } = useSuspenseQuery(
    trpc.movements.getMovements.queryOptions(),
  );

  const deleteMovementMutation = useMutation(
    trpc.movements.deleteMovement.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.movements.getMovements.queryOptions(),
        );
        setDeletionModalOpen(false);
        setMovementToDelete(null);
      },
    }),
  );

  const handleEdit = useCallback(
    (index: number) => {
      router.replace(`/movements/${movements[index].id}/edit`);
    },
    [router, movements],
  );

  const handleDelete = useCallback(
    (index: number) => {
      const movement = movements[index];
      setMovementToDelete({
        id: movement.id,
        sourceWalletName: movement.sourceWalletName || "Unknown",
        targetWalletName: movement.targetWalletName || "Unknown",
      });
      setDeletionModalOpen(true);
    },
    [movements],
  );

  const handleCancelDelete = useCallback(() => {
    setDeletionModalOpen(false);
    setMovementToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (movementToDelete) {
      deleteMovementMutation.mutate(movementToDelete.id);
    }
  }, [movementToDelete, deleteMovementMutation]);

  const actions: TableRowActions = useMemo(
    () => ({
      e: handleEdit,
      d: handleDelete,
    }),
    [handleEdit, handleDelete],
  );

  return (
    <>
      <Table numberOfRows={movements.length}>
        <TableHead>
          <TableRow>
            <TableHeader>Date</TableHeader>
            <TableHeader>Source</TableHeader>
            <TableHeader>Value</TableHeader>
            <TableHeader>Target</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {movements.map((movement, index) => (
            <TableRow key={movement.id} rowIndex={index} actions={actions}>
              <TableCell>{movement.date}</TableCell>
              <TableCell>{movement.sourceWalletName || "Unknown"}</TableCell>
              <TableCell>{currency(parseFloat(movement.value))}</TableCell>
              <TableCell>{movement.targetWalletName || "Unknown"}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    type="link"
                    icon={PencilLine}
                    iconPosition="left"
                    href={`/movements/${movement.id}/edit`}
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
        title="Delete movement"
        message={`Are you sure you want to delete this movement from ${movementToDelete?.sourceWalletName || "Unknown"} to ${movementToDelete?.targetWalletName || "Unknown"}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger-ghost"
        loading={deleteMovementMutation.isPending}
      />
    </>
  );
}
