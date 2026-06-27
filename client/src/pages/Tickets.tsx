import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import NavBar from "../components/NavBar";
import TicketsTable, {
  type Ticket,
  TicketStatus,
  TicketCategory,
  statusLabel,
  categoryLabel,
} from "@/components/TicketsTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const ALL = "ALL";

function Tickets() {
  const [status, setStatus] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const {
    data: tickets,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["tickets", status, category, sorting],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status !== ALL) params.set("status", status);
      if (category !== ALL) params.set("category", category);
      if (sorting.length > 0) {
        params.set("sortBy", sorting[0].id);
        params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
      }
      const qs = params.toString();
      return axios
        .get<{ tickets: Ticket[] }>(`/api/tickets${qs ? `?${qs}` : ""}`)
        .then((res) => res.data.tickets);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-24">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Tickets
        </h1>
        <p className="mt-2 text-muted-foreground">
          View and manage support tickets.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <span className="truncate">
                {status === ALL
                  ? "All statuses"
                  : statusLabel[status as TicketStatus]}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {Object.values(TicketStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48">
              <span className="truncate">
                {category === ALL
                  ? "All categories"
                  : categoryLabel[category as TicketCategory]}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {Object.values(TicketCategory).map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabel[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isError && (
          <p className="mt-8 text-sm text-destructive" role="alert">
            Failed to load tickets. Please try again later.
          </p>
        )}

        <TicketsTable
          tickets={tickets}
          isPending={isPending}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      </main>
    </div>
  );
}

export default Tickets;
