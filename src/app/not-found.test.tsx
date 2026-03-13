import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("displays 404", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("displays 'Page not found' heading", () => {
    render(<NotFound />);
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("has a link back to home", () => {
    render(<NotFound />);
    const link = screen.getByRole("link", { name: /back to home/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
