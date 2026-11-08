import { expect, type APIRequestContext } from "@playwright/test";

export async function createReport(
  request: APIRequestContext,
  description: string,
): Promise<string> {
  const response = await request.post("/api/reports", {
    multipart: {
      reporterRole: "SAKSI",
      category: "PERUNDUNGAN",
      description,
    },
  });
  expect(response.status()).toBe(201);
  const payload = (await response.json()) as { ok: boolean; data?: { ticket?: string } };
  expect(payload.ok).toBe(true);
  expect(payload.data?.ticket).toMatch(/^PLT-/);
  return payload.data?.ticket ?? "";
}

export type TicketLookup = {
  status: string;
  messages: { sender: string; body: string }[];
};

export async function lookupTicket(
  request: APIRequestContext,
  ticket: string,
): Promise<TicketLookup> {
  const response = await request.post("/api/tickets/lookup", {
    data: { ticket },
  });
  expect(response.status()).toBe(200);
  const payload = (await response.json()) as {
    ok: boolean;
    data?: TicketLookup;
  };
  expect(payload.ok).toBe(true);
  return payload.data as TicketLookup;
}
