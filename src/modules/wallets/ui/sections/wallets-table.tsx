import { Button } from "@/components/ui/button/button";
import { Keymap } from "@/components/ui/keymap/keymap";
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
import { useSuspenseQuery } from "@tanstack/react-query";
import { PencilLine, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

export function WalletsTable() {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: wallets } = useSuspenseQuery(
    trpc.wallets.getWallets.queryOptions(),
  );

  const handleEdit = useCallback((index: number) => {
    console.log(`Edit index ${index}`);
  }, []);

  const handleDelete = useCallback((index: number) => {
    console.log(`Delete index ${index}`);
  }, []);

  const actions: TableRowActions = useMemo(
    () => ({
      e: handleEdit,
      d: handleDelete,
    }),
    [handleEdit, handleDelete],
  );

  return (
    <Table numberOfRows={wallets.length}>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Balance</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableRow>
      </TableHead>

      <TableBody>
        {wallets.map((wallet, index) => (
          <TableRow key={wallet.id} rowIndex={index} actions={actions}>
            <TableHeader>{wallet.name}</TableHeader>
            <TableCell>${wallet.balance}</TableCell>
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
  );
}
