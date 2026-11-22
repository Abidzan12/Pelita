"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarHeart,
  FileText,
  LayoutDashboard,
  MapPin,
} from "lucide-react";
import type { AdminRole } from "@prisma/client";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  visible: (role: AdminRole) => boolean;
};

const navigation: NavItem[] = [
  {
    href: "/admin",
    label: "Dasbor",
    icon: LayoutDashboard,
    exact: true,
    visible: () => true,
  },
  { href: "/admin/laporan", label: "Laporan", icon: FileText, visible: () => true },
  {
    href: "/admin/konseling",
    label: "Konseling",
    icon: CalendarHeart,
    // Halaman /admin/konseling sendiri yang menolak peran lain; ini hanya menu.
    visible: (role) => role !== "SATGAS",
  },
  {
    href: "/admin/statistik",
    label: "Statistik",
    icon: BarChart3,
    visible: (role) => role !== "KONSELOR",
  },
  {
    href: "/admin/artikel",
    label: "Artikel",
    icon: BookOpen,
    visible: (role) => role !== "KONSELOR",
  },
  {
    href: "/admin/titik-rawan",
    label: "Titik rawan",
    icon: MapPin,
    visible: (role) => role !== "KONSELOR",
  },
];

export function AdminNav({ role }: { role: AdminRole }) {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Navigasi panel">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {navigation
          .filter((item) => item.visible(role))
          .map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="admin-nav-link"
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
