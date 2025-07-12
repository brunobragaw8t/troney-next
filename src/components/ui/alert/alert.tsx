import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  const alertConfig = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-transparent",
      borderColor: "border-primary-1",
      textColor: "text-primary-1",
      iconColor: "text-primary-1",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-transparent",
      borderColor: "border-red-500",
      textColor: "text-red-300",
      iconColor: "text-red-400",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-transparent",
      borderColor: "border-yellow-500",
      textColor: "text-yellow-300",
      iconColor: "text-yellow-400",
    },
    info: {
      icon: Info,
      bgColor: "bg-transparent",
      borderColor: "border-blue-500",
      textColor: "text-blue-300",
      iconColor: "text-blue-400",
    },
  };

  const config = alertConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}
    >
      <IconComponent className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />

      <p className={`text-sm font-medium ${config.textColor}`}>{message}</p>
    </div>
  );
}
