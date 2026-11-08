import { NextResponse } from "next/server";
import { z } from "zod";
import { answerChatbot } from "@/lib/chatbot";
import { limitRequest } from "@/lib/ratelimit";

export const runtime = "nodejs";

const chatbotSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Tulis pertanyaanmu.")
    .max(500, "Pesan maksimal 500 karakter."),
});

export async function POST(request: Request) {
  const limit = limitRequest(request, "chatbot", 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak pertanyaan. Coba lagi sebentar lagi." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Permintaan tidak valid." },
      { status: 400 },
    );
  }

  const parsed = chatbotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Pertanyaan tidak valid." },
      { status: 400 },
    );
  }

  const answer = answerChatbot(parsed.data.message);
  return NextResponse.json({ ok: true, data: answer });
}
