import { forwardRef, type ComponentProps } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";

const Pagination = ({ className, ...props }: ComponentProps<"nav">) => (
  <nav
    className={cn("mx-auto flex w-full justify-end", className)}
    {...props}
    role="navigation"
    aria-label="pagination"
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = forwardRef<HTMLUListElement, ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul className={cn("flex items-center gap-1", className)} ref={ref} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = forwardRef<HTMLLIElement, ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li className={cn(className)} ref={ref} {...props} />,
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
  isDisabled?: boolean;
} & Pick<ButtonProps, "size"> &
  ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a
    className={cn(
      buttonVariants({
        variant: (isActive ?? false) ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    aria-current={isActive ?? "page"}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({ className, ...props }: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    className={cn("gap-1 pl-2.5", className)}
    aria-label="Go to previous page"
    size="default"
    {...props}
  >
    <ChevronLeft strokeWidth={2} size={16} />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    className={cn("gap-1 pr-2.5", className)}
    aria-label="Go to next page"
    size="default"
    {...props}
  >
    <span>Next</span>
    <ChevronRight strokeWidth={2} size={16} />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }: ComponentProps<"span">) => (
  <span className={cn("flex size-9 items-center justify-center", className)} aria-hidden {...props}>
    <MoreHorizontal strokeWidth={2} size={16} />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
