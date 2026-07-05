import {
  Activity,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const primaryNavItems: NavItem[] = [
  { href: "/", label: "Summary", icon: LayoutDashboard, exact: true },
  { href: "/bracket", label: "Bracket", icon: Activity },
  { href: "/matches", label: "Matches", icon: CalendarDays },
  { href: "/teams", label: "Teams", icon: Users },
];

export const adminNavItems: NavItem[] = [
  { href: "/agent-log", label: "Agent Log", icon: ListChecks },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
