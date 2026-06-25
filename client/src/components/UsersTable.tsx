import { Pencil } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
  createdAt: string;
  image: string | null;
}

interface UsersTableProps {
  users: User[] | undefined;
  isPending: boolean;
  onEdit: (user: User) => void;
}

function UsersTable({ users, isPending, onEdit }: UsersTableProps) {
  return (
    <Table className="mt-8">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isPending
          ? Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))
          : users?.map((user) => (
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                    aria-label={`Edit ${user.name}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}

export default UsersTable;
