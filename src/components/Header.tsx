// src/components/Header.tsx
import React from "react";
import { Button } from "../ui/button"; // Adjust path if needed
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onAuthClick: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  user,
  onAuthClick,
  onSignOut,
}) => {
  // Pick a display name
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Member";

  return (
    <header className="w-full fixed top-0 left-0 z-40 bg-white shadow-sm">
      <nav
        className="flex items-center justify-between px-4 py-3 md:px-8"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo / Home button */}
        <button
          onClick={() => onNavigate("home")}
          className="text-xl font-bold text-gray-800 hover:text-gray-900 focus:outline-none"
          aria-label="Navigate to homepage"
        >
          🥊 Boxing Academy
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-700 hidden sm:block">
                Hey, {displayName}!
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                className="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onAuthClick(); // trigger auth modal
                onNavigate("login");
              }}
              className="text-gray-700 hover:text-gray-900"
            >
              Sign In
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
