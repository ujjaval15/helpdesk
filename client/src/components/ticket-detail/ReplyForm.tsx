import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { replySchema, type ReplyFormData, type Reply } from "@/lib/ticket-constants";

interface ReplyFormProps {
  ticketId: string;
}

function ReplyForm({ ticketId }: ReplyFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
  });

  const replyMutation = useMutation({
    mutationFn: (body: ReplyFormData) =>
      axios
        .post<{ reply: Reply }>(`/api/tickets/${ticketId}/replies`, body)
        .then((res) => res.data.reply),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", ticketId, "replies"],
      });
      reset();
    },
  });

  const onSubmit = (formData: ReplyFormData) => {
    replyMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <Textarea
        placeholder="Write a reply..."
        {...register("body")}
        aria-invalid={!!errors.body}
        rows={4}
      />
      {errors.body && (
        <p className="text-sm text-destructive">{errors.body.message}</p>
      )}
      {replyMutation.isError && (
        <p className="text-sm text-destructive" role="alert">
          Failed to send reply.
        </p>
      )}
      <Button type="submit" disabled={replyMutation.isPending} size="sm">
        <Send className="mr-2 size-4" />
        {replyMutation.isPending ? "Sending..." : "Send Reply"}
      </Button>
    </form>
  );
}

export default ReplyForm;
