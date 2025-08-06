"use client";

import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { Input } from "@/components/ui/input/input";
import { Eye, EyeClosed, Key, Mail } from "lucide-react";
import { useState } from "react";
import { AuthFormFooter } from "./auth-form-footer";
import type { Form } from "./auth-form";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertProps } from "@/components/ui/alert/alert";

interface LoginFormProps {
  className?: string;
  email: string;
  onEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setForm: (form: Form) => void;
}

export function LoginForm({
  className,
  email,
  onEmailChange,
  setForm,
}: LoginFormProps) {
  const [password, setPassword] = useState("");

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  const [displayPasswordAsText, setDisplayPasswordAsText] = useState(false);

  function toggleDisplayPasswordAsText() {
    setDisplayPasswordAsText(!displayPasswordAsText);
  }

  const [rememberMe, setRememberMe] = useState(false);

  function handleRememberMeChange() {
    setRememberMe(!rememberMe);
  }

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<AlertProps>({
    type: "success",
    message: "",
  });

  const router = useRouter();
  const trpc = useTRPC();

  const loginMutation = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: () => {
        setAlert({
          type: "success",
          message: "Login successful! Redirecting...",
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      },
      onError: (error) => {
        setAlert({
          type: "error",
          message: error.data?.zodError
            ? "There are errors that need your attention."
            : error.message,
        });

        setLoading(false);
      },
    }),
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);

    setAlert({
      type: "success",
      message: "",
    });

    loginMutation.mutate({
      email,
      password,
    });
  }

  function goToRecoverForm() {
    setForm("recover");
  }

  function goToRegisterForm() {
    setForm("register");
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <Input
        label="Email"
        icon={Mail}
        type="email"
        name="email"
        value={email}
        onChange={onEmailChange}
        placeholder="Enter your email"
        autoFocus={true}
        error={loginMutation.error?.data?.zodError?.fieldErrors.email}
      />

      <Input
        label="Password"
        icon={Key}
        type={displayPasswordAsText ? "text" : "password"}
        name="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Enter your password"
        rightAccessoryIcon={displayPasswordAsText ? EyeClosed : Eye}
        rightAccessoryAction={toggleDisplayPasswordAsText}
        rightAccessoryLabel={
          displayPasswordAsText ? "Hide password" : "Show password"
        }
        error={loginMutation.error?.data?.zodError?.fieldErrors.password}
      />

      <div className="flex justify-between">
        <div>
          <Checkbox
            label="Remember me"
            name="remember"
            value=""
            checked={rememberMe}
            onChange={handleRememberMeChange}
          />
        </div>

        <button
          type="button"
          onClick={goToRecoverForm}
          className="rounded border border-transparent text-sm font-medium text-primary-1 outline-none hover:text-primary-2 focus:border-white"
        >
          Forgot password?
        </button>
      </div>

      {alert.message && <Alert type={alert.type} message={alert.message} />}

      <Button loading={loading} type="submit" label="Login" />

      <AuthFormFooter
        label="Don't have an account?"
        buttonLabel="Sign up"
        buttonAction={goToRegisterForm}
      />
    </form>
  );
}
