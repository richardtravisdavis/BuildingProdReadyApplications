import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GlobalError from "./error";

describe("GlobalError", () => {
  it("displays the error message", () => {
    render(<GlobalError error={new Error("Test failure")} reset={() => {}} />);
    expect(screen.getByText("Test failure")).toBeInTheDocument();
  });

  it("shows fallback message when error has no message", () => {
    const error = new Error();
    error.message = "";
    render(<GlobalError error={error} reset={() => {}} />);
    expect(screen.getByText("An unexpected error occurred. Please try again.")).toBeInTheDocument();
  });

  it("displays the heading", () => {
    render(<GlobalError error={new Error("fail")} reset={() => {}} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("calls reset when Try again is clicked", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<GlobalError error={new Error("fail")} reset={reset} />);
    await user.click(screen.getByText("Try again"));
    expect(reset).toHaveBeenCalledOnce();
  });
});
