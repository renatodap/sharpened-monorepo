"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, MessageSquare, Settings, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";

const items = [
  { name: "Home", href: "/dashboard", icon: Home, match: (p: string) => p === "/" || p.startsWith("/dashboard") },
  { name: "Coach", href: "/coach", icon: MessageSquare, match: (p: string) => p.startsWith("/coach") },
  { name: "Log", href: "/log/workout", icon: Dumbbell, match: (p: string) => p.startsWith("/log") },
  { name: "Calendar", href: "/calendar", icon: Calendar, match: (p: string) => p.startsWith("/calendar") },
  { name: "Settings", href: "/settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-3 z-50 mx-auto max-w-md px-2",
        "[&]:pointer-events-none"
      )}
    >
      <div
        data-theme={theme}
        className={cn(
          "[&]:pointer-events-auto",
          "mx-auto flex items-center justify-between gap-1 rounded-2xl border",
          "border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60",
          "px-2 py-1 shadow-lg",
          "data-[theme=dark]:border-slate-700 data-[theme=dark]:bg-slate-900/80"
        )}
      >
        {items.map(({ name, href, icon: Icon, match }) => {
          const active = match(pathname || "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-1 rounded-xl transition",
                "min-w-[44px] min-h-[44px] px-2 py-2", // Ensure minimum 44x44px touch target
                "active:scale-95 active:bg-slate-200", // Touch feedback
                active
                  ? "text-slate-900 bg-slate-100 data-[theme=dark]:text-white data-[theme=dark]:bg-slate-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[theme=dark]:text-slate-400 data-[theme=dark]:hover:text-white data-[theme=dark]:hover:bg-slate-700"
              )}
              aria-current={active ? "page" : undefined}
              data-theme={theme}
            >
              <Icon className={cn("h-6 w-6", active ? "" : "opacity-80")} />
              <span className="text-[10px] font-semibold leading-none">{name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
