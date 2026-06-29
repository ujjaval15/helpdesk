import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Sparkles } from "lucide-react";
import { AlertError } from "@/components/ui/alert-error";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Textarea } from "@/components/ui/textarea";
import { replySchema, type ReplyFormData, type Reply } from "@/lib/ticket-constants";

interface ReplyFormProps {
  ticketId: string;
  ticketBody: string;
}

function ReplyForm({ ticketId, ticketBody }: ReplyFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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

  const polishMutation = useMutation({
    mutationFn: (draft: string) =>
      axios
        .post<{ polished: string }>(`/api/tickets/${ticketId}/polish-reply`, {
          draft,
          ticketBody,
        })
        .then((res) => res.data.polished),
    onSuccess: (polished) => {
      setValue("body", polished);
    },
  });

  const onSubmit = (formData: ReplyFormData) => {
    replyMutation.mutate(formData);
  };

  const draft = watch("body");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <Textarea
        placeholder="Write a reply..."
        {...register("body")}
        aria-invalid={!!errors.body}
        rows={4}
      />
      <ErrorMessage error={errors.body} />
      {replyMutation.isError && (
        <AlertError message="Failed to send reply." />
      )}
      {polishMutation.isError && (
        <AlertError message="Failed to polish reply." />
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!draft?.trim() || polishMutation.isPending}
          onClick={() => polishMutation.mutate(draft)}
        >
          <Sparkles className="mr-2 size-4" />
          {polishMutation.isPending ? "Polishing..." : "Polish"}
        </Button>
        <Button type="submit" disabled={!draft?.trim() || replyMutation.isPending} size="sm">
          <Send className="mr-2 size-4" />
          {replyMutation.isPending ? "Sending..." : "Send Reply"}
        </Button>
      </div>
    </form>
  );
}

export default ReplyForm;
