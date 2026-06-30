import { PgBoss } from "pg-boss";

const boss = new PgBoss(process.env.DATABASE_URL || "postgres://localhost/helpdesk");

boss.on("error", (error) => console.error("pg-boss error:", error));

export default boss;
