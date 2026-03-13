import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardSidebar from "./dashboard-sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock logo
vi.mock("@/components/cresora-logo", () => ({
  default: () => <svg data-testid="cresora-logo" />,
}));

describe("DashboardSidebar", () => {
  const mockSignOut = vi.fn();

  it("renders the logo and brand name", () => {
    render(<DashboardSidebar userName="Travis" signOutAction={mockSignOut} />);
    expect(screen.getByTestId("cresora-logo")).toBeInTheDocument();
    expect(screen.getByText("Cresora Commerce")).toBeInTheDocument();
    expect(screen.getAllByText("ROI Calculator")).toHaveLength(2);
  });

  it("renders all navigation items", () => {
    render(<DashboardSidebar userName="Travis" signOutAction={mockSignOut} />);
    // ROI Calculator link text appears in both the nav link and the brand subtitle
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/dashboard");
    expect(hrefs).toContain("/dashboard/settings");
    expect(hrefs).toContain("/dashboard/help");
  });

  it("highlights the active nav item", () => {
    render(<DashboardSidebar userName="Travis" signOutAction={mockSignOut} />);
    const dashboardLink = screen.getByRole("link", { name: /ROI Calculator/i });
    expect(dashboardLink.className).toContain("text-[#FC6200]");
  });

  it("displays the user name", () => {
    render(<DashboardSidebar userName="Travis" signOutAction={mockSignOut} />);
    expect(screen.getByText("Travis")).toBeInTheDocument();
  });

  it("renders sign out button", () => {
    render(<DashboardSidebar userName="Travis" signOutAction={mockSignOut} />);
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("toggles mobile menu on hamburger click", async () => {
    const user = userEvent.setup();
    render(<DashboardSidebar userName="Travis" signOutAction={mockSignOut} />);

    const hamburger = screen.getByLabelText("Open menu");
    await user.click(hamburger);

    // Sidebar should now have translate-x-0 (visible)
    const sidebar = screen.getByRole("complementary");
    expect(sidebar.className).toContain("translate-x-0");
  });

  it("closes mobile menu on close button click", async () => {
    const user = userEvent.setup();
    render(<DashboardSidebar userName="Travis" signOutAction={mockSignOut} />);

    // Open the menu first
    await user.click(screen.getByLabelText("Open menu"));

    // Close it
    await user.click(screen.getByLabelText("Close menu"));

    const sidebar = screen.getByRole("complementary");
    expect(sidebar.className).toContain("-translate-x-full");
  });

  it("handles null userName gracefully", () => {
    render(<DashboardSidebar userName={null} signOutAction={mockSignOut} />);
    // Should not render a user name paragraph
    expect(screen.queryByText("null")).not.toBeInTheDocument();
  });

  it("closes mobile menu when backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardSidebar userName="Travis" signOutAction={mockSignOut} />);
    await user.click(screen.getByLabelText("Open menu"));
    // Click the backdrop overlay
    const backdrop = document.querySelector(".fixed.inset-0");
    expect(backdrop).toBeInTheDocument();
    await user.click(backdrop!);
    const sidebar = screen.getByRole("complementary");
    expect(sidebar.className).toContain("-translate-x-full");
  });

  it("closes mobile menu when a nav link is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardSidebar userName="Travis" signOutAction={mockSignOut} />);
    await user.click(screen.getByLabelText("Open menu"));
    // Click a nav link
    await user.click(screen.getByText("Settings"));
    const sidebar = screen.getByRole("complementary");
    expect(sidebar.className).toContain("-translate-x-full");
  });

  it("sign out button submits the form", () => {
    render(<DashboardSidebar userName="Travis" signOutAction={mockSignOut} />);
    const form = screen.getByText("Sign out").closest("form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("action");
  });
});
