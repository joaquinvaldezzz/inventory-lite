import { cn } from "@/lib/utils";

/**
 * A functional React component that renders a skeleton placeholder. This component is typically
 * used to indicate loading states for UI elements.
 *
 * @param props The props for the component.
 * @param props.className Additional CSS classes to apply to the skeleton element.
 * @returns A `div` element styled as a skeleton placeholder.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
