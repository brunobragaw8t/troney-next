"use client";

import { useUser } from "@/hooks/useUser";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function AppUser() {
  const router = useRouter();
  const trpc = useTRPC();

  const user = useUser();
  const userName = user.data ? user.data.name.split(" ")[0] : null;

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
    <div className="mt-auto flex items-center justify-end text-secondary-4">
      {userName && <span className="mr-auto">{userName}</span>}

      <button
        className={`hover:text-red-500 ${logoutMutation.isPending ? "cursor-wait opacity-50" : ""}`}
        onClick={handleLogout}
      >
        <LogOut size={20} className="my-1" />
      </button>
    </div>
  );
}
