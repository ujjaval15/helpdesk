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

export interface Ticket {
  id: number;
  subject: string;
  status: "OPEN" | "RESOLVED" | "CLOSED";
  category: "GENERAL_QUESTION" | "TECHNICAL_QUESTION" | "REFUND_REQUEST" | null;
  customerEmail: string;
  customerName: string;
  assignedAgentId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketsTableProps {
  tickets: Ticket[] | undefined;
  isPending: boolean;
}

const statusVariant: Record<Ticket["status"], "destructive" | "default" | "secondary"> = {
  OPEN: "destructive",
  RESOLVED: "default",
  CLOSED: "secondary",
};

const categoryLabel: Record<NonNullable<Ticket["category"]>, string> = {
  GENERAL_QUESTION: "General",
  TECHNICAL_QUESTION: "Technical",
  REFUND_REQUEST: "Refund",
};

function TicketsTable({ tickets, isPending }: TicketsTableProps) {
  return (
    <Table className="mt-8">
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isPending
          ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              </TableRow>
            ))
          : tickets?.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono text-muted-foreground">
                  {ticket.id}
                </TableCell>
                <TableCell className="font-medium">{ticket.subject}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{ticket.customerName}</span>
                    <span className="text-xs text-muted-foreground">
                      {ticket.customerEmail}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[ticket.status]}>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ticket.category ? (
                    <Badge variant="outline">
                      {categoryLabel[ticket.category]}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">&mdash;</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}

export default TicketsTable;
