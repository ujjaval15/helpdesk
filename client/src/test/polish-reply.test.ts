import { describe, it, expect } from "vitest";
import { polishReplySchema } from "../../../server/src/routes/tickets";

describe("polishReplySchema", () => {
  it("accepts valid draft and ticketBody", () => {
    const result = polishReplySchema.safeParse({
      draft: "We will look into this",
      ticketBody: "My order is delayed",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty draft", () => {
    const result = polishReplySchema.safeParse({
      draft: "",
      ticketBody: "My order is delayed",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing draft", () => {
    const result = polishReplySchema.safeParse({
      ticketBody: "My order is delayed",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing ticketBody", () => {
    const result = polishReplySchema.safeParse({
      draft: "We will look into this",
    });
    expect(result.success).toBe(false);
  });

  it("rejects draft exceeding 5000 characters", () => {
    const result = polishReplySchema.safeParse({
      draft: "a".repeat(5001),
      ticketBody: "My order is delayed",
    });
    expect(result.success).toBe(false);
  });

  it("accepts draft at exactly 5000 characters", () => {
    const result = polishReplySchema.safeParse({
      draft: "a".repeat(5000),
      ticketBody: "My order is delayed",
    });
    expect(result.success).toBe(true);
  });
});
