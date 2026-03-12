"use client";

import { useState } from "react";
import CresoraLogo from "@/components/cresora-logo";

export default function DashboardSidebar({
  userName,
  signOutAction,
}: {
  userName?: string | null;
  signOutAction: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#003350] text-white"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <rect y="3" width="20" height="2" rx="1" />
          <rect y="9" width="20" height="2" rx="1" />
          <rect y="15" width="20" height="2" rx="1" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 bg-[#00273B] border-r border-[#003350] flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#003350]">
          <CresoraLogo size={36} />
          <div>
            <div className="text-white font-semibold text-sm">Cresora Commerce</div>
            <div className="text-[#68DDDC] text-xs">ROI Calculator</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden ml-auto text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-[#FC6200]/10 text-[#FC6200] border-l-2 border-[#FC6200]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="5.5" height="5.5" rx="1" />
              <rect x="10.5" y="2" width="5.5" height="5.5" rx="1" />
              <rect x="2" y="10.5" width="5.5" height="5.5" rx="1" />
              <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1" />
            </svg>
            ROI Calculator
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#003350] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="3" />
              <path d="M9 1.5v1.5M9 13.5v3M1.5 9H3M15 9h1.5M3.7 3.7l1.1 1.1M13.2 13.2l1.1 1.1M14.3 3.7l-1.1 1.1M4.8 13.2l-1.1 1.1" />
            </svg>
            Settings
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#003350] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="7.5" />
              <path d="M6.75 6.75a2.25 2.25 0 0 1 4.35.75c0 1.5-2.1 2.25-2.1 2.25" />
              <circle cx="9" cy="13" r="0.5" fill="currentColor" />
            </svg>
            Help
          </a>
        </nav>

        {/* User / Sign out */}
        <div className="border-t border-[#003350] px-4 py-4">
          {userName && (
            <p className="text-xs text-gray-400 mb-2 truncate">{userName}</p>
          )}
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 14H3.5A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2H6" />
                <path d="M10.5 11.5L14 8l-3.5-3.5" />
                <path d="M14 8H6" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
