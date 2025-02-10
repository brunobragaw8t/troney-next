"use client";

import { useEffect, useId, useRef, useState } from "react";
import IconEye from "./icons/IconEye";
import IconEyeSlash from "./icons/IconEyeSlash";

type InputProps = {
  label?: string;
  icon?: React.ReactNode;
  type: "text" | "email" | "password";
  name: string;
  value: string;
  setter: (newValue: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  toggleType?: boolean;
  error?: string | string[];
};

export default function Input(props: InputProps) {
  const id = useId();
  const elRef = useRef<HTMLInputElement>(null);
  const [displayAsText, setDisplayAsText] = useState(false);

  useEffect(() => {
    if (props.autoFocus && elRef.current) {
      elRef.current.focus();
    }
  }, [props.autoFocus]);

  return (
    <div>
      {props.label ? (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-white"
        >
          {props.label}
        </label>
      ) : null}

      <div className="relative">
        {props.icon ? (
          <div className="pointer-events-none absolute left-0 top-0 flex h-full items-center pl-3">
            {props.icon}
          </div>
        ) : null}

        <input
          ref={elRef}
          id={id}
          type={displayAsText ? "text" : props.type}
          name={props.name}
          value={props.value}
          onInput={(e) => props.setter(e.currentTarget.value)}
          placeholder={props.placeholder}
          className={`w-full rounded-lg border border-transparent bg-secondary-3 py-2 placeholder-secondary-4 outline-none ${props.icon ? "pl-10" : "pl-3"} ${props.toggleType ? "pr-10" : "pr-3"} text-white focus:border-white`}
        />

        {props.toggleType ? (
          <button
            type="button"
            onClick={() => setDisplayAsText(!displayAsText)}
            className="absolute right-1 top-1 flex items-center rounded-lg border border-transparent p-2 outline-none focus:border-white"
          >
            {displayAsText ? <IconEyeSlash /> : <IconEye />}
          </button>
        ) : null}
      </div>

      {props.error ? (
        <p className="mt-1 text-xs text-red-400">
          {Array.isArray(props.error)
            ? props.error.map((e) => (
                <span className="block" key={e}>
                  {e}
                </span>
              ))
            : props.error}
        </p>
      ) : null}
    </div>
  );
}
