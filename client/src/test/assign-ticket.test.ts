import { describe, it, expect } from "vitest";
import { updateTicketSchema } from "../../../server/src/routes/tickets";

describe("updateTicketSchema — assignedAgentId", () => {
  it("should accept a valid agent ID", () => {
    const result = updateTicketSchema.safeParse({
      assignedAgentId: "user-123",
    });
    expect(result.success).toBe(true);
    expect(result.data!.assignedAgentId).toBe("user-123");
  });

  it("should accept null to unassign", () => {
    const result = updateTicketSchema.safeParse({ assignedAgentId: null });
    expect(result.success).toBe(true);
    expect(result.data!.assignedAgentId).toBeNull();
  });

  it("should reject an empty string", () => {
    const result = updateTicketSchema.safeParse({ assignedAgentId: "" });
    expect(result.success).toBe(false);
  });

  it("should allow omitting assignedAgentId entirely", () => {
    const result = updateTicketSchema.safeParse({ status: "OPEN" });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("assignedAgentId");
  });

  it("should reject a number for assignedAgentId", () => {
    const result = updateTicketSchema.safeParse({ assignedAgentId: 123 });
    expect(result.success).toBe(false);
  });

  it("should reject a boolean for assignedAgentId", () => {
    const result = updateTicketSchema.safeParse({ assignedAgentId: true });
    expect(result.success).toBe(false);
  });

  it("should ignore extra fields", () => {
    const result = updateTicketSchema.safeParse({
      assignedAgentId: "user-123",
      extraField: "should be stripped",
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("extraField");
  });
});

describe("updateTicketSchema — status", () => {
  it("should accept OPEN", () => {
    const result = updateTicketSchema.safeParse({ status: "OPEN" });
    expect(result.success).toBe(true);
    expect(result.data!.status).toBe("OPEN");
  });

  it("should accept RESOLVED", () => {
    const result = updateTicketSchema.safeParse({ status: "RESOLVED" });
    expect(result.success).toBe(true);
    expect(result.data!.status).toBe("RESOLVED");
  });

  it("should accept CLOSED", () => {
    const result = updateTicketSchema.safeParse({ status: "CLOSED" });
    expect(result.success).toBe(true);
    expect(result.data!.status).toBe("CLOSED");
  });

  it("should reject an invalid status", () => {
    const result = updateTicketSchema.safeParse({ status: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("should reject a number for status", () => {
    const result = updateTicketSchema.safeParse({ status: 1 });
    expect(result.success).toBe(false);
  });

  it("should allow omitting status", () => {
    const result = updateTicketSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("status");
  });
});

describe("updateTicketSchema — category", () => {
  it("should accept GENERAL_QUESTION", () => {
    const result = updateTicketSchema.safeParse({ category: "GENERAL_QUESTION" });
    expect(result.success).toBe(true);
    expect(result.data!.category).toBe("GENERAL_QUESTION");
  });

  it("should accept TECHNICAL_QUESTION", () => {
    const result = updateTicketSchema.safeParse({ category: "TECHNICAL_QUESTION" });
    expect(result.success).toBe(true);
    expect(result.data!.category).toBe("TECHNICAL_QUESTION");
  });

  it("should accept REFUND_REQUEST", () => {
    const result = updateTicketSchema.safeParse({ category: "REFUND_REQUEST" });
    expect(result.success).toBe(true);
    expect(result.data!.category).toBe("REFUND_REQUEST");
  });

  it("should accept null to clear category", () => {
    const result = updateTicketSchema.safeParse({ category: null });
    expect(result.success).toBe(true);
    expect(result.data!.category).toBeNull();
  });

  it("should reject an invalid category", () => {
    const result = updateTicketSchema.safeParse({ category: "BILLING" });
    expect(result.success).toBe(false);
  });

  it("should allow omitting category", () => {
    const result = updateTicketSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("category");
  });
});

describe("updateTicketSchema — combined fields", () => {
  it("should accept all fields together", () => {
    const result = updateTicketSchema.safeParse({
      assignedAgentId: "agent-1",
      status: "RESOLVED",
      category: "TECHNICAL_QUESTION",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      assignedAgentId: "agent-1",
      status: "RESOLVED",
      category: "TECHNICAL_QUESTION",
    });
  });

  it("should accept an empty object (no updates)", () => {
    const result = updateTicketSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
