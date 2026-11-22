"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-[#d9e3dc] transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#f1c957] focus-visible:outline-none disabled:opacity-60"
    >
      <LogOut aria-hidden="true" className="size-4" />
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}
