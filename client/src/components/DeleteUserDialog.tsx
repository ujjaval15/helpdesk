import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertError } from "@/components/ui/alert-error";
import { Button } from "@/components/ui/button";
import type { User } from "@/components/UsersTable";

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteUserDialog({ user, open, onOpenChange }: DeleteUserDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => axios.delete(`/api/admin/users/${user!.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      onOpenChange(false);
    },
  });

  const serverError =
    mutation.error && axios.isAxiosError(mutation.error)
      ? mutation.error.response?.data?.error
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogPopup>
        <DialogTitle>Delete User</DialogTitle>
        <DialogDescription className="mt-1">
          Are you sure you want to delete <strong>{user?.name}</strong>? This
          action can be undone by an administrator.
        </DialogDescription>

        {serverError && (
          <AlertError message={serverError} className="mt-4 font-medium" />
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}

export default DeleteUserDialog;
