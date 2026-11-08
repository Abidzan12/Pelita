import { createHmac, randomBytes } from "node:crypto";

// Crockford Base32: tanpa I, L, O, U agar tidak ambigu saat diketik.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const TICKET_CHARS = 16;
const PEPPER_BYTES = 32;
const TICKET_PATTERN = /^PLT[0-9A-HJKMNP-TV-Z]{16}$/;
const BOOKING_PATTERN = /^BKG[0-9A-HJKMNP-TV-Z]{16}$/;

function randomBody(length: number): string {
  const bytes = randomBytes(length);
  let body = "";
  for (const byte of bytes) {
    // 256 habis dibagi 32, jadi modulo ini tidak bias.
    body += ALPHABET[byte % ALPHABET.length];
  }
  return body;
}

function groupBody(body: string): string {
  const groups = body.match(/.{4}/g);
  if (!groups) {
    throw new Error("Gagal membuat kode.");
  }
  return groups.join("-");
}

function pepperKey(): Buffer {
  const pepper = process.env.TICKET_PEPPER;
  if (!pepper) {
    throw new Error("TICKET_PEPPER belum diatur.");
  }
  const key = Buffer.from(pepper, "base64");
  if (key.length !== PEPPER_BYTES) {
    throw new Error("TICKET_PEPPER harus berupa 32 byte base64.");
  }
  return key;
}

export function normalizeTicket(ticket: string): string {
  return ticket.toUpperCase().replace(/[\s-]/g, "");
}

export function isValidTicketFormat(ticket: string): boolean {
  return TICKET_PATTERN.test(normalizeTicket(ticket));
}

export function generateTicket(): string {
  return `PLT-${groupBody(randomBody(TICKET_CHARS))}`;
}

export function hashTicket(ticket: string): string {
  return createHmac("sha256", pepperKey()).update(normalizeTicket(ticket)).digest("hex");
}

export function normalizeBookingCode(code: string): string {
  return code.toUpperCase().replace(/[\s-]/g, "");
}

export function isValidBookingCodeFormat(code: string): boolean {
  return BOOKING_PATTERN.test(normalizeBookingCode(code));
}

export function generateBookingCode(): string {
  return `BKG-${groupBody(randomBody(TICKET_CHARS))}`;
}

export function hashBookingCode(code: string): string {
  return createHmac("sha256", pepperKey())
    .update(`booking:${normalizeBookingCode(code)}`)
    .digest("hex");
}
