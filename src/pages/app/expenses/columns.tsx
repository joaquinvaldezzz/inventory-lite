import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import type { ExpensesTableData } from "@/lib/types/expenses";
import { formatAsCurrency } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header";

export const columns: Array<ColumnDef<ExpensesTableData>> = [
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
    accessorKey: "SupplierName",
    header: ({ column }) => <DataTableColumnHeader title="Supplier" column={column} />,
  },
  {
    accessorKey: "TotalDR",
    header: ({ column }) => <DataTableColumnHeader title="Grand total" column={column} />,
    cell: (cell) => (
      <div className="text-right tabular-nums">{formatAsCurrency(cell.row.original.TotalDR)}</div>
    ),
  },
  {
    accessorKey: "PaymentType",
    header: ({ column }) => <DataTableColumnHeader title="Mode of payment" column={column} />,
  },
];
