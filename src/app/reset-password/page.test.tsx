import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "./page";

// Mock next/navigation
const mockSearchParams = new URLSearchParams("token=test-token-123");
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => mockSearchParams,
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
const mockResetPassword = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    resetPassword: (...args: unknown[]) => mockResetPassword(...args),
  },
}));

describe("Reset Password Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the reset password form when token is present", () => {
    render(<ResetPasswordPage />);
    expect(screen.getByText("Reset your password")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(screen.getByText("Reset password")).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "different456");
    await user.click(screen.getByText("Reset password"));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("shows success message after successful reset", async () => {
    mockResetPassword.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInput, "newsecurepass");
    await user.type(confirmInput, "newsecurepass");
    await user.click(screen.getByText("Reset password"));

    expect(
      await screen.findByText("Your password has been reset successfully.")
    ).toBeInTheDocument();
  });

  it("shows error when API returns failure", async () => {
    mockResetPassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid or expired reset link. Please request a new one.", status: 400 },
    });
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInput, "newpassword123");
    await user.type(confirmInput, "newpassword123");
    await user.click(screen.getByText("Reset password"));

    expect(
      await screen.findByText(/Invalid or expired/)
    ).toBeInTheDocument();
  });

  it("shows loading state while submitting", async () => {
    mockResetPassword.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInput, "newpassword123");
    await user.type(confirmInput, "newpassword123");
    await user.click(screen.getByText("Reset password"));

    expect(await screen.findByText("Resetting...")).toBeInTheDocument();
  });

  it("calls authClient with token and password", async () => {
    mockResetPassword.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInput, "newsecurepass");
    await user.type(confirmInput, "newsecurepass");
    await user.click(screen.getByText("Reset password"));

    expect(mockResetPassword).toHaveBeenCalledWith({
      newPassword: "newsecurepass",
      token: "test-token-123",
    });
  });
});
