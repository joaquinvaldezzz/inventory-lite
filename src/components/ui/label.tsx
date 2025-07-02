import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import type { VariantProps } from "class-variance-authority";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

import { labelVariants } from "./label-variants";

const Label = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root className={cn(labelVariants(), className)} ref={ref} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
