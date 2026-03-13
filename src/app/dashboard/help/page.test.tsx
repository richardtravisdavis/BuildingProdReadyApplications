import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HelpPage from "./page";

describe("HelpPage", () => {
  it("renders the page heading", () => {
    render(<HelpPage />);
    expect(screen.getByText("Help")).toBeInTheDocument();
  });

  it("renders all four sections", () => {
    render(<HelpPage />);
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(screen.getByText("Glossary")).toBeInTheDocument();
    expect(screen.getByText("Contact Support")).toBeInTheDocument();
  });

  it("shows the four getting-started steps", () => {
    render(<HelpPage />);
    expect(screen.getByText(/Enter your portfolio size/)).toBeInTheDocument();
    expect(screen.getByText(/Set your current pricing/)).toBeInTheDocument();
    expect(screen.getByText(/Review the comparison/)).toBeInTheDocument();
    expect(screen.getByText(/Switch between views/)).toBeInTheDocument();
  });

  it("toggles FAQ accordion on click", async () => {
    const user = userEvent.setup();
    render(<HelpPage />);

    const faqBtn = screen.getByText("What is the ROI Calculator?");
    expect(screen.queryByText(/helps ISVs/)).not.toBeInTheDocument();

    await user.click(faqBtn);
    expect(screen.getByText(/helps ISVs/)).toBeInTheDocument();

    await user.click(faqBtn);
    expect(screen.queryByText(/helps ISVs/)).not.toBeInTheDocument();
  });

  it("filters glossary by search term", async () => {
    const user = userEvent.setup();
    render(<HelpPage />);

    const search = screen.getByPlaceholderText("Search terms...");
    await user.type(search, "ACH");

    expect(screen.getByText("ACH")).toBeInTheDocument();
    // Terms not matching should be filtered out
    expect(screen.queryByText("PCI DSS")).not.toBeInTheDocument();
  });

  it("shows 'No matching terms' for empty glossary search", async () => {
    const user = userEvent.setup();
    render(<HelpPage />);

    const search = screen.getByPlaceholderText("Search terms...");
    await user.type(search, "xyznonexistent");

    expect(screen.getByText("No matching terms found.")).toBeInTheDocument();
  });

  it("has an email support link", () => {
    render(<HelpPage />);
    const link = screen.getByRole("link", { name: /email support/i });
    expect(link).toHaveAttribute("href", "mailto:support@cresora.com");
  });

  it("has a Cresora website link", () => {
    render(<HelpPage />);
    const link = screen.getByRole("link", { name: /visit cresora/i });
    expect(link).toHaveAttribute("href", "https://cresora.com");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
