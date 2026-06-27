import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import NavBar from "../components/NavBar";
import TicketsTable, { type Ticket } from "@/components/TicketsTable";

function Tickets() {
  const {
    data: tickets,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["tickets"],
    queryFn: () =>
      axios
        .get<{ tickets: Ticket[] }>("/api/tickets")
        .then((res) => res.data.tickets),
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

        {isError && (
          <p className="mt-8 text-sm text-destructive" role="alert">
            Failed to load tickets. Please try again later.
          </p>
        )}

        <TicketsTable tickets={tickets} isPending={isPending} />
      </main>
    </div>
  );
}

export default Tickets;
