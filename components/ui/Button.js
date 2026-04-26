import { cn } from "@/lib/utils";

export default function Button({ 
  children, 
  variant = "primary", 
  size = "md",
  className,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-700",
    secondary: "bg-surface text-text-main border border-border hover:bg-gray-50",
    danger: "bg-danger text-white hover:bg-red-700",
    ghost: "hover:bg-gray-100 text-text-main",
    outline: "border border-border bg-transparent hover:bg-gray-50 text-text-main",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 py-2 text-sm",
    lg: "h-10 px-8 text-base",
    icon: "h-9 w-9",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}