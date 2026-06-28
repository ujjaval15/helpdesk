import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import NavBar from "../components/NavBar";
import { useSession } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  TicketStatus,
  TicketCategory,
  type TicketStatus as TicketStatusType,
  type TicketCategory as TicketCategoryType,
  statusLabel,
  categoryLabel,
} from "@/components/TicketsTable";

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TicketDetail {
  id: number;
  subject: string;
  body: string;
  status: TicketStatusType;
  category: TicketCategoryType | null;
  customerEmail: string;
  customerName: string;
  assignedAgent: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

const NONE = "NONE";

const statusVariant: Record<
  TicketStatusType,
  "destructive" | "default" | "secondary"
> = {
  OPEN: "destructive",
  RESOLVED: "default",
  CLOSED: "secondary",
};

const UNASSIGNED = "UNASSIGNED";

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

  const handleAssign = (value: string) => {
    updateMutation.mutate({ assignedAgentId: value === UNASSIGNED ? null : value });
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {data.customerName}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        &lt;{data.customerEmail}&gt;
                      </span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(data.createdAt).toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {data.body}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <Select
                    value={data.status}
                    onValueChange={handleStatusChange}
                    disabled={updateMutation.isPending}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <span className="truncate">
                        {statusLabel[data.status]}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TicketStatus).map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusLabel[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <span className="text-muted-foreground">Category</span>
                  <Select
                    value={data.category ?? NONE}
                    onValueChange={handleCategoryChange}
                    disabled={updateMutation.isPending}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <span className="truncate">
                        {data.category
                          ? categoryLabel[data.category]
                          : "None"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
                      {Object.values(TicketCategory).map((c) => (
                        <SelectItem key={c} value={c}>
                          {categoryLabel[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <span className="text-muted-foreground">Assigned To</span>
                  {isAdmin ? (
                    <Select
                      value={data.assignedAgent?.id ?? UNASSIGNED}
                      onValueChange={handleAssign}
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <span className="truncate">
                          {data.assignedAgent
                            ? data.assignedAgent.name
                            : "Unassigned"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                        {agents?.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} ({agent.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 font-medium">
                      {data.assignedAgent
                        ? `${data.assignedAgent.name} (${data.assignedAgent.email})`
                        : "Unassigned"}
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated</span>
                  <p className="mt-1 font-medium">
                    {new Date(data.updatedAt).toLocaleString()}
                  </p>
                </div>
                {updateMutation.isError && (
                  <p className="text-sm text-destructive" role="alert">
                    Failed to update ticket.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TicketDetailPage;
