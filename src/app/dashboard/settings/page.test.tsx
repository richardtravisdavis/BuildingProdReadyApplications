import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "./page";

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the page heading", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders Profile, Change Password, and Danger Zone sections", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Change Password" })).toBeInTheDocument();
    expect(screen.getByText("Danger Zone")).toBeInTheDocument();
  });

  it("has a disabled Delete Account button", () => {
    render(<SettingsPage />);
    const btn = screen.getByRole("button", { name: /delete account/i });
    expect(btn).toBeDisabled();
  });

  it("disables Save Changes when name is empty", () => {
    render(<SettingsPage />);
    const btn = screen.getByRole("button", { name: /save changes/i });
    expect(btn).toBeDisabled();
  });

  it("enables Save Changes when name is entered", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);
    await user.type(screen.getByPlaceholderText("Your name"), "Travis");
    expect(screen.getByRole("button", { name: /save changes/i })).not.toBeDisabled();
  });

  it("submits profile form and shows success message", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    render(<SettingsPage />);
    await user.type(screen.getByPlaceholderText("Your name"), "Travis");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Profile updated successfully")).toBeInTheDocument();
  });

  it("shows error when profile update fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );

    render(<SettingsPage />);
    await user.type(screen.getByPlaceholderText("Your name"), "Travis");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Unauthorized")).toBeInTheDocument();
  });

  it("shows error when passwords don't match", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const [currentPw, newPw, confirmPw] = screen.getAllByPlaceholderText("••••••••");
    await user.type(currentPw, "oldpassword");
    await user.type(newPw, "newpassword1");
    await user.type(confirmPw, "different");
    await user.click(screen.getByRole("button", { name: /change password/i }));

    expect(screen.getByText("New passwords do not match")).toBeInTheDocument();
  });

  it("shows error when new password is too short", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const [currentPw, newPw, confirmPw] = screen.getAllByPlaceholderText("••••••••");
    await user.type(currentPw, "oldpassword");
    await user.type(newPw, "short");
    await user.type(confirmPw, "short");
    await user.click(screen.getByRole("button", { name: /change password/i }));

    expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
  });

  it("submits password form and shows success", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    render(<SettingsPage />);

    const [currentPw, newPw, confirmPw] = screen.getAllByPlaceholderText("••••••••");
    await user.type(currentPw, "oldpassword");
    await user.type(newPw, "newpassword123");
    await user.type(confirmPw, "newpassword123");
    await user.click(screen.getByRole("button", { name: /change password/i }));

    expect(await screen.findByText("Password changed successfully")).toBeInTheDocument();
  });

  it("has aria-live on the message area", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    render(<SettingsPage />);
    await user.type(screen.getByPlaceholderText("Your name"), "Travis");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "polite");
  });
});
