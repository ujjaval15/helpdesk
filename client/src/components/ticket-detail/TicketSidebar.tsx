import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  type Agent,
  type TicketDetail,
  TicketStatus,
  TicketCategory,
  statusLabel,
  categoryLabel,
  NONE,
  UNASSIGNED,
} from "@/lib/ticket-constants";

interface TicketSidebarProps {
  ticket: TicketDetail;
  isAdmin: boolean;
  agents: Agent[] | undefined;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAssign: (value: string) => void;
  isPending: boolean;
  isError: boolean;
}

function TicketSidebar({
  ticket,
  isAdmin,
  agents,
  onStatusChange,
  onCategoryChange,
  onAssign,
  isPending,
  isError,
}: TicketSidebarProps) {
  return (
    <div className="space-y-5 text-sm">
      <div>
        <span className="text-muted-foreground">Status</span>
        <Select
          value={ticket.status}
          onValueChange={onStatusChange}
          disabled={isPending}
        >
          <SelectTrigger className="mt-1 w-full">
            <span className="truncate">{statusLabel[ticket.status]}</span>
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
          value={ticket.category ?? NONE}
          onValueChange={onCategoryChange}
          disabled={isPending}
        >
          <SelectTrigger className="mt-1 w-full">
            <span className="truncate">
              {ticket.category ? categoryLabel[ticket.category] : "None"}
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
            value={ticket.assignedAgent?.id ?? UNASSIGNED}
            onValueChange={onAssign}
            disabled={isPending}
          >
            <SelectTrigger className="mt-1 w-full">
              <span className="truncate">
                {ticket.assignedAgent
                  ? ticket.assignedAgent.name
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
            {ticket.assignedAgent
              ? `${ticket.assignedAgent.name} (${ticket.assignedAgent.email})`
              : "Unassigned"}
          </p>
        )}
      </div>
      <div>
        <span className="text-muted-foreground">Last Updated</span>
        <p className="mt-1 font-medium">
          {new Date(ticket.updatedAt).toLocaleString()}
        </p>
      </div>
      {isError && (
        <p className="text-sm text-destructive" role="alert">
          Failed to update ticket.
        </p>
      )}
    </div>
  );
}

export default TicketSidebar;
