import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import NavBar from "../components/NavBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
  createdAt: string;
  image: string | null;
}

function Users() {
  const { data: users, isPending } = useQuery({
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
        <p className="mt-2 text-muted-foreground">
          Manage team members and their roles.
        </p>

        {isPending ? (
          <p className="mt-8 text-muted-foreground">Loading…</p>
        ) : (
          <Table className="mt-8">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        {user.image && <AvatarImage src={user.image} />}
                        <AvatarFallback>
                          {user.name?.slice(0, 2).toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  );
}

export default Users;
