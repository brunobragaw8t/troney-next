"use client";

import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Mail } from "lucide-react";
import { useState } from "react";
import { AuthFormFooter } from "./auth-form-footer";
import type { Form } from "./auth-form";

interface RecoverFormProps {
  className?: string;
  email: string;
  onEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setForm: (form: Form) => void;
}

export function RecoverForm({
  className,
  email,
  onEmailChange,
  setForm,
}: RecoverFormProps) {
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
  }

  function goToLoginForm() {
    setForm("login");
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
      />

      <Button loading={loading} type="submit" label="Recover" />

      <AuthFormFooter
        buttonLabel="Return to login"
        buttonAction={goToLoginForm}
      />
    </form>
  );
}
