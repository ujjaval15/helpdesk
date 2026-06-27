import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const TicketStatus = {
  OPEN: "OPEN",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketCategory = {
  GENERAL_QUESTION: "GENERAL_QUESTION",
  TECHNICAL_QUESTION: "TECHNICAL_QUESTION",
  REFUND_REQUEST: "REFUND_REQUEST",
} as const;

export type TicketCategory =
  (typeof TicketCategory)[keyof typeof TicketCategory];

export const statusLabel: Record<TicketStatus, string> = {
  OPEN: "Open",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const categoryLabel: Record<TicketCategory, string> = {
  GENERAL_QUESTION: "General",
  TECHNICAL_QUESTION: "Technical",
  REFUND_REQUEST: "Refund",
};

const statusVariant: Record<
  TicketStatus,
  "destructive" | "default" | "secondary"
> = {
  OPEN: "destructive",
  RESOLVED: "default",
  CLOSED: "secondary",
};

export interface Ticket {
  id: number;
  subject: string;
  status: TicketStatus;
  category: TicketCategory | null;
  customerEmail: string;
  customerName: string;
  assignedAgentId: string | null;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 64,
    cell: ({ getValue }) => (
      <span className="font-mono text-muted-foreground">
        {getValue<number>()}
      </span>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm">{row.original.customerName}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.customerEmail}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<TicketStatus>();
      return <Badge variant={statusVariant[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue }) => {
      const cat = getValue<TicketCategory | null>();
      return cat ? (
        <Badge variant="outline">{categoryLabel[cat]}</Badge>
      ) : (
        <span className="text-muted-foreground">&mdash;</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
  },
];

interface TicketsTableProps {
  tickets: Ticket[] | undefined;
  isPending: boolean;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

function SortIcon({ column }: { column: string }) {
  return (
    <ArrowUpDown className="ml-1 inline size-3.5 text-muted-foreground" />
  );
}

function TicketsTable({
  tickets,
  isPending,
  sorting,
  onSortingChange,
}: TicketsTableProps) {
  const table = useReactTable({
    data: tickets ?? [],
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  return (
    <Table className="mt-8">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={
                  header.column.getCanSort()
                    ? "cursor-pointer select-none"
                    : ""
                }
                style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                onClick={header.column.getToggleSortingHandler()}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
                {header.column.getCanSort() &&
                  (header.column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-1 inline size-3.5" />
                  ) : header.column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-1 inline size-3.5" />
                  ) : (
                    <SortIcon column={header.id} />
                  ))}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isPending
          ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : table.getRowModel().rows.length === 0
            ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No tickets found.
                  </TableCell>
                </TableRow>
              )
            : table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
      </TableBody>
    </Table>
  );
}

export default TicketsTable;
