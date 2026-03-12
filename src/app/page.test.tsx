import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock shadcn components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 className={className}>{children}</h3>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock logo and fade-in
vi.mock("@/components/cresora-logo", () => ({
  default: () => <svg data-testid="cresora-logo" />,
}));

vi.mock("@/components/fade-in", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Landing Page", () => {
  it("renders the nav with logo and brand name", () => {
    render(<Home />);
    expect(screen.getByTestId("cresora-logo")).toBeInTheDocument();
    expect(screen.getByText("Cresora Commerce")).toBeInTheDocument();
  });

  it("renders Login and Sign Up buttons", () => {
    render(<Home />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("renders the hero section", () => {
    render(<Home />);
    expect(
      screen.getByText("Stop Overpaying for Merchant Processing")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Streamlined at the Speed of AI")
    ).toBeInTheDocument();
  });

  it("renders the CTA button", () => {
    render(<Home />);
    expect(
      screen.getByText("Get Started — It's Free")
    ).toBeInTheDocument();
  });

  it("renders three feature cards", () => {
    render(<Home />);
    expect(screen.getByText("Compare Rates")).toBeInTheDocument();
    expect(screen.getByText("See True Costs")).toBeInTheDocument();
    expect(screen.getByText("Save Money")).toBeInTheDocument();
    expect(screen.getAllByTestId("card")).toHaveLength(3);
  });

  it("renders the footer", () => {
    render(<Home />);
    const year = new Date().getFullYear().toString();
    expect(
      screen.getByText(new RegExp(`${year}.*Cresora Commerce`))
    ).toBeInTheDocument();
  });

  it("has correct navigation links", () => {
    render(<Home />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/login");
    expect(hrefs).toContain("/signup");
  });
});
