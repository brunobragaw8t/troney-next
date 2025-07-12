import type { LucideProps } from "lucide-react";
import type React from "react";
import { useEffect, useId, useRef } from "react";

interface InputProps {
  label?: string;
  icon?: React.ComponentType<LucideProps>;
  type: "text" | "email" | "password";
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoFocus?: boolean;
  rightAccessoryIcon?: React.ComponentType<LucideProps>;
  rightAccessoryAction?: (ref: HTMLInputElement) => void;
  rightAccessoryLabel?: string;
  error?: string | string[];
}

export function Input(props: InputProps) {
  const id = useId();
  const errorId = useId();
  const elRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.autoFocus && elRef.current) {
      elRef.current.focus();
    }
  }, [props.autoFocus]);

  function handleRightAccessoryAction() {
    if (props.rightAccessoryAction && elRef.current) {
      props.rightAccessoryAction(elRef.current);
    }
  }

  return (
    <div>
      {props.label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-white"
        >
          {props.label}
        </label>
      )}

      <div className="relative">
        {props.icon && (
          <div className="pointer-events-none absolute left-0 top-0 flex h-full items-center pl-3 text-secondary-4">
            <props.icon size={16} />
          </div>
        )}

        <input
          ref={elRef}
          id={id}
          type={props.type}
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          className={`w-full rounded-lg border bg-secondary-3 py-2 placeholder-secondary-4 outline-none focus:border-white ${props.icon ? "pl-10" : "pl-3"} ${props.rightAccessoryIcon ? "pr-10" : "pr-3"} text-white ${props.error ? "border-red-400" : "border-transparent"} `}
          aria-invalid={props.error ? "true" : "false"}
          aria-describedby={props.error ? errorId : undefined}
        />

        {props.rightAccessoryIcon && (
          <button
            type="button"
            className="absolute right-1 top-1 flex items-center rounded-lg border border-transparent p-2 text-secondary-4 outline-none focus:border-white"
            onClick={handleRightAccessoryAction}
            aria-label={props.rightAccessoryLabel}
            title={props.rightAccessoryLabel}
          >
            <props.rightAccessoryIcon size={16} />
          </button>
        )}
      </div>

      {props.error && (
        <p id={errorId} className="mt-1 text-xs text-red-400">
          {Array.isArray(props.error)
            ? props.error.map((e) => (
                <span className="block" key={e}>
                  {e}
                </span>
              ))
            : props.error}
        </p>
      )}
    </div>
  );
}
