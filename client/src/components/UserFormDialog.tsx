import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/ui/error-message";
import type { User } from "@/components/UsersTable";

const userFormSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().trim(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  user?: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UserFormDialog({ user, open, onOpenChange }: UserFormDialogProps) {
  const isEdit = !!user;
  const queryClient = useQueryClient();

  const passwordSchema = isEdit
    ? userFormSchema.extend({
        password: z
          .string()
          .trim()
          .min(8, "Password must be at least 8 characters")
          .or(z.literal("")),
      })
    : userFormSchema.extend({
        password: z
          .string()
          .trim()
          .min(8, "Password must be at least 8 characters"),
      });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: UserFormData) => {
      if (isEdit) {
        return axios.patch(`/api/admin/users/${user.id}`, {
          name: data.name,
          email: data.email,
          ...(data.password ? { password: data.password } : {}),
        });
      }
      return axios.post("/api/admin/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: user?.name ?? "",
        email: user?.email ?? "",
        password: "",
      });
      mutation.reset();
    }
  }, [open, user]);

  const serverError =
    mutation.error && axios.isAxiosError(mutation.error)
      ? mutation.error.response?.data?.error
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogPopup>
        <DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
        <DialogDescription className="mt-1">
          {isEdit
            ? "Update user details. Leave password blank to keep it unchanged."
            : "Add a new agent to the team."}
        </DialogDescription>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="mt-6 space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <ErrorMessage error={errors.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <ErrorMessage error={errors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              placeholder={isEdit ? "Leave blank to keep unchanged" : undefined}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <ErrorMessage error={errors.password} />
          </div>

          {serverError && (
            <p className="text-sm font-medium text-destructive">
              {serverError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save"
                  : "Create"}
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

export default UserFormDialog;
