"use client";

import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Eye, EyeClosed, Key, Mail, User } from "lucide-react";
import { useState } from "react";
import { AuthFormFooter } from "./auth-form-footer";
import type { Form } from "./auth-form";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertProps } from "@/components/ui/alert/alert";
import { useTRPC } from "@/trpc/client";

interface RegisterFormProps {
  className?: string;
  email: string;
  onEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setForm: (form: Form) => void;
}

export function RegisterForm({
  className,
  email,
  onEmailChange,
  setForm,
}: RegisterFormProps) {
  const [name, setName] = useState("");

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  const [password, setPassword] = useState("");

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  const [displayPasswordAsText, setDisplayPasswordAsText] = useState(false);

  function toggleDisplayPasswordAsText() {
    setDisplayPasswordAsText(!displayPasswordAsText);
  }

  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  function handlePasswordConfirmationChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setPasswordConfirmation(event.target.value);
  }

  const [
    displayPasswordConfirmationAsText,
    setDisplayPasswordConfirmationAsText,
  ] = useState(false);

  function toggleDisplayPasswordConfirmationAsText() {
    setDisplayPasswordConfirmationAsText(!displayPasswordConfirmationAsText);
  }

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<AlertProps>({
    type: "success",
    message: "",
  });

  const trpc = useTRPC();

  const registerMutation = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: () => {
        setAlert({
          type: "success",
          message:
            "Registration successful! Please check your email to verify your account.",
        });

        setLoading(false);

        setName("");
        setPassword("");
        setPasswordConfirmation("");
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

    setDisplayPasswordAsText(false);
    setDisplayPasswordConfirmationAsText(false);

    registerMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      password,
      passwordConfirmation,
    });
  }

  function goToLoginForm() {
    setForm("login");
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <Input
        label="Name"
        icon={User}
        type="text"
        name="name"
        value={name}
        onChange={handleNameChange}
        placeholder="Enter your name"
        autoFocus={true}
        error={registerMutation.error?.data?.zodError?.fieldErrors?.name}
      />

      <Input
        label="Email"
        icon={Mail}
        type="email"
        name="email"
        value={email}
        onChange={onEmailChange}
        placeholder="Enter your email"
        error={registerMutation.error?.data?.zodError?.fieldErrors?.email}
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
        error={registerMutation.error?.data?.zodError?.fieldErrors?.password}
      />

      <Input
        label="Password confirmation"
        icon={Key}
        type={displayPasswordConfirmationAsText ? "text" : "password"}
        name="password_confirmation"
        value={passwordConfirmation}
        onChange={handlePasswordConfirmationChange}
        placeholder="Repeat your password"
        rightAccessoryIcon={displayPasswordConfirmationAsText ? EyeClosed : Eye}
        rightAccessoryAction={toggleDisplayPasswordConfirmationAsText}
        rightAccessoryLabel={
          displayPasswordConfirmationAsText ? "Hide password" : "Show password"
        }
        error={
          registerMutation.error?.data?.zodError?.fieldErrors
            ?.passwordConfirmation
        }
      />

      {alert.message && <Alert type={alert.type} message={alert.message} />}

      <Button loading={loading} type="submit" label="Register" />

      <AuthFormFooter
        label="Already have an account?"
        buttonLabel="Login"
        buttonAction={goToLoginForm}
      />
    </form>
  );
}
