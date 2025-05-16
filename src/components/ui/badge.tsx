import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { badgeVariants } from "./badge-variants";

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge component that renders a span element with dynamic class names.
 *
 * @param props The properties passed to the Badge component.
 * @param props.className Additional class names to apply to the badge.
 * @param props.variant The variant of the badge which determines its styling.
 * @returns The rendered Badge component.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
