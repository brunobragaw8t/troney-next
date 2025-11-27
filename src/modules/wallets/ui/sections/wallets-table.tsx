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

export function WalletsTable() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: wallets } = useSuspenseQuery(
    trpc.wallets.getWallets.queryOptions(),
  );

  const balanceTotal = useMemo(() => {
    return wallets.reduce((acc, wallet) => acc + Number(wallet.balance), 0);
  }, [wallets]);

  const deleteWalletMutation = useMutation(
    trpc.wallets.deleteWallet.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.wallets.getWallets.queryOptions());
        setDeletionModalOpen(false);
        setWalletToDelete(null);
      },
    }),
  );

  const handleEdit = useCallback(
    (index: number) => {
      router.replace(`/wallets/${wallets[index].id}/edit`);
    },
    [router, wallets],
  );

  const handleDelete = useCallback(
    (index: number) => {
      const wallet = wallets[index];
      setWalletToDelete({ id: wallet.id, name: wallet.name });
      setDeletionModalOpen(true);
    },
    [wallets],
  );

  const handleCancelDelete = useCallback(() => {
    setDeletionModalOpen(false);
    setWalletToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (walletToDelete) {
      deleteWalletMutation.mutate(walletToDelete.id);
    }
  }, [walletToDelete, deleteWalletMutation]);

  const actions: TableRowActions = useMemo(
    () => ({
      e: handleEdit,
      d: handleDelete,
    }),
    [handleEdit, handleDelete],
  );

  return (
    <>
      <Table numberOfRows={wallets.length}>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Balance</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow>
            <TableHeader>Total</TableHeader>
            <TableHeader>{balanceTotal.toFixed(2)} €</TableHeader>
            <TableCell></TableCell>
          </TableRow>

          {wallets.map((wallet, index) => (
            <TableRow key={wallet.id} rowIndex={index} actions={actions}>
              <TableHeader>{wallet.name}</TableHeader>
              <TableCell>{wallet.balance}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    type="link"
                    icon={PencilLine}
                    iconPosition="left"
                    href={`/wallets/${wallet.id}/edit`}
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
        title="Delete wallet"
        message="Are you sure you want to delete this wallet? This action cannot be undone."
        confirmText="Delete"
        variant="danger-ghost"
        loading={deleteWalletMutation.isPending}
      />
    </>
  );
}
