import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Reply,
  senderTypeLabel,
  senderTypeVariant,
} from "@/lib/ticket-constants";

interface ReplyThreadProps {
  replies: Reply[] | undefined;
  isPending: boolean;
}

function ReplyThread({ replies, isPending }: ReplyThreadProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Replies</h2>

      {isPending && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {replies && replies.length === 0 && (
        <p className="text-sm text-muted-foreground">No replies yet.</p>
      )}

      {replies?.map((reply) => (
        <Card key={reply.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">{reply.senderName}</CardTitle>
              <Badge
                variant={senderTypeVariant[reply.senderType]}
                className="text-xs"
              >
                {senderTypeLabel[reply.senderType]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(reply.createdAt).toLocaleString()}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {reply.body}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ReplyThread;
