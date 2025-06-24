import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import type { WasteTableData } from "@/lib/types/wastes";
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header";

export const columns: Array<ColumnDef<WasteTableData>> = [
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader title="Date" column={column} />,
    cell: (cell) =>
      cell.row.original.date !== "0000-00-00" ? format(cell.row.original.date, "MMMM d, yyyy") : "",
  },
  {
    accessorKey: "branch",
    header: ({ column }) => <DataTableColumnHeader title="Branch name" column={column} />,
  },
  {
    accessorKey: "raw_material_type",
    header: ({ column }) => <DataTableColumnHeader title="Category" column={column} />,
  },
];
