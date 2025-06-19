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
          <div className="text-secondary-4 pointer-events-none absolute left-0 top-0 flex h-full items-center pl-3">
            <props.icon size={16} />
          </div>
        ) : null}

        <input
          ref={elRef}
          id={id}
          type={props.type}
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          className={`bg-secondary-3 placeholder-secondary-4 w-full rounded-lg border border-transparent py-2 outline-none ${props.icon ? "pl-10" : "pl-3"} ${props.rightAccessoryIcon ? "pr-10" : "pr-3"} text-white focus:border-white`}
        />

        {props.rightAccessoryIcon ? (
          <button
            type="button"
            className="text-secondary-4 absolute right-1 top-1 flex items-center rounded-lg border border-transparent p-2 outline-none focus:border-white"
            onClick={handleRightAccessoryAction}
            aria-label={props.rightAccessoryLabel}
            title={props.rightAccessoryLabel}
          >
            <props.rightAccessoryIcon size={16} />
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
