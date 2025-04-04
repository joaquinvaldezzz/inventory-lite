import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import type { ExpensesRecordData } from "@/lib/types";
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header";

export const columns: Array<ColumnDef<ExpensesRecordData>> = [
  {
    accessorKey: "PurchaseID",
    header: ({ column }) => <DataTableColumnHeader title="Purchase ID" column={column} />,
  },
  {
    accessorKey: "PONo",
    header: ({ column }) => <DataTableColumnHeader title="REF no." column={column} />,
  },
  {
    accessorKey: "InvoiceDate",
    header: ({ column }) => <DataTableColumnHeader title="Date" column={column} />,
    cell: (cell) =>
      cell.row.original.InvoiceDate !== "0000-00-00"
        ? format(cell.row.original.InvoiceDate, "MMMM d, yyyy")
        : "",
  },
  {
    accessorKey: "SupplierID",
    header: ({ column }) => <DataTableColumnHeader title="Supplier" column={column} />,
  },
  {
    accessorKey: "Rate",
    header: ({ column }) => <DataTableColumnHeader title="Grand total" column={column} />,
  },
  // {
  //   accessorKey: "BranchID",
  //   header: ({ column }) => <DataTableColumnHeader title="Mode of payment" column={column} />,
  // },
  // {
  //   accessorKey: "branch_id",
  //   header: ({ column }) => <DataTableColumnHeader title="List of items" column={column} />,
  // },
];
