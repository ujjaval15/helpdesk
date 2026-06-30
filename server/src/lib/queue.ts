import { PgBoss } from "pg-boss";

const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL || "postgres://localhost/helpdesk",
  // Clean up stale active jobs every 30s (default is 60s)
  monitorStateIntervalSeconds: 30,
});

boss.on("error", (error) => console.error("pg-boss error:", error));

export default boss;
