import { cn } from "@/lib/utils";

export default function Badge({ children, variant = "default", className, ...props }) {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-border dark:text-text-main",
    primary: "bg-primary-light text-primary",
    success: "bg-success-light text-success",
    danger: "bg-danger-light text-danger",
    warning: "bg-warning-light text-warning",
    outline: "text-text-main border border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
