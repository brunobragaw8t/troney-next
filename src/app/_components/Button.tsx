import Link from "next/link";

type Props = {
  label: string;
  className?: string;
  variant?: "primary" | "outline";
} & (ButtonProps | LinkProps);

type ButtonProps = {
  type: "button" | "submit";
  callback?: () => void;
  loading?: boolean;
};

type LinkProps = {
  type: "link";
  href: string;
  target?: "_self" | "_blank";
};

export default function Button(props: Props) {
  let className = `${props.className || ""} rounded-lg border p-2 text-center outline-none focus:border-white `;

  switch (props.variant) {
    case "outline":
      className +=
        "border-primary-1 bg-transparent text-primary-1 hover:border-primary-2 hover:text-primary-2";
      break;

    default:
      className +=
        "border-transparent bg-primary-1 text-secondary-1 hover:bg-primary-2";
  }

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
      disabled={props.loading}
      className={`${className} ${props.loading ? "cursor-wait opacity-50" : ""}`}
      onClick={props.callback}
    >
      {props.label}
    </button>
  );
}
