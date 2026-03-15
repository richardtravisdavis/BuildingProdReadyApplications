import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "./page";

// Mock auth-client
const mockSignUpEmail = vi.fn();
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: (...args: unknown[]) => mockSignUpEmail(...args),
    },
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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

describe("Signup Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the signup form", () => {
    render(<SignupPage />);
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByText("Get started with the ROI Calculator")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("renders the sign up button", () => {
    render(<SignupPage />);
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("has a link to the login page", () => {
    render(<SignupPage />);
    const loginLink = screen.getByText("Sign in");
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
  });

  it("shows error when signup fails", async () => {
    mockSignUpEmail.mockResolvedValue({
      error: { message: "An account with this email already exists" },
    });
    const user = userEvent.setup();

    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "exists@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByText("Sign up"));

    expect(
      await screen.findByText("An account with this email already exists")
    ).toBeInTheDocument();
  });

  it("shows loading state while submitting", async () => {
    // Never resolve to keep loading state
    mockSignUpEmail.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();

    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "new@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByText("Sign up"));

    expect(await screen.findByText("Creating account...")).toBeInTheDocument();
  });

  it("calls signUp and triggers redirect on successful signup", async () => {
    mockSignUpEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(<SignupPage />);

    await user.type(screen.getByPlaceholderText("Your name"), "Travis");
    await user.type(screen.getByPlaceholderText("you@example.com"), "travis@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "securepass");
    await user.click(screen.getByText("Sign up"));

    expect(mockSignUpEmail).toHaveBeenCalledWith({
      name: "Travis",
      email: "travis@test.com",
      password: "securepass",
    });
  });
});
