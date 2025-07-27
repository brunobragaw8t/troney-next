import { AuthForm } from "@/modules/auth/ui/sections/auth-form";
import { AuthLayout } from "../layout";

export function AuthView() {
  return (
    <AuthLayout>
      <AuthForm />
    </AuthLayout>
  );
}
