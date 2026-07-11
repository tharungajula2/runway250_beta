"use client";

import { useEffect, useState } from "react";
import { useRunwayStore } from "@/store/useRunwayStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useRunwayStore((state) => state.darkMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode, mounted]);

  return <>{children}</>;
}
