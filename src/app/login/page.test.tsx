import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

// Mock next-auth/react
const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
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

// Mock UI components to be simple HTML
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

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form", () => {
    render(<LoginPage />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("renders the sign in button", () => {
    render(<LoginPage />);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("has a link to the signup page", () => {
    render(<LoginPage />);
    const signupLink = screen.getByText("Sign up");
    expect(signupLink.closest("a")).toHaveAttribute("href", "/signup");
  });

  it("shows error on invalid credentials", async () => {
    mockSignIn.mockResolvedValue({ error: "CredentialsSignin" });
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "bad@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpass");
    await user.click(screen.getByText("Sign in"));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });

  it("redirects to dashboard on successful login", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "good@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "correctpass");
    await user.click(screen.getByText("Sign in"));

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("shows loading state while submitting", async () => {
    // Never resolve the signIn call
    mockSignIn.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("you@example.com"), "test@test.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password");
    await user.click(screen.getByText("Sign in"));

    expect(await screen.findByText("Signing in...")).toBeInTheDocument();
  });
});
