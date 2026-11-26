import type { LucideIcon } from "lucide-react";
import { BarChart3, Briefcase, CalendarCheck, Settings, Wrench } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Today", icon: CalendarCheck },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/toolkit", label: "Toolkit", icon: Wrench },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
