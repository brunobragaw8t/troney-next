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

export function EarningsTable() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [earningToDelete, setEarningToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { data: earnings } = useSuspenseQuery(
    trpc.earnings.getEarnings.queryOptions(),
  );

  const deleteEarningMutation = useMutation(
    trpc.earnings.deleteEarning.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.earnings.getEarnings.queryOptions());
        setDeletionModalOpen(false);
        setEarningToDelete(null);
      },
    }),
  );

  const handleEdit = useCallback(
    (index: number) => {
      router.replace(`/earnings/${earnings[index].id}/edit`);
    },
    [router, earnings],
  );

  const handleDelete = useCallback(
    (index: number) => {
      const earning = earnings[index];
      setEarningToDelete({ id: earning.id, title: earning.title });
      setDeletionModalOpen(true);
    },
    [earnings],
  );

  const handleCancelDelete = useCallback(() => {
    setDeletionModalOpen(false);
    setEarningToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (earningToDelete) {
      deleteEarningMutation.mutate(earningToDelete.id);
    }
  }, [earningToDelete, deleteEarningMutation]);

  const actions: TableRowActions = useMemo(
    () => ({
      e: handleEdit,
      d: handleDelete,
    }),
    [handleEdit, handleDelete],
  );

  return (
    <>
      <Table numberOfRows={earnings.length}>
        <TableHead>
          <TableRow>
            <TableHeader>Title</TableHeader>
            <TableHeader>Value</TableHeader>
            <TableHeader>Source</TableHeader>
            <TableHeader>Wallet</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {earnings.map((earning, index) => (
            <TableRow key={earning.id} rowIndex={index} actions={actions}>
              <TableCell>{earning.title}</TableCell>
              <TableCell>{earning.value}</TableCell>
              <TableCell>{earning.source}</TableCell>
              <TableCell>{earning.walletName || "No wallet"}</TableCell>
              <TableCell>{earning.date}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    type="link"
                    icon={PencilLine}
                    iconPosition="left"
                    href={`/earnings/${earning.id}/edit`}
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
        title="Delete earning"
        message="Are you sure you want to delete this earning? This will also remove all bucket distributions. This action cannot be undone."
        confirmText="Delete"
        variant="danger-ghost"
        loading={deleteEarningMutation.isPending}
      />
    </>
  );
}
