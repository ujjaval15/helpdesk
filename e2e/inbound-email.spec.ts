import { test, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";

const SERVER_BASE_URL = "http://localhost:3001";
const WEBHOOK_SECRET = "test-webhook-secret-e2e";

function uniqueEmail(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}@example.com`;
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    from: uniqueEmail("customer"),
    fromName: "Jane Doe",
    subject: `Help needed ${randomUUID().slice(0, 8)}`,
    body: "I need assistance with my account",
    ...overrides,
  };
}

test.describe("POST /api/webhooks/inbound-email", () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    api = await playwright.request.newContext({
      baseURL: SERVER_BASE_URL,
    });
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test("should create a ticket from a valid inbound email", async () => {
    const response = await api.post("/api/webhooks/inbound-email", {
      headers: { "x-webhook-secret": WEBHOOK_SECRET },
      data: validPayload(),
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.ticket).toBeDefined();
    expect(body.ticket.id).toBeGreaterThan(0);
    expect(body).not.toHaveProperty("existing");
  });

  test("should return 401 when webhook secret is missing or wrong", async () => {
    const noSecret = await api.post("/api/webhooks/inbound-email", {
      data: validPayload(),
    });
    expect(noSecret.status()).toBe(401);

    const wrongSecret = await api.post("/api/webhooks/inbound-email", {
      headers: { "x-webhook-secret": "wrong-secret" },
      data: validPayload(),
    });
    expect(wrongSecret.status()).toBe(401);
  });

  test("should deduplicate open tickets by sender and normalized subject", async () => {
    const email = uniqueEmail("dedup");
    const subject = `Duplicate check ${randomUUID().slice(0, 8)}`;

    // First email creates a ticket
    const res1 = await api.post("/api/webhooks/inbound-email", {
      headers: { "x-webhook-secret": WEBHOOK_SECRET },
      data: validPayload({ from: email, subject }),
    });
    expect(res1.status()).toBe(201);
    const ticketId = (await res1.json()).ticket.id;

    // Same sender + subject returns existing ticket
    const res2 = await api.post("/api/webhooks/inbound-email", {
      headers: { "x-webhook-secret": WEBHOOK_SECRET },
      data: validPayload({ from: email, subject }),
    });
    expect(res2.status()).toBe(200);
    const body2 = await res2.json();
    expect(body2.existing).toBe(true);
    expect(body2.ticket.id).toBe(ticketId);

    // Same sender, different subject creates new ticket
    const res3 = await api.post("/api/webhooks/inbound-email", {
      headers: { "x-webhook-secret": WEBHOOK_SECRET },
      data: validPayload({ from: email, subject: `Other ${randomUUID().slice(0, 8)}` }),
    });
    expect(res3.status()).toBe(201);
    expect((await res3.json()).ticket.id).not.toBe(ticketId);

    // Different sender, same subject creates new ticket
    const res4 = await api.post("/api/webhooks/inbound-email", {
      headers: { "x-webhook-secret": WEBHOOK_SECRET },
      data: validPayload({ from: uniqueEmail("other"), subject }),
    });
    expect(res4.status()).toBe(201);
    expect((await res4.json()).ticket.id).not.toBe(ticketId);
  });
});
