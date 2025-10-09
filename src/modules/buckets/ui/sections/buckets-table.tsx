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

export function BucketsTable() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [bucketToDelete, setBucketToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: buckets } = useSuspenseQuery(
    trpc.buckets.getBuckets.queryOptions(),
  );

  const total = useMemo(() => {
    return buckets.reduce((acc, bucket) => acc + Number(bucket.budget), 0);
  }, [buckets]);

  const isTotal100 = total === 100;

  const deleteBucketMutation = useMutation(
    trpc.buckets.deleteBucket.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.buckets.getBuckets.queryOptions());
        setDeletionModalOpen(false);
        setBucketToDelete(null);
      },
    }),
  );

  const handleEdit = useCallback(
    (index: number) => {
      router.replace(`/buckets/${buckets[index].id}/edit`);
    },
    [router, buckets],
  );

  const handleDelete = useCallback(
    (index: number) => {
      const bucket = buckets[index];
      setBucketToDelete({ id: bucket.id, name: bucket.name });
      setDeletionModalOpen(true);
    },
    [buckets],
  );

  const handleCancelDelete = useCallback(() => {
    setDeletionModalOpen(false);
    setBucketToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (bucketToDelete) {
      deleteBucketMutation.mutate(bucketToDelete.id);
    }
  }, [bucketToDelete, deleteBucketMutation]);

  const actions: TableRowActions = useMemo(
    () => ({
      e: handleEdit,
      d: handleDelete,
    }),
    [handleEdit, handleDelete],
  );

  return (
    <>
      <Table numberOfRows={buckets.length}>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Budget</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow
            className={!isTotal100 ? "border-red-500 bg-red-500/10" : ""}
          >
            <TableHeader className={!isTotal100 ? "text-red-400" : ""}>
              Total
            </TableHeader>
            <TableHeader className={!isTotal100 ? "text-red-400" : ""}>
              {total} %
            </TableHeader>
            <TableCell></TableCell>
          </TableRow>

          {buckets.map((bucket, index) => (
            <TableRow key={bucket.id} rowIndex={index} actions={actions}>
              <TableHeader>{bucket.name}</TableHeader>
              <TableCell>
                {bucket.type === "percentage"
                  ? `${bucket.budget} %`
                  : `${bucket.budget}`}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    type="link"
                    icon={PencilLine}
                    iconPosition="left"
                    href={`/buckets/${bucket.id}/edit`}
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
        title="Delete bucket"
        message="Are you sure you want to delete this bucket? This action cannot be undone."
        confirmText="Delete"
        variant="danger-ghost"
        loading={deleteBucketMutation.isPending}
      />
    </>
  );
}
