import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CresoraLogo from "./cresora-logo";

describe("CresoraLogo", () => {
  it("renders an SVG element", () => {
    const { container } = render(<CresoraLogo />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("uses the default size of 32", () => {
    const { container } = render(<CresoraLogo />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("accepts a custom size", () => {
    const { container } = render(<CresoraLogo size={80} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "80");
    expect(svg).toHaveAttribute("height", "80");
  });

  it("applies custom className", () => {
    const { container } = render(<CresoraLogo className="my-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("my-class");
  });

  it("contains the brand colors", () => {
    const { container } = render(<CresoraLogo />);
    const html = container.innerHTML;
    expect(html).toContain("#FC6200"); // orange
    expect(html).toContain("#68DDDC"); // teal
  });
});
