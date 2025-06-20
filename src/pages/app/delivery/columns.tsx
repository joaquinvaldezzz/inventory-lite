import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import { formatDate } from "date-fns";

import type { DeliveryRecordData } from "@/lib/types/delivery";
import { formatAsCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header";

const multiColumnFilterFn: FilterFn<DeliveryRecordData> = (row, _columnId, filterValue: string) => {
  const searchableRowContent = `${row.original.dr_no} ${row.original.po_no}`.toLowerCase();
  const searchTerm = filterValue.toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

export const columns: Array<ColumnDef<DeliveryRecordData>> = [
  {
    accessorKey: "dr_no",
    header: ({ column }) => <DataTableColumnHeader title="DR no." column={column} />,
    filterFn: multiColumnFilterFn,
  },
  {
    accessorKey: "po_no",
    header: ({ column }) => <DataTableColumnHeader title="PO no." column={column} />,
  },
  {
    accessorKey: "date_delivered",
    header: ({ column }) => <DataTableColumnHeader title="Date delivered" column={column} />,
    cell: (cell) =>
      cell.row.original.date_delivered !== "0000-00-00"
        ? formatDate(cell.row.original.date_delivered, "MMMM d, yyyy")
        : "",
  },
  {
    accessorKey: "branch",
    header: ({ column }) => <DataTableColumnHeader title="Branch" column={column} />,
  },
  {
    accessorKey: "supplier_name",
    header: ({ column }) => <DataTableColumnHeader title="Supplier" column={column} />,
    cell: (cell) => <div className="max-w-40 truncate">{cell.row.original.supplier_name}</div>,
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => <DataTableColumnHeader title="Total amount" column={column} />,
    cell: (cell) => (
      <div className="text-right tabular-nums">
        {formatAsCurrency(cell.row.original.total_amount)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader title="Status" column={column} />,
    cell: (cell) => {
      const status = cell.row.original.status;

      if (status === "Requested") {
        return <Badge variant="light">{status}</Badge>;
      } else if (status === "Ordered") {
        return <Badge variant="warning">{status}</Badge>;
      }

      return <Badge variant="success">{status}</Badge>;
    },
  },
];
