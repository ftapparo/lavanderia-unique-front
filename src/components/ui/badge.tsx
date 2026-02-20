import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        info:
          "border-[var(--color-status-info-soft-border)] bg-[var(--color-status-info-soft)] text-[var(--color-status-info-soft-foreground)]",
        success:
          "border-[var(--color-status-success-soft-border)] bg-[var(--color-status-success-soft)] text-[var(--color-status-success-soft-foreground)]",
        warning:
          "border-[var(--color-status-warning-soft-border)] bg-[var(--color-status-warning-soft)] text-[var(--color-status-warning-soft-foreground)]",
        error:
          "border-[var(--color-status-danger-soft-border)] bg-[var(--color-status-danger-soft)] text-[var(--color-status-danger-soft-foreground)]",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
