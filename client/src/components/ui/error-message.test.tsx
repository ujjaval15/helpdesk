import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ErrorMessage } from "./error-message";

describe("ErrorMessage", () => {
  it("renders nothing when error is undefined", () => {
    const { container } = render(<ErrorMessage error={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the error message when error is provided", () => {
    render(
      <ErrorMessage error={{ type: "required", message: "Name is required" }} />,
    );
    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });

  it("renders with destructive styling", () => {
    render(
      <ErrorMessage error={{ type: "minLength", message: "Too short" }} />,
    );
    const el = screen.getByText("Too short");
    expect(el.tagName).toBe("P");
    expect(el.className).toContain("text-destructive");
  });
});
