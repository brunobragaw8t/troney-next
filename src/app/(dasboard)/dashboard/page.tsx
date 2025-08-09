"use client";

import { Button } from "@/components/ui/button/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const trpc = useTRPC();
  const logoutMutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        router.push("/auth");
      },
    }),
  );

  function handleLogout() {
    logoutMutation.mutate();
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Dashboard</h1>

      <Button type="button" label="Logout" onClick={handleLogout} />
    </div>
  );
}
