"use client";

import { useState } from "react";
import { LoginForm } from "@/modules/auth/ui/sections/login-form";
import { RecoverForm } from "./recover-form";
import { RegisterForm } from "./register-form";

export type Form = "login" | "register" | "recover";

export function AuthForm() {
  const [form, setForm] = useState<Form>("login");

  const formClassName = "flex flex-col gap-4";

  const [email, setEmail] = useState("");

  function handleEmailChange(evt: React.ChangeEvent<HTMLInputElement>) {
    setEmail(evt.target.value);
  }

  return (
    <>
      {form === "login" && (
        <LoginForm
          className={formClassName}
          email={email}
          onEmailChange={handleEmailChange}
          setForm={setForm}
        />
      )}

      {form === "recover" && (
        <RecoverForm
          className={formClassName}
          email={email}
          onEmailChange={handleEmailChange}
          setForm={setForm}
        />
      )}

      {form === "register" && (
        <RegisterForm
          className={formClassName}
          email={email}
          onEmailChange={handleEmailChange}
          setForm={setForm}
        />
      )}
    </>
  );
}
