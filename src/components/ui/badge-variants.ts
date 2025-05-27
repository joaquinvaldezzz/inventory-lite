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
        outline: "text-foreground dark:text-foreground",
        success:
          "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950 dark:text-green-300 dark:ring-green-400/20",
        warning:
          "bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-950 dark:text-yellow-300 dark:ring-yellow-400/20",
        light:
          "bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-gray-950 dark:text-gray-300 dark:ring-gray-400/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
