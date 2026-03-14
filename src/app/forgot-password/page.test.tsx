import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "./page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: Record<string, unknown>) => <input {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock("@/components/cresora-logo", () => ({
  default: () => <svg data-testid="cresora-logo" />,
}));

// Mock auth-client
const mockRequestPasswordReset = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    requestPasswordReset: (...args: unknown[]) => mockRequestPasswordReset(...args),
  },
}));

describe("Forgot Password Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the forgot password form", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByText("Send reset link")).toBeInTheDocument();
  });

  it("has a link back to login", () => {
    render(<ForgotPasswordPage />);
    const loginLink = screen.getByText("Sign in");
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
  });

  it("shows success message after submission", async () => {
    mockRequestPasswordReset.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    await user.click(screen.getByText("Send reset link"));

    expect(
      await screen.findByText(/If an account with that email exists/)
    ).toBeInTheDocument();
  });

  it("shows error when API fails", async () => {
    mockRequestPasswordReset.mockResolvedValue({
      data: null,
      error: { message: "Too many requests. Please try again later.", status: 429 },
    });
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    await user.click(screen.getByText("Send reset link"));

    expect(
      await screen.findByText("Too many requests. Please try again later.")
    ).toBeInTheDocument();
  });

  it("shows loading state while submitting", async () => {
    mockRequestPasswordReset.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
    await user.click(screen.getByText("Send reset link"));

    expect(await screen.findByText("Sending...")).toBeInTheDocument();
  });

  it("calls authClient with correct payload", async () => {
    mockRequestPasswordReset.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "travis@test.com");
    await user.click(screen.getByText("Send reset link"));

    expect(mockRequestPasswordReset).toHaveBeenCalledWith({
      email: "travis@test.com",
      redirectTo: "/reset-password",
    });
  });
});
