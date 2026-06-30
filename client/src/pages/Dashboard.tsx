import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Ticket,
  Inbox,
  Bot,
  Percent,
  Clock,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComponentType } from "react";
import NavBar from "../components/NavBar";
import { AlertError } from "@/components/ui/alert-error";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type DashboardStats, formatDuration } from "@/lib/ticket-constants";

interface DailyCount {
  date: string;
  count: number;
}

interface StatCardProps {
  label: string;
  description: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  isPending: boolean;
}

function StatCard({ label, description, value, icon: Icon, isPending }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" aria-hidden />
          {label}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Dashboard() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () =>
      axios
        .get<DashboardStats>("/api/tickets/stats")
        .then((res) => res.data),
  });

  const {
    data: dailyData,
    isPending: isDailyPending,
    isError: isDailyError,
  } = useQuery({
    queryKey: ["dashboard-daily"],
    queryFn: () =>
      axios
        .get<{ daily: DailyCount[] }>("/api/tickets/stats/daily")
        .then((res) => res.data.daily),
  });

  const cards: Omit<StatCardProps, "isPending">[] = [
    {
      label: "Total tickets",
      description: "All tickets received",
      value: String(data?.total ?? 0),
      icon: Ticket,
    },
    {
      label: "Open tickets",
      description: "Awaiting resolution",
      value: String(data?.open ?? 0),
      icon: Inbox,
    },
    {
      label: "Resolved by AI",
      description: "Auto-resolved from knowledge base",
      value: String(data?.resolvedByAI ?? 0),
      icon: Bot,
    },
    {
      label: "AI resolution rate",
      description: "Share of tickets resolved by AI",
      value: `${(data?.pctResolvedByAI ?? 0).toFixed(1)}%`,
      icon: Percent,
    },
    {
      label: "Avg. resolution time",
      description: "Across resolved & closed tickets",
      value: formatDuration(data?.avgResolutionMs ?? null),
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-24">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          An overview of ticket volume and AI performance.
        </p>

        {isError && (
          <AlertError
            message="Failed to load dashboard stats. Please try again later."
            className="mt-8"
          />
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} isPending={isPending && !isError} />
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tickets per day</CardTitle>
            <CardDescription>Total tickets received over the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isDailyError && (
              <AlertError message="Failed to load daily ticket data." />
            )}
            {isDailyPending ? (
              <Skeleton className="h-72 w-full" />
            ) : dailyData && (
              <ResponsiveContainer width="100%" height={288}>
                <BarChart data={dailyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    labelFormatter={formatDateLabel}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
                      fontSize: 13,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Tickets"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Dashboard;
