import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TicketDetail } from "@/lib/ticket-constants";

interface TicketMessageProps {
  ticket: TicketDetail;
}

function TicketMessage({ ticket }: TicketMessageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {ticket.customerName}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            &lt;{ticket.customerEmail}&gt;
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {new Date(ticket.createdAt).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {ticket.body}
        </p>
      </CardContent>
    </Card>
  );
}

export default TicketMessage;
