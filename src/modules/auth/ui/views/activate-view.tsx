"use client";

import { useEffect, useState } from "react";
import { AuthLayout } from "../layout";
import { Alert, AlertProps } from "@/components/ui/alert/alert";
import { Spinner } from "@/components/ui/spinner/spinner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

interface ActivateViewProps {
  token: string;
}

export function ActivateView({ token }: ActivateViewProps) {
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<AlertProps>({
    type: "error",
    message:
      "An error occurred while activating your account. Please try again later.",
  });

  const activateMutation = useMutation(
    useTRPC().auth.activate.mutationOptions({
      onSuccess: () => {
        setLoading(false);

        setAlert({
          type: "success",
          message: "Your account has been activated! Redirecting...",
        });

        setTimeout(() => {
          window.location.href = "/auth";
        }, 3000);
      },
      onError: () => {
        setLoading(false);
        setAlert({
          type: "error",
          message: "Failed to activate your account.",
        });
      },
    }),
  );

  useEffect(() => {
    activateMutation.mutate({ token });
  }, [token]);

  if (loading) {
    return (
      <AuthLayout>
        <Spinner message="Activating your account..." />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center space-y-4">
        <Alert type={alert.type} message={alert.message} />
      </div>
    </AuthLayout>
  );
}
