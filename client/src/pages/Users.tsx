import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import NavBar from "../components/NavBar";
import { Button } from "@/components/ui/button";
import UserFormDialog from "@/components/UserFormDialog";
import DeleteUserDialog from "@/components/DeleteUserDialog";
import UsersTable, { type User } from "@/components/UsersTable";

type DialogState = null | "create" | User;

function Users() {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const { data: users, isPending, isError } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () =>
      axios.get<{ users: User[] }>("/api/admin/users").then((res) => res.data.users),
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-24">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Users
        </h1>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-muted-foreground">
            Manage team members and their roles.
          </p>
          <Button onClick={() => setDialog("create")}>
            <Plus className="mr-1.5 size-4" />
            Create User
          </Button>
        </div>

        <UserFormDialog
          open={dialog !== null}
          user={typeof dialog === "object" ? dialog : undefined}
          onOpenChange={(open) => { if (!open) setDialog(null); }}
        />

        <DeleteUserDialog
          user={deleteUser}
          open={!!deleteUser}
          onOpenChange={(open) => { if (!open) setDeleteUser(null); }}
        />

        {isError && (
          <p className="mt-8 text-sm text-destructive" role="alert">
            Failed to load users. Please try again later.
          </p>
        )}

        <UsersTable
          users={users}
          isPending={isPending}
          onEdit={setDialog}
          onDelete={setDeleteUser}
        />
      </main>
    </div>
  );
}

export default Users;
