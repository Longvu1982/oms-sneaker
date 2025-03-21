import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    renderExtra?: (value: string | number) => React.ReactNode;
    wrapperClassname?: string;
  }
>(({ className, type, wrapperClassname, renderExtra, ...props }, ref) => {
  return (
    <div className={cn("relative", wrapperClassname)}>
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
        value={String(props.value)}
        onChange={(e) => {
          if (type === "number") {
            props.onChange?.(
              !isNaN(parseFloat(e.target.value))
                ? (parseFloat(e.target.value) as A)
                : ""
            );
          } else {
            props.onChange?.(e);
          }
        }}
      />
      {renderExtra && (
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 bg-accent rounded-sm flex items-center",
            props.value != null &&
              props.value !== "" &&
              !isNaN(props.value as number) &&
              "px-2"
          )}
        >
          {renderExtra(props.value as string | number)}
        </div>
      )}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
