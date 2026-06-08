"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Brain,
  Lightbulb,
  CheckSquare,
  Users,
  Gauge,
  FileText,
  Megaphone,
  Target,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/import", label: "Chat Import", icon: Inbox },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/ideas", label: "Ideeën", icon: Lightbulb },
  { href: "/tasks", label: "Taken", icon: CheckSquare },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/audits", label: "Verbeterplan", icon: Gauge },
  { href: "/cases", label: "Cases", icon: FileText },
  { href: "/content", label: "Social", icon: Megaphone },
  { href: "/goals", label: "Doelen", icon: Target },
];

// Modules die nog niet gebouwd zijn (Fase 2+). Visueel gedimd.
const built = new Set(["/", "/memory", "/ideas", "/tasks"]);

export function Sidebar({ logout }: { logout: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-surface-border bg-surface px-3 py-5">
      <div className="mb-7 px-2">
        <span className="bg-brand-gradient bg-clip-text font-heading text-xl font-bold text-transparent">
          WebsUp
        </span>
        <p className="text-xs text-muted">Growth Platform</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          const ready = built.has(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surface-raised text-white"
                  : "text-muted hover:bg-surface-raised hover:text-white",
                !ready && "opacity-45"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {!ready && (
                <span className="ml-auto text-[10px] uppercase tracking-wide text-muted/60">
                  soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <form action={logout}>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-raised hover:text-white">
          <LogOut className="h-4 w-4" />
          Uitloggen
        </button>
      </form>
    </aside>
  );
}
