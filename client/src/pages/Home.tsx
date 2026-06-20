import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import NavBar from "../components/NavBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function Home() {
  const { data: status, isPending } = useQuery({
    queryKey: ["health"],
    queryFn: () =>
      axios.get<{ status: string }>("/api/health").then((res) => res.data.status),
  });

  const isHealthy = status === "ok";

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Helpdesk
        </h1>
        <p className="mt-2 text-muted-foreground">
          AI-Powered Ticket Management System
        </p>

        <Card className="mt-8 w-full max-w-sm text-left">
          <CardHeader>
            <CardTitle>Server status</CardTitle>
            <CardDescription>Backend health check</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {isPending ? (
              <>
                <Skeleton className="size-2.5 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </>
            ) : (
              <>
                <span
                  className={`size-2.5 rounded-full ${
                    isHealthy ? "bg-emerald-500" : "bg-destructive"
                  }`}
                  aria-hidden
                />
                <span className="text-sm font-medium text-foreground">
                  {status}
                </span>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Home;
