import React from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, ExclamationCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export type AlertType = "success" | "warning" | "error" | "info";

const typeStyles: Record<AlertType, string> = {
  success: "bg-green-100 border-green-300 text-green-900",
  warning: "bg-yellow-100 border-yellow-300 text-yellow-900",
  error: "bg-red-100 border-red-300 text-red-900",
  info: "bg-blue-100 border-blue-300 text-blue-900",
};

const typeIcons: Record<AlertType, React.ReactNode> = {
  success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
  error: <ExclamationCircleIcon className="h-6 w-6 text-red-500" />,
  info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
};

interface AlertProps {
  type: AlertType;
  message: string;
  className?: string;
  children?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ type, message, className = "", children }) => {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-sm ${typeStyles[type]} ${className}`}
      role="alert"
    >
      <span className="mt-0.5">{typeIcons[type]}</span>
      <div className="flex-1">
        <div className="font-semibold text-base leading-tight">{message}</div>
        {children && <div className="text-sm mt-1">{children}</div>}
      </div>
    </div>
  );
};

export default Alert;
