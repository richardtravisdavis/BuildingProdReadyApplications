"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      } else {
        setMessage({ type: "success", text: "Profile updated successfully" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }
    setSaving(true);
    setMessage(null);

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      setMessage({ type: "error", text: error.message ?? "Failed to change password" });
    } else {
      setMessage({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSaving(false);
  }

  const inputClass =
    "w-full bg-[#00273B] border border-[#003350] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#FC6200]/50 focus:ring-1 focus:ring-[#FC6200]/30 transition-colors";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
      <p className="text-gray-400 text-sm mb-8">Manage your account and preferences.</p>

      {message && (
        <div
          role="alert"
          aria-live="polite"
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-[#003350]/40 border border-[#003350] rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Profile</h2>
        <p className="text-gray-400 text-xs mb-5">Update your display name.</p>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Display Name</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="px-5 py-2 bg-[#FC6200] text-white text-sm font-medium rounded-lg hover:bg-[#FC6200]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Change Password Section */}
      <section className="bg-[#003350]/40 border border-[#003350] rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">Change Password</h2>
        <p className="text-gray-400 text-xs mb-5">Update your account password.</p>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Current Password</label>
            <input
              type="password"
              className={inputClass}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">New Password</label>
            <input
              type="password"
              className={inputClass}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              className={inputClass}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            className="px-5 py-2 bg-[#FC6200] text-white text-sm font-medium rounded-lg hover:bg-[#FC6200]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Updating..." : "Change Password"}
          </button>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-1">Danger Zone</h2>
        <p className="text-gray-400 text-xs mb-4">Irreversible actions for your account.</p>
        <button
          className="px-5 py-2 border border-red-500/40 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/10 transition-colors cursor-not-allowed opacity-50"
          disabled
          title="Coming soon"
        >
          Delete Account
        </button>
        <p className="text-gray-500 text-xs mt-2">Account deletion will be available in a future update.</p>
      </section>
    </div>
  );
}
