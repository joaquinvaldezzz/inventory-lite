import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SelectPropsNative extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const SelectNative = React.forwardRef<HTMLSelectElement, SelectPropsNative>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "peer inline-flex w-full cursor-pointer appearance-none items-center rounded-lg border border-input bg-background text-sm text-foreground shadow-xs shadow-black/5 transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 has-[option[disabled]:checked]:text-muted-foreground",
            props.multiple != null
              ? "py-1 *:px-3 *:py-1 [&_option:checked]:bg-accent"
              : "h-9 ps-3 pe-8",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {props.multiple != null && (
          <span className="pointer-events-none absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center text-muted-foreground/80 peer-disabled:opacity-50">
            <ChevronDown aria-hidden="true" strokeWidth={2} size={16} />
          </span>
        )}
      </div>
    );
  },
);
SelectNative.displayName = "SelectNative";

export { SelectNative };
