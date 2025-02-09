import IconCheckCircle from "./icons/IconCheckCircle";
import IconExclamationCircle from "./icons/IconExclamationCircle";
import IconICircle from "./icons/IconICircle";
import IconXCircle from "./icons/IconXCircle";

type AlertType = "success" | "error" | "warning" | "info";

export type Props = {
  type: AlertType;
  message: string;
};

export default function Alert(props: Props) {
  const alertStyles = {
    success: "border-primary-1 text-primary-1",
    error: "border-red-400 text-red-400",
    warning: "border-yellow-400 text-yellow-400",
    info: "border-blue-400 text-blue-400",
  };

  const icons = {
    success: <IconCheckCircle className="h-5 w-5" />,
    error: <IconXCircle className="h-5 w-5" />,
    warning: <IconExclamationCircle className="h-5 w-5" />,
    info: <IconICircle className="h-5 w-5" />,
  };

  return (
    <div
      className={`rounded-lg border p-4 ${alertStyles[props.type]}`}
      role="alert"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">{icons[props.type]}</div>
        <p className="whitespace-pre-line text-sm">{props.message}</p>
      </div>
    </div>
  );
}
