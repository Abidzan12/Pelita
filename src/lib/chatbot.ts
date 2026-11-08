import faq from "@/data/faq.json";

export type ChatbotAnswer = {
  reply: string;
  suggestions: string[];
  emergency: boolean;
};

type FaqEntry = {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
};

const entries = faq as FaqEntry[];

const EMERGENCY_KEYWORDS = [
  "bunuh diri",
  "ingin mati",
  "mau mati",
  "menyakiti diri",
  "disiksa",
  "dipukul",
  "diancam",
  "diperkosa",
  "pemerkosaan",
  "dipaksa",
  "tidak aman sekarang",
  "sekarang tidak aman",
  "butuh bantuan sekarang",
  "dalam bahaya",
];

const EMERGENCY_REPLY =
  "Kalau kamu dalam bahaya sekarang, utamakan keselamatanmu. Hubungi layanan darurat setempat atau orang yang kamu percaya, dan pergi ke tempat ramai bila memungkinkan. Buka halaman Kontak Darurat untuk kanal resmi yang tersedia. Jangan menunggu balasan chat.";

const FALLBACK_REPLY =
  "Aku belum punya jawaban untuk pertanyaan itu. Aku asisten informasi berbasis aturan, bukan konselor. Kamu bisa bertanya tentang cara lapor, tiket, bukti, konseling, atau membuka halaman Kontak Darurat.";

const DEFAULT_SUGGESTIONS = [
  "Bagaimana cara melapor?",
  "Apa itu tiket?",
  "Bagaimana cara memesan konseling?",
];

export function answerChatbot(message: string): ChatbotAnswer {
  const normalized = message.toLowerCase().trim();

  if (EMERGENCY_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return {
      reply: EMERGENCY_REPLY,
      suggestions: ["Di mana kontak darurat?", "Bagaimana cara melapor?"],
      emergency: true,
    };
  }

  let best: { entry: FaqEntry; score: number } | null = null;
  for (const entry of entries) {
    const score = entry.keywords.reduce(
      (total, keyword) =>
        normalized.includes(keyword.toLowerCase()) ? total + keyword.length : total,
      0,
    );
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  if (!best) {
    return {
      reply: FALLBACK_REPLY,
      suggestions: DEFAULT_SUGGESTIONS,
      emergency: false,
    };
  }

  const suggestions = entries
    .filter((entry) => entry.id !== best.entry.id)
    .slice(0, 3)
    .map((entry) => entry.question);

  return {
    reply: best.entry.answer,
    suggestions,
    emergency: false,
  };
}
