import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

const DivTable = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="-mx-4 grid grid-cols-1 border-t whitespace-nowrap">
      <div className="w-full overflow-x-auto">
        <div
          className={cn("table w-full caption-bottom text-sm", className)}
          role="table"
          ref={ref}
          {...props}
        />
      </div>
    </div>
  ),
);
DivTable.displayName = "Table";

const DivTableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("table-header-group", className)} role="thead" ref={ref} {...props} />
  ),
);
DivTableHeader.displayName = "TableHeader";

const DivTableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("table-row-group", className)} role="tbody" ref={ref} {...props} />
  ),
);
DivTableBody.displayName = "TableBody";

const DivTableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      className={cn(
        "border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
DivTableFooter.displayName = "TableFooter";

const DivTableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        "table-row border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      role="tr"
      ref={ref}
      {...props}
    />
  ),
);
DivTableRow.displayName = "TableRow";

const DivTableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        "table-cell h-12 p-2 text-left align-middle font-medium text-muted-foreground first:pl-4 last:pr-4 [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0",
        className,
      )}
      role="th"
      ref={ref}
      {...props}
    />
  ),
);
DivTableHead.displayName = "TableHead";

const DivTableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        "relative table-cell h-12 p-1 align-middle first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
        className,
      )}
      role="td"
      ref={ref}
      {...props}
    />
  ),
);
DivTableCell.displayName = "TableCell";

const DivTableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption className={cn("mt-4 text-sm text-muted-foreground", className)} ref={ref} {...props} />
));
DivTableCaption.displayName = "TableCaption";

export {
  DivTable,
  DivTableBody,
  DivTableCaption,
  DivTableCell,
  DivTableFooter,
  DivTableHead,
  DivTableHeader,
  DivTableRow,
};
