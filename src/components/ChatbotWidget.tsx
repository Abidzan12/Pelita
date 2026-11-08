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
          className="fixed bottom-20 left-4 z-50 flex max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl"
        >
          <div className="flex items-start justify-between gap-3 border-b border-border bg-card px-4 py-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <MessageCircle aria-hidden="true" className="size-4 text-primary" />
                Tanya PELITA
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Asisten informasi, bukan konselor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
                  "max-w-[90%] rounded-lg px-3 py-2 text-sm",
                  entry.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto border border-border bg-card",
                  entry.emergency && "border-destructive/40 bg-destructive/5",
                )}
              >
                {entry.emergency ? (
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-destructive">
                    <AlertTriangle aria-hidden="true" className="size-3.5" />
                    Bantuan segera
                  </p>
                ) : null}
                <p className="whitespace-pre-wrap">{entry.text}</p>
                {entry.emergency ? (
                  <Link
                    href="/darurat"
                    className="mt-2 inline-flex min-h-9 items-center text-xs font-semibold text-primary underline underline-offset-4"
                  >
                    Buka kontak darurat
                  </Link>
                ) : null}
              </div>
            ))}
            {sending ? (
              <p className="text-xs text-muted-foreground">Asisten sedang mengetik…</p>
            ) : null}
          </div>

          {suggestions.length > 0 ? (
            <div className="flex flex-wrap gap-1 border-t border-border px-4 py-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="rounded-md border border-border px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
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
            className="flex items-center gap-2 border-t border-border px-3 py-2"
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
              className="h-10 bg-background"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || sending}
              aria-label="Kirim pertanyaan"
              className="size-10 shrink-0"
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
        className="fixed bottom-4 left-4 z-50 inline-flex min-h-12 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-semibold shadow-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <MessageCircle aria-hidden="true" className="size-4 text-primary" />
        Tanya PELITA
      </button>
    </>
  );
}
