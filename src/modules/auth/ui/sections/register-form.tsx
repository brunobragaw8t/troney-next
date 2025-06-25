"use client";

import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Eye, EyeClosed, Key, Mail, User } from "lucide-react";
import { useState } from "react";
import { AuthFormFooter } from "./auth-form-footer";
import type { Form } from "./auth-form";

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
    setDisplayPasswordAsText(!displayPasswordAsText);
  }

  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);

    setDisplayPasswordAsText(false);
    setDisplayPasswordConfirmationAsText(false);
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
      />

      <Input
        label="Email"
        icon={Mail}
        type="email"
        name="email"
        value={email}
        onChange={onEmailChange}
        placeholder="Enter your email"
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
      />

      <Button loading={loading} type="submit" label="Register" />

      <AuthFormFooter
        label="Already have an account?"
        buttonLabel="Login"
        buttonAction={goToLoginForm}
      />
    </form>
  );
}
