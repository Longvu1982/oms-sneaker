import * as React from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const spinnerVariants = cva("text-muted-foreground animate-spin", {
  variants: {
    size: {
      default: "h-4 w-4",
      sm: "h-2 w-2",
      lg: "h-6 w-6",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const overlayVariants = cva(
  "fixed inset-0 z-[1000] flex items-center justify-center bg-background/50",
  {
    variants: {
      fullPage: {
        true: "fixed",
        false: "absolute",
      },
    },
    defaultVariants: {
      fullPage: true,
    },
  }
);

export interface FullPageSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants>,
    VariantProps<typeof overlayVariants> {
  fullPage?: boolean;
}

const Spinner = React.forwardRef<HTMLDivElement, FullPageSpinnerProps>(
  ({ className, size, fullPage, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(overlayVariants({ fullPage }), className)}
        {...props}
      >
        <Loader2 className={cn(spinnerVariants({ size }))} />
      </div>
    );
  }
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
