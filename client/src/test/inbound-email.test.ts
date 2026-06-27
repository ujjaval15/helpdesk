import { describe, it, expect } from "vitest";
import {
  inboundEmailSchema,
  normalizeSubject,
} from "../../../server/src/routes/inboundEmail";

describe("inboundEmailSchema", () => {
  const validPayload = {
    from: "customer@example.com",
    fromName: "Jane Doe",
    subject: "Help needed",
    body: "I need assistance",
  };

  it("should accept a valid payload", () => {
    const result = inboundEmailSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("should reject an empty object with errors for all fields", () => {
    const result = inboundEmailSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain("from");
      expect(fields).toContain("fromName");
      expect(fields).toContain("subject");
      expect(fields).toContain("body");
    }
  });

  it("should reject an invalid email in the from field", () => {
    const result = inboundEmailSchema.safeParse({
      ...validPayload,
      from: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fromError = result.error.issues.find((i) => i.path[0] === "from");
      expect(fromError?.message).toBe("Invalid sender email");
    }
  });

  it("should reject an empty fromName", () => {
    const result = inboundEmailSchema.safeParse({
      ...validPayload,
      fromName: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("should reject an empty subject", () => {
    const result = inboundEmailSchema.safeParse({
      ...validPayload,
      subject: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject an empty body", () => {
    const result = inboundEmailSchema.safeParse({
      ...validPayload,
      body: "",
    });
    expect(result.success).toBe(false);
  });

  it("should trim whitespace from string fields", () => {
    const result = inboundEmailSchema.safeParse({
      ...validPayload,
      fromName: "  Jane Doe  ",
      subject: "  Help needed  ",
      body: "  I need help  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fromName).toBe("Jane Doe");
      expect(result.data.subject).toBe("Help needed");
      expect(result.data.body).toBe("I need help");
    }
  });
});

describe("normalizeSubject", () => {
  it("should collapse multiple spaces into a single space", () => {
    expect(normalizeSubject("Help   needed")).toBe("Help needed");
  });

  it("should collapse tabs and newlines into spaces", () => {
    expect(normalizeSubject("Help\t\tneeded\nplease")).toBe(
      "Help needed please",
    );
  });

  it("should leave a normal subject unchanged", () => {
    expect(normalizeSubject("Help needed")).toBe("Help needed");
  });

  it("should handle leading/trailing whitespace", () => {
    expect(normalizeSubject("  Help needed  ")).toBe(" Help needed ");
  });
});
