"use client";

import { createContext, useContext, useMemo, useState } from "react";

type TicketReceiptContextValue = {
  ticket: string | null;
  setTicket: (ticket: string) => void;
};

const TicketReceiptContext = createContext<TicketReceiptContextValue | null>(null);

export function TicketReceiptProvider({ children }: { children: React.ReactNode }) {
  const [ticket, setTicket] = useState<string | null>(null);

  const value = useMemo(() => ({ ticket, setTicket }), [ticket]);

  return (
    <TicketReceiptContext.Provider value={value}>
      {children}
    </TicketReceiptContext.Provider>
  );
}

export function useTicketReceipt(): TicketReceiptContextValue {
  const context = useContext(TicketReceiptContext);
  if (!context) {
    throw new Error("useTicketReceipt harus dipakai di dalam TicketReceiptProvider.");
  }
  return context;
}
