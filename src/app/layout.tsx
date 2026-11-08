import type { Metadata, Viewport } from "next";
import "@fontsource-variable/source-sans-3";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pelita — Ruang aman untuk melapor",
    template: "%s · Pelita",
  },
  description:
    "Ruang aman dan anonim untuk melaporkan kekerasan seksual serta perundungan di lingkungan kampus.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf9f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
