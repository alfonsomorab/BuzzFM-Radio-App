import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("badge", `bg-${variant}`, className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: "active" | "suspended" | "paid" | "pending" | "overdue";
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, children, ...props }, ref) => {
    const badgeClasses = {
      active: "badge-active",
      suspended: "badge-suspended",
      paid: "badge-paid",
      pending: "badge-pending",
      overdue: "badge-overdue",
    };

    const labels = {
      active: "Active",
      suspended: "Suspended",
      paid: "Paid",
      pending: "Pending",
      overdue: "Overdue",
    };

    return (
      <span
        ref={ref}
        className={cn("badge", badgeClasses[status], className)}
        {...props}
      >
        {children || labels[status]}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";
