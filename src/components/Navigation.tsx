"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Compass, TrendingUp, Coins, Settings } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  // Hide nav on landing and onboarding screens
  if (pathname === "/" || pathname === "/onboarding") {
    return null;
  }

  const navItems = [
    { label: "Today", href: "/today", icon: CalendarDays },
    { label: "Journey", href: "/journey", icon: Compass },
    { label: "Metrics", href: "/analytics", icon: TrendingUp },
    { label: "Business", href: "/business", icon: Coins },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[520px] bg-white/80 dark:bg-dark-surface/85 backdrop-blur-md border-t border-[var(--border-color)] px-4 py-2.5 flex items-center justify-around z-50 transition-all duration-300">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "text-teal font-semibold"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
            <span className="text-[10px] tracking-wide font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
