type ButtonProps = {
  type: "button" | "submit";
  label: string;
};

export default function Button(props: ButtonProps) {
  return (
    <button
      type={props.type}
      className="text-secondary-1 hover:bg-primary-2 bg-primary-1 rounded-lg border border-transparent p-2 outline-none focus:border-white"
    >
      {props.label}
    </button>
  );
}
