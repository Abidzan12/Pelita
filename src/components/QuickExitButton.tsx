"use client";

import { DoorOpen } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

const EXIT_URL = "https://www.google.com";
const DOUBLE_PRESS_MS = 800;

export function QuickExitButton() {
  const lastEscape = useRef(0);

  const exit = useCallback(() => {
    // Bersihkan tampilan sebelum pindah agar isi halaman tidak tertinggal.
    document.body.replaceChildren();
    window.location.replace(EXIT_URL);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      const now = Date.now();
      if (now - lastEscape.current <= DOUBLE_PRESS_MS) {
        exit();
        return;
      }
      lastEscape.current = now;
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [exit]);

  return (
    <button
      type="button"
      onClick={exit}
      aria-label="Keluar cepat dari situs ini dan buka Google"
      title="Keluar cepat (atau tekan Esc dua kali)"
      className="fixed right-4 bottom-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-[3px] border border-[#f1c957] bg-[#122744] px-4 text-sm font-extrabold text-[#fff7e9] shadow-[0_6px_0_#0b1a2e] transition-colors hover:bg-[#163456] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#f1c957]"
    >
      <DoorOpen aria-hidden="true" className="size-4 text-[#f1c957]" />
      Keluar cepat
    </button>
  );
}
