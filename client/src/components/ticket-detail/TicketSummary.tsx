import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { AlertError } from "@/components/ui/alert-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TicketSummaryProps {
  ticketId: string;
}

function TicketSummary({ ticketId }: TicketSummaryProps) {
  const summarizeMutation = useMutation({
    mutationFn: () =>
      axios
        .post<{ summary: string }>(`/api/tickets/${ticketId}/summarize`)
        .then((res) => res.data.summary),
  });

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={summarizeMutation.isPending}
        onClick={() => summarizeMutation.mutate()}
      >
        <Sparkles className="mr-2 size-4" />
        {summarizeMutation.isPending ? "Summarizing..." : "Summarize"}
      </Button>

      {summarizeMutation.isError && (
        <AlertError message="Failed to generate summary." />
      )}

      {summarizeMutation.data && (
        <Card className="border-dashed">
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {summarizeMutation.data}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TicketSummary;
