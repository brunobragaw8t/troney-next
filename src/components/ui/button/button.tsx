import { cn } from "@/lib/utils";
import Link from "next/link";

type Variant = "primary" | "outline";

type Props = {
  label: string;
  variant?: Variant;
} & (ButtonProps | LinkProps);

type ButtonProps = {
  type: "button" | "submit";
  onClick?: () => void;
  loading?: boolean;
};

type LinkProps = {
  type: "link";
  href: string;
  target?: "_self" | "_blank";
};

export function Button(props: Props) {
  const defaultStyles =
    "inline-block rounded-lg border px-4 py-2 text-center outline-none focus:border-white";

  const { variant = "primary" } = props;

  const variantStyles: Record<Variant, string> = {
    primary:
      "border-transparent bg-primary-1 text-secondary-1 hover:bg-primary-2",
    outline:
      "border-primary-1 bg-transparent text-primary-1 hover:border-primary-2 hover:text-primary-2",
  };

  const className = cn(defaultStyles, variantStyles[variant]);

  if (props.type === "link") {
    return (
      <Link href={props.href} target={props.target} className={className}>
        {props.label}
      </Link>
    );
  }

  return (
    <button
      type={props.type}
      onClick={props.onClick}
      disabled={props.loading}
      className={cn(className, { "cursor-wait opacity-50": props.loading })}
    >
      {props.label}
    </button>
  );
}
