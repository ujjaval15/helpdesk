import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AlertError } from "./alert-error";

describe("AlertError", () => {
  it("renders the error message", () => {
    render(<AlertError message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("has role='alert' for accessibility", () => {
    render(<AlertError message="Server error" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Server error");
  });

  it("applies destructive styling by default", () => {
    render(<AlertError message="Error" />);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("text-destructive");
    expect(el.className).toContain("text-sm");
  });

  it("merges custom className", () => {
    render(<AlertError message="Error" className="mt-8 font-medium" />);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("mt-8");
    expect(el.className).toContain("font-medium");
    expect(el.className).toContain("text-destructive");
  });
});
