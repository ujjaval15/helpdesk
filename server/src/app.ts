import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { requireAuth } from "./middleware/requireAuth";
import boss from "./lib/queue";
import { CLASSIFY_TICKET_QUEUE, classifyTicketHandler } from "./lib/classify-ticket";
import { AUTO_RESOLVE_TICKET_QUEUE, autoResolveTicketHandler } from "./lib/auto-resolve-ticket";
import usersRouter from "./routes/users";
import inboundEmailRouter from "./routes/inboundEmail";
import ticketsRouter from "./routes/tickets";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

if (process.env.NODE_ENV === "production") {
  const signInLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts, try again later" },
  });

  app.use("/api/auth/sign-in", signInLimiter);
}

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/me", requireAuth, (req, res) => {
  const { token, ...safeSession } = req.session!;
  res.json({ user: req.user, session: safeSession });
});

app.use("/api/admin/users", usersRouter);
app.use("/api/webhooks/inbound-email", inboundEmailRouter);
app.use("/api/tickets", ticketsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await boss.start();
  const queueOptions = { retryLimit: 3, expireInMinutes: 2 };
  await boss.createQueue(CLASSIFY_TICKET_QUEUE, queueOptions);
  await boss.work(CLASSIFY_TICKET_QUEUE, { teamSize: 3 }, classifyTicketHandler);
  await boss.createQueue(AUTO_RESOLVE_TICKET_QUEUE, queueOptions);
  await boss.work(AUTO_RESOLVE_TICKET_QUEUE, { teamSize: 3 }, autoResolveTicketHandler);
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
