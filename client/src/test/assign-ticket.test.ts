import { describe, it, expect } from "vitest";
import { assignTicketSchema } from "../../../server/src/routes/tickets";

describe("assignTicketSchema", () => {
  it("should accept a valid agent ID", () => {
    const result = assignTicketSchema.safeParse({
      assignedAgentId: "user-123",
    });
    expect(result.success).toBe(true);
    expect(result.data!.assignedAgentId).toBe("user-123");
  });

  it("should accept null to unassign", () => {
    const result = assignTicketSchema.safeParse({ assignedAgentId: null });
    expect(result.success).toBe(true);
    expect(result.data!.assignedAgentId).toBeNull();
  });

  it("should reject an empty string", () => {
    const result = assignTicketSchema.safeParse({ assignedAgentId: "" });
    expect(result.success).toBe(false);
  });

  it("should reject a missing assignedAgentId field", () => {
    const result = assignTicketSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject a number", () => {
    const result = assignTicketSchema.safeParse({ assignedAgentId: 123 });
    expect(result.success).toBe(false);
  });

  it("should reject undefined", () => {
    const result = assignTicketSchema.safeParse({ assignedAgentId: undefined });
    expect(result.success).toBe(false);
  });

  it("should reject a boolean", () => {
    const result = assignTicketSchema.safeParse({ assignedAgentId: true });
    expect(result.success).toBe(false);
  });

  it("should ignore extra fields", () => {
    const result = assignTicketSchema.safeParse({
      assignedAgentId: "user-123",
      extraField: "should be stripped",
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("extraField");
  });
});
