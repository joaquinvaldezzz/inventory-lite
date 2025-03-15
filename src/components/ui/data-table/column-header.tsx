import type { HTMLAttributes } from "react";
import type { Column } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

/**
 * A component that renders a column header for a data table.
 *
 * @template TData The type of data in the table.
 * @template TValue The type of value in the column.
 * @param props The properties for the column header.
 * @param props.column The column object which contains sorting information and methods.
 * @param props.title The title of the column header.
 * @param props.className Optional additional class names for styling.
 * @returns The rendered column header component.
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <Button
      className={cn("-mx-3", className)}
      variant="ghost"
      onClick={() => {
        column.toggleSorting(column.getIsSorted() === "asc");
      }}
    >
      {title}
      <ChevronsUpDown className="size-4" />
    </Button>
  );
}
