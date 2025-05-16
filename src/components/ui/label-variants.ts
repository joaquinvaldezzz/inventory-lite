import { cva } from "class-variance-authority";

export const labelVariants = cva(
  "inline-block text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);
