"use client";

import { useState } from "react";
import IconEmail from "./icons/IconEmail";
import Input from "./Input";
import IconPassword from "./icons/IconPassword";
import Button from "./Button";
import IconUser from "./icons/IconUser";

export default function AuthForms() {
  const [form, setForm] = useState<"login" | "register" | "forgot">("login");

  return (
    <form className="flex flex-col gap-4">
      {form === "login" ? (
        <>
          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            icon={<IconEmail />}
            label="Email"
            autoFocus={true}
          />

          <Input
            type="password"
            name="password"
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
                  className="checked:border-primary-1 checked:bg-primary-1 relative h-3 w-3 appearance-none rounded-sm border outline-none after:absolute after:bottom-1/2 after:right-1/2 after:translate-x-1/2 after:translate-y-1/2 after:text-xs after:text-white after:opacity-0 after:content-['✓'] checked:after:opacity-100 focus:ring-1 focus:ring-white"
                />

                <span className="text-secondary-4 text-sm font-medium">
                  Remember me
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setForm("forgot")}
              className="text-primary-1 hover:text-primary-2 rounded border border-transparent text-sm font-medium outline-none focus:border-white"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" label="Login" />

          <p className="text-secondary-4 text-center text-sm font-medium">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-primary-1 hover:text-primary-2 rounded border border-transparent outline-none focus:border-white"
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
            placeholder="Enter your name"
            icon={<IconUser />}
            label="Name"
            autoFocus={true}
          />

          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            icon={<IconEmail />}
            label="Email"
          />

          <Input
            type="password"
            name="password"
            placeholder="Enter your password"
            icon={<IconPassword />}
            label="Password"
            toggleType={true}
          />

          <Input
            type="password"
            name="repassword"
            placeholder="Repeat your password"
            icon={<IconPassword />}
            label="Password confirmation"
            toggleType={true}
          />

          <Button type="submit" label="Register" />

          <p className="text-secondary-4 text-center text-sm font-medium">
            Already have an account?{" "}
            <button
              type="button"
              className="text-primary-1 hover:text-primary-2 rounded border border-transparent outline-none focus:border-white"
              onClick={() => setForm("login")}
            >
              Login
            </button>
          </p>
        </>
      ) : null}

      {form === "forgot" ? (
        <>
          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            icon={<IconEmail />}
            label="Email"
            autoFocus={true}
          />

          <Button type="submit" label="Recover" />

          <p className="text-secondary-4 text-center text-sm font-medium">
            <button
              type="button"
              className="text-primary-1 hover:text-primary-2 rounded border border-transparent outline-none focus:border-white"
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
