import { beforeAll, describe, expect, it } from "vitest";
import {
  generateTicket,
  hashTicket,
  isValidTicketFormat,
  normalizeTicket,
} from "./ticket";

beforeAll(() => {
  process.env.TICKET_PEPPER = Buffer.alloc(32, 3).toString("base64");
});

describe("generateTicket", () => {
  it("menghasilkan format PLT-XXXX-XXXX-XXXX-XXXX", () => {
    expect(generateTicket()).toMatch(
      /^PLT-[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/,
    );
  });

  it("menghasilkan tiket yang berbeda setiap kali", () => {
    const tickets = new Set(Array.from({ length: 200 }, generateTicket));
    expect(tickets.size).toBe(200);
  });
});

describe("normalizeTicket", () => {
  it("mengubah ke huruf besar dan membuang tanda hubung serta spasi", () => {
    expect(normalizeTicket(" plt-ab12-cd34-ef56-gh78 ")).toBe("PLTAB12CD34EF56GH78");
    expect(normalizeTicket("PLT AB12 CD34 EF56 GH78")).toBe("PLTAB12CD34EF56GH78");
  });
});

describe("isValidTicketFormat", () => {
  it("menerima tiket yang valid", () => {
    expect(isValidTicketFormat(generateTicket())).toBe(true);
    expect(isValidTicketFormat("plt-ab12-cd34-ef56-gh78")).toBe(true);
  });

  it("menolak tiket yang tidak valid", () => {
    expect(isValidTicketFormat("")).toBe(false);
    expect(isValidTicketFormat("PLT-AB12-CD34-EF56")).toBe(false);
    expect(isValidTicketFormat("PLT-AB12-CD34-EF56-GH7I")).toBe(false);
    expect(isValidTicketFormat("XXX-AB12-CD34-EF56-GH78")).toBe(false);
  });
});

describe("hashTicket", () => {
  it("deterministik dan tidak mengembalikan tiket asli", () => {
    const ticket = generateTicket();
    const hash = hashTicket(ticket);
    expect(hash).toBe(hashTicket(ticket.toLowerCase()));
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(normalizeTicket(ticket));
  });

  it("menghasilkan hash berbeda untuk tiket berbeda", () => {
    expect(hashTicket(generateTicket())).not.toBe(hashTicket(generateTicket()));
  });

  it("gagal jika pepper tidak diatur", () => {
    const saved = process.env.TICKET_PEPPER;
    delete process.env.TICKET_PEPPER;
    expect(() => hashTicket("PLT-AB12-CD34-EF56-GH78")).toThrow(
      "TICKET_PEPPER belum diatur.",
    );
    process.env.TICKET_PEPPER = saved;
  });
});
