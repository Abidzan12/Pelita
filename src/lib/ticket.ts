import { createHmac, randomBytes } from "node:crypto";

// Crockford Base32: tanpa I, L, O, U agar tidak ambigu saat diketik.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const TICKET_CHARS = 16;
const PEPPER_BYTES = 32;
const TICKET_PATTERN = /^PLT[0-9A-HJKMNP-TV-Z]{16}$/;

export function normalizeTicket(ticket: string): string {
  return ticket.toUpperCase().replace(/[\s-]/g, "");
}

export function isValidTicketFormat(ticket: string): boolean {
  return TICKET_PATTERN.test(normalizeTicket(ticket));
}

export function generateTicket(): string {
  const bytes = randomBytes(TICKET_CHARS);
  let body = "";
  for (const byte of bytes) {
    // 256 habis dibagi 32, jadi modulo ini tidak bias.
    body += ALPHABET[byte % ALPHABET.length];
  }
  const groups = body.match(/.{4}/g);
  if (!groups) {
    throw new Error("Gagal membuat tiket.");
  }
  return `PLT-${groups.join("-")}`;
}

export function hashTicket(ticket: string): string {
  const pepper = process.env.TICKET_PEPPER;
  if (!pepper) {
    throw new Error("TICKET_PEPPER belum diatur.");
  }
  const key = Buffer.from(pepper, "base64");
  if (key.length !== PEPPER_BYTES) {
    throw new Error("TICKET_PEPPER harus berupa 32 byte base64.");
  }
  return createHmac("sha256", key).update(normalizeTicket(ticket)).digest("hex");
}
