import type { Meta } from "@storybook/nextjs-vite";
import { Eye, EyeClosed, LockKeyhole, User, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Input } from "./input";

const meta = {
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;

export function Default() {
  const [value, setValue] = useState("");

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  function clearValue(ref: HTMLInputElement) {
    setValue("");
    ref.focus();
  }

  return (
    <Input
      label="Name"
      icon={User}
      type="text"
      name="name"
      value={value}
      onChange={handleOnChange}
      placeholder="Enter your name"
      rightAccessoryIcon={value !== "" ? X : undefined}
      rightAccessoryAction={clearValue}
      rightAccessoryLabel={"Clear field"}
    />
  );
}

export function Password() {
  const [value, setValue] = useState("");

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  const [displayAsText, setDisplayAsText] = useState(false);

  function toggleDisplayAsText() {
    setDisplayAsText(!displayAsText);
  }

  return (
    <Input
      label="Password"
      icon={LockKeyhole}
      type={displayAsText ? "text" : "password"}
      name="password"
      value={value}
      onChange={handleOnChange}
      placeholder="Enter your pasword"
      rightAccessoryIcon={displayAsText ? EyeClosed : Eye}
      rightAccessoryAction={toggleDisplayAsText}
      rightAccessoryLabel={displayAsText ? "Hide password" : "Show password"}
    />
  );
}
