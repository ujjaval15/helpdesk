import type { Request, Response, NextFunction } from "express";

export function requireWebhookSecret(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const secret = req.headers["x-webhook-secret"];
  const expected = process.env.WEBHOOK_SECRET;

  if (!expected) {
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  if (secret !== expected) {
    res.status(401).json({ error: "Invalid webhook secret" });
    return;
  }

  next();
}
