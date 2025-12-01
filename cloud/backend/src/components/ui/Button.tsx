import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "outline-primary" | "outline-secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, fullWidth = false, children, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "btn-sm",
      md: "",
      lg: "btn-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "btn",
          `btn-${variant}`,
          sizeClasses[size],
          fullWidth && "w-100",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
