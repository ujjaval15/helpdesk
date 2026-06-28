import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import NavBar from "../components/NavBar";
import { useSession } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TicketMessage from "@/components/ticket-detail/TicketMessage";
import TicketSidebar from "@/components/ticket-detail/TicketSidebar";
import ReplyThread from "@/components/ticket-detail/ReplyThread";
import ReplyForm from "@/components/ticket-detail/ReplyForm";
import {
  type Agent,
  type TicketDetail,
  type Reply,
  statusLabel,
  categoryLabel,
  statusVariant,
  NONE,
  UNASSIGNED,
} from "@/lib/ticket-constants";

function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isAdmin = session?.user?.role === "admin";

  const { data, isPending, isError } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () =>
      axios
        .get<{ ticket: TicketDetail }>(`/api/tickets/${id}`)
        .then((res) => res.data.ticket),
  });

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: () =>
      axios
        .get<{ users: Agent[] }>("/api/admin/users")
        .then((res) => res.data.users),
    enabled: isAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      axios
        .patch<{ ticket: TicketDetail }>(`/api/tickets/${id}`, body)
        .then((res) => res.data.ticket),
    onSuccess: (updated) => {
      queryClient.setQueryData(["ticket", id], updated);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const { data: replies, isPending: repliesPending } = useQuery({
    queryKey: ["ticket", id, "replies"],
    queryFn: () =>
      axios
        .get<{ replies: Reply[] }>(`/api/tickets/${id}/replies`)
        .then((res) => res.data.replies),
    enabled: !!data,
  });

  const handleAssign = (value: string) => {
    updateMutation.mutate({
      assignedAgentId: value === UNASSIGNED ? null : value,
    });
  };

  const handleStatusChange = (value: string) => {
    updateMutation.mutate({ status: value });
  };

  const handleCategoryChange = (value: string) => {
    updateMutation.mutate({ category: value === NONE ? null : value });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-24">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to tickets
        </Link>

        {isPending && (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-6 h-40 w-full" />
          </div>
        )}

        {isError && (
          <p className="mt-6 text-sm text-destructive" role="alert">
            Failed to load ticket. It may not exist or you don't have access.
          </p>
        )}

        {data && (
          <div className="mt-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {data.subject}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={statusVariant[data.status]}>
                  {statusLabel[data.status]}
                </Badge>
                {data.category && (
                  <Badge variant="outline">
                    {categoryLabel[data.category]}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  #{data.id}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <TicketMessage ticket={data} />

                <ReplyThread replies={replies} isPending={repliesPending} />

                <ReplyForm ticketId={id!} />
              </div>

              <TicketSidebar
                ticket={data}
                isAdmin={isAdmin}
                agents={agents}
                onStatusChange={handleStatusChange}
                onCategoryChange={handleCategoryChange}
                onAssign={handleAssign}
                isPending={updateMutation.isPending}
                isError={updateMutation.isError}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TicketDetailPage;
