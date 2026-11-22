"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatEntry = {
  id: number;
  role: "bot" | "user";
  text: string;
  emergency?: boolean;
};

type ChatbotResponse = {
  ok: boolean;
  data?: { reply: string; suggestions: string[]; emergency: boolean };
  error?: string;
};

const INITIAL_MESSAGE =
  "Halo, aku asisten informasi PELITA. Aku bisa membantu soal cara lapor, tiket, bukti, konseling, dan kontak darurat. Aku bukan konselor.";

const INITIAL_SUGGESTIONS = [
  "Bagaimana cara melapor?",
  "Apa itu tiket?",
  "Bagaimana cara memesan konseling?",
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>([
    { id: 0, role: "bot", text: INITIAL_MESSAGE },
  ]);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const counter = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  function nextId(): number {
    const id = counter.current;
    counter.current += 1;
    return id;
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) {
      return;
    }

    setMessages((current) => [...current, { id: nextId(), role: "user", text: trimmed }]);
    setInput("");
    setSuggestions([]);
    setSending(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const payload = (await response.json().catch(() => null)) as ChatbotResponse | null;

      if (!response.ok || !payload?.ok || !payload.data) {
        setMessages((current) => [
          ...current,
          {
            id: nextId(),
            role: "bot",
            text:
              payload?.error ??
              "Maaf, jawaban belum bisa dimuat. Coba lagi atau buka halaman Kontak Darurat.",
          },
        ]);
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: "bot",
          text: payload.data?.reply ?? "",
          emergency: payload.data?.emergency,
        },
      ]);
      setSuggestions(payload.data.suggestions);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: "bot",
          text: "Koneksi terputus. Coba lagi saat koneksi stabil.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open ? (
        <div
          role="dialog"
          aria-label="Asisten informasi PELITA"
          className="fixed bottom-20 left-4 z-50 flex max-h-[min(70vh,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-[3px] border border-[#c7c9ba] bg-[#fff7e9] shadow-[0_18px_40px_rgb(18_39_68/0.22)]"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[#122744] bg-[#122744] px-4 py-3 text-[#fff7e9]">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <MessageCircle aria-hidden="true" className="size-4 text-[#f1c957]" />
                Tanya PELITA
              </p>
              <p className="mt-0.5 text-xs text-[#d9e3dc]">
                Asisten informasi, bukan konselor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-[3px] text-[#d9e3dc] hover:bg-white/10 hover:text-[#fff7e9] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#f1c957]"
              aria-label="Tutup asisten"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "max-w-[90%] rounded-[3px] px-3 py-2 text-sm",
                  entry.role === "user"
                    ? "ml-auto bg-[#122744] text-[#fff7e9]"
                    : "mr-auto border border-[#c7c9ba] bg-[#f5f4e9] text-[#183456]",
                  entry.emergency && "border-[#c1502f] bg-[#ee8064]/12",
                )}
              >
                {entry.emergency ? (
                  <p className="mb-1 flex items-center gap-1 text-xs font-extrabold text-[#b34e3c]">
                    <AlertTriangle aria-hidden="true" className="size-3.5" />
                    Bantuan segera
                  </p>
                ) : null}
                <p className="whitespace-pre-wrap">{entry.text}</p>
                {entry.emergency ? (
                  <Link
                    href="/darurat"
                    className="mt-2 inline-flex min-h-9 items-center text-xs font-extrabold text-[#163f59] underline underline-offset-4"
                  >
                    Buka kontak darurat
                  </Link>
                ) : null}
              </div>
            ))}
            {sending ? (
              <p className="text-xs text-[#5c6660]">Asisten sedang mengetik…</p>
            ) : null}
          </div>

          {suggestions.length > 0 ? (
            <div className="flex flex-wrap gap-1 border-t border-[#c7c9ba] px-4 py-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="rounded-[3px] border border-[#c7c9ba] bg-[#f5f4e9] px-2 py-1 text-left text-xs text-[#465460] hover:bg-[#e6ede5] hover:text-[#183456] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#122744]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-[#c7c9ba] px-3 py-2"
          >
            <label htmlFor="chatbot-input" className="sr-only">
              Pertanyaan untuk asisten
            </label>
            <Input
              ref={inputRef}
              id="chatbot-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={500}
              placeholder="Tulis pertanyaan…"
              className="h-10 rounded-[3px] border-[#b4ae9a] bg-[#fffcf3] text-[#183456]"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || sending}
              aria-label="Kirim pertanyaan"
              className="size-10 shrink-0 rounded-[3px] bg-[#f1c957] text-[#132c47] hover:bg-[#f7dc85] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#122744]"
            >
              <Send aria-hidden="true" className="size-4" />
            </Button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Tutup asisten informasi" : "Buka asisten informasi"}
        className="fixed bottom-4 left-4 z-50 inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] border border-[#122744] bg-[#122744] px-4 text-sm font-extrabold text-[#fff7e9] shadow-[0_6px_0_#0b1a2e] transition-colors hover:bg-[#163456] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#f1c957] max-sm:size-12 max-sm:px-0"
      >
        <MessageCircle
          aria-hidden="true"
          className="size-4 text-[#f1c957] max-sm:size-5"
        />
        <span className="hidden sm:inline">Tanya PELITA</span>
      </button>
    </>
  );
}
