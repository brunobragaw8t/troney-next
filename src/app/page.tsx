"use client";

import { type FormEvent, useState } from "react";
import { api } from "~/trpc/react";
import Input from "./_components/Input";
import IconEmail from "./_components/icons/IconEmail";
import IconPassword from "./_components/icons/IconPassword";
import Button from "./_components/Button";
import IconUser from "./_components/icons/IconUser";
import Alert from "./_components/Alert";

export default function Home() {
  const [form, setForm] = useState<"login" | "register" | "recover">("login");
  const [loading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");

  const registerMutation = api.users.register.useMutation({
    onSuccess() {
      setName("");
      setEmail("");
      setPassword("");
      setRepassword("");
    },
  });

  async function handleForm(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    switch (form) {
      case "login":
        // login
        break;

      case "register":
        try {
          registerMutation.mutate({ name, email, password, repassword });
        } catch {}
        break;

      case "recover":
      // recover
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleForm}>
      {form === "login" ? (
        <>
          <Input
            type="email"
            name="email"
            value={email}
            setter={setEmail}
            placeholder="Enter your email"
            icon={<IconEmail />}
            label="Email"
            autoFocus={true}
          />

          <Input
            type="password"
            name="password"
            value={password}
            setter={setPassword}
            placeholder="Enter your password"
            icon={<IconPassword />}
            label="Password"
            toggleType={true}
          />

          <div className="flex justify-between">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="remember"
                  className="relative h-3 w-3 appearance-none rounded-sm border outline-none after:absolute after:bottom-1/2 after:right-1/2 after:translate-x-1/2 after:translate-y-1/2 after:text-xs after:text-white after:opacity-0 after:content-['✓'] checked:border-primary-1 checked:bg-primary-1 checked:after:opacity-100 focus:ring-1 focus:ring-white"
                />

                <span className="text-sm font-medium text-secondary-4">
                  Remember me
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setForm("recover")}
              className="rounded border border-transparent text-sm font-medium text-primary-1 outline-none hover:text-primary-2 focus:border-white"
            >
              Forgot password?
            </button>
          </div>

          <Button loading={loading} type="submit" label="Login" />

          <p className="text-center text-sm font-medium text-secondary-4">
            Don't have an account?{" "}
            <button
              type="button"
              className="rounded border border-transparent text-primary-1 outline-none hover:text-primary-2 focus:border-white"
              onClick={() => setForm("register")}
            >
              Sign up
            </button>
          </p>
        </>
      ) : null}

      {form === "register" ? (
        <>
          <Input
            type="text"
            name="name"
            value={name}
            setter={setName}
            placeholder="Enter your name"
            icon={<IconUser />}
            label="Name"
            autoFocus={true}
            error={registerMutation.error?.data?.zodError?.fieldErrors.name}
          />

          <Input
            type="email"
            name="email"
            value={email}
            setter={setEmail}
            placeholder="Enter your email"
            icon={<IconEmail />}
            label="Email"
            error={registerMutation.error?.data?.zodError?.fieldErrors.email}
          />

          <Input
            type="password"
            name="password"
            value={password}
            setter={setPassword}
            placeholder="Enter your password"
            icon={<IconPassword />}
            label="Password"
            toggleType={true}
            error={registerMutation.error?.data?.zodError?.fieldErrors.password}
          />

          <Input
            type="password"
            name="repassword"
            value={repassword}
            setter={setRepassword}
            placeholder="Repeat your password"
            icon={<IconPassword />}
            label="Password confirmation"
            toggleType={true}
            error={
              registerMutation.error?.data?.zodError?.fieldErrors.repassword
            }
          />

          <Button
            loading={registerMutation.isPending}
            type="submit"
            label="Register"
          />

          {registerMutation.isError ? (
            <Alert
              type="error"
              message={
                registerMutation.error.data?.zodError
                  ? "There are errors that need your attention."
                  : registerMutation.error.message
              }
            />
          ) : null}

          {registerMutation.isSuccess ? (
            <Alert
              type="success"
              message="Your have been successfully registered! Please check your email to activate your account."
            />
          ) : null}

          <p className="text-center text-sm font-medium text-secondary-4">
            Already have an account?{" "}
            <button
              type="button"
              className="rounded border border-transparent text-primary-1 outline-none hover:text-primary-2 focus:border-white"
              onClick={() => setForm("login")}
            >
              Login
            </button>
          </p>
        </>
      ) : null}

      {form === "recover" ? (
        <>
          <Input
            type="email"
            name="email"
            value={email}
            setter={setEmail}
            placeholder="Enter your email"
            icon={<IconEmail />}
            label="Email"
            autoFocus={true}
          />

          <Button loading={loading} type="submit" label="Recover" />

          <p className="text-center text-sm font-medium text-secondary-4">
            <button
              type="button"
              className="rounded border border-transparent text-primary-1 outline-none hover:text-primary-2 focus:border-white"
              onClick={() => setForm("login")}
            >
              Return to login
            </button>
          </p>
        </>
      ) : null}
    </form>
  );
}
