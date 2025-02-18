import Link from "next/link";

type Props = {
  label: string;
  className?: string;
} & (ButtonProps | LinkProps);

type ButtonProps = {
  type: "button" | "submit";
  loading?: boolean;
};

type LinkProps = {
  type: "link";
  href: string;
  target?: "_self" | "_blank";
};

export default function Button(props: Props) {
  const className = `${props.className} rounded-lg border border-transparent bg-primary-1 p-2 text-center text-secondary-1 outline-none hover:bg-primary-2 focus:border-white`;

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
    >
      {props.label}
    </button>
  );
}
