import { describe, expect, it } from "vitest";
import faq from "@/data/faq.json";
import { answerChatbot } from "./chatbot";

describe("answerChatbot", () => {
  it("menjawab pertanyaan FAQ tanpa jatuh ke fallback", () => {
    for (const entry of faq) {
      const answer = answerChatbot(entry.question);
      expect(answer.emergency, entry.question).toBe(false);
      expect(answer.reply, entry.question).not.toContain("belum punya jawaban");
      expect(answer.suggestions.length, entry.question).toBeGreaterThan(0);
    }
  });

  it("mendeteksi kata kunci bahaya dan mengarahkan ke kontak darurat", () => {
    const answer = answerChatbot("Saya takut, sekarang tidak aman dan ingin bunuh diri.");
    expect(answer.emergency).toBe(true);
    expect(answer.reply).toContain("Kontak Darurat");
    expect(answer.reply.toLowerCase()).not.toContain("112");
  });

  it("memberi fallback untuk pertanyaan di luar basis pengetahuan", () => {
    const answer = answerChatbot("Bagaimana cuaca besok di Yogyakarta?");
    expect(answer.emergency).toBe(false);
    expect(answer.reply).toContain("belum punya jawaban");
  });
});
