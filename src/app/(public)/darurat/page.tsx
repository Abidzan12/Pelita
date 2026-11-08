import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import emergencyContacts from "@/data/emergency-contacts.json";

export const metadata: Metadata = {
  title: "Kontak darurat",
};

const PLACEHOLDER = "ISI_OLEH_TIM";

export default function EmergencyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-semibold tracking-wide text-destructive uppercase">
        Bantuan segera
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Kalau kamu sedang dalam bahaya
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Utamakan keselamatanmu. Hubungi layanan darurat setempat atau orang yang kamu
        percaya. Kamu juga bisa pergi ke tempat ramai terdekat.
      </p>

      <div className="mt-8 flex gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-destructive"
        />
        <p className="text-sm leading-relaxed text-foreground">
          Pelita bukan saluran darurat dan tidak dipantau selama 24 jam. Jangan menunggu
          balasan chat jika kamu membutuhkan pertolongan sekarang.
        </p>
      </div>

      <section aria-labelledby="kontak" className="mt-10">
        <h2 id="kontak" className="text-xl font-semibold">
          Kanal yang bisa dihubungi
        </h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {emergencyContacts.contacts.map((contact) => (
            <li key={contact.name} className="py-4">
              <h3 className="font-semibold">{contact.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{contact.description}</p>
              {contact.channel === PLACEHOLDER ? (
                <p className="mt-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Kanal belum diisi oleh tim.
                </p>
              ) : (
                <p className="mt-2 text-sm font-medium">{contact.channel}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
        Halaman ini memuat data kontak yang disediakan tim. Pelita tidak mengarang nomor
        atau alamat layanan.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Kembali ke beranda
      </Link>
    </div>
  );
}
