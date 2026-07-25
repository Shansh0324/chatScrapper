"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="focus-ring w-10 h-10 rounded-xl flex items-center justify-center
                 border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-bg-input)",
      }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-[18px] h-[18px]" style={{ color: "var(--color-text-secondary)" }} />
      ) : (
        <Moon className="w-[18px] h-[18px]" style={{ color: "var(--color-text-secondary)" }} />
      )}
    </button>
  );
}
