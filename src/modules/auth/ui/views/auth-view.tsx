import Brand from "@/components/icons/brand";
import { AuthForm } from "@/modules/auth/ui/sections/auth-form";

export function AuthView() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex w-96 flex-col gap-8 rounded-xl bg-secondary-2 p-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-white">
            <Brand />
            <h1>Troney</h1>
          </div>

          <span className="text-center font-medium text-secondary-4">
            Track your expenses with ease
          </span>
        </div>

        <AuthForm />
      </div>
    </main>
  );
}
