import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Home() {
  const [status, setStatus] = useState<string>("Checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

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
            <span
              className={`size-2.5 rounded-full ${
                isHealthy ? "bg-emerald-500" : "bg-destructive"
              }`}
              aria-hidden
            />
            <span className="text-sm font-medium text-foreground">
              {status}
            </span>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Home;
