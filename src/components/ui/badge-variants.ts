import { cva } from "class-variance-authority";

/**
 * Variants for the Badge component.
 *
 * @returns The variants for the Badge component.
 */
export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "bg-green-50 text-green-700 ring-green-600/20",
        warning: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
        light: "bg-gray-50 text-gray-600 ring-gray-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
