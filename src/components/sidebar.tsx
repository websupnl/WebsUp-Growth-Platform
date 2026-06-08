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
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/import", label: "Chat Import", icon: Inbox },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/audits", label: "Verbeterplan", icon: Gauge },
  { href: "/cases", label: "Cases", icon: FileText },
  { href: "/content", label: "Social", icon: Megaphone },
  { href: "/ideas", label: "Ideeën", icon: Lightbulb },
  { href: "/tasks", label: "Taken", icon: CheckSquare },
  { href: "/memory", label: "Memory", icon: Brain },
];

export function Sidebar({ logout }: { logout: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col bg-[#080612] px-2 py-4 border-r border-white/[0.05]">
      {/* Logo */}
      <div className="mb-6 px-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-white leading-none">WebsUp</p>
            <p className="text-[10px] text-white/30 leading-none mt-0.5">Growth OS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                active
                  ? "text-white"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
              )}
            >
              {active && (
                <span className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.08]" />
              )}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-brand-gradient" />
              )}
              <Icon className={cn("relative h-[15px] w-[15px] shrink-0", active ? "text-brand-violet" : "text-white/30 group-hover:text-white/50")} />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Uitloggen */}
      <div className="border-t border-white/[0.05] pt-3 mt-2">
        <form action={logout}>
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-white/30 transition-colors hover:text-white/60 hover:bg-white/[0.04]">
            <LogOut className="h-[15px] w-[15px]" />
            Uitloggen
          </button>
        </form>
      </div>
    </aside>
  );
}
