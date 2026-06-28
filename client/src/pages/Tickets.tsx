import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import NavBar from "../components/NavBar";
import { AlertError } from "@/components/ui/alert-error";
import TicketsTable from "@/components/TicketsTable";
import {
  type Ticket,
  type Pagination,
  TicketStatus,
  TicketCategory,
  statusLabel,
  categoryLabel,
} from "@/lib/ticket-constants";
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
  const [page, setPage] = useState(1);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleSortingChange: typeof setSorting = (updater) => {
    setSorting(updater);
    setPage(1);
  };

  const { data, isPending, isError } = useQuery({
    queryKey: ["tickets", status, category, sorting, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status !== ALL) params.set("status", status);
      if (category !== ALL) params.set("category", category);
      if (sorting.length > 0) {
        params.set("sortBy", sorting[0].id);
        params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
      }
      params.set("page", String(page));
      return axios
        .get<{ tickets: Ticket[]; pagination: Pagination }>(
          `/api/tickets?${params.toString()}`,
        )
        .then((res) => res.data);
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
          <Select value={status} onValueChange={handleStatusChange}>
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

          <Select value={category} onValueChange={handleCategoryChange}>
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
          <AlertError message="Failed to load tickets. Please try again later." className="mt-8" />
        )}

        <TicketsTable
          tickets={data?.tickets}
          isPending={isPending}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          pagination={data?.pagination}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}

export default Tickets;
