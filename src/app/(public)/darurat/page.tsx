import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import emergencyContacts from "@/data/emergency-contacts.json";

export const metadata: Metadata = {
  title: "Kontak darurat",
  description:
    "Langkah yang bisa diambil sekarang dan kanal bantuan yang disediakan tim saat kamu membutuhkan pertolongan segera.",
};

const PLACEHOLDER = "ISI_OLEH_TIM";

const immediateSteps = [
  {
    title: "Pergi ke tempat yang lebih aman",
    body: "Kalau memungkinkan, menjauh dari situasi dan orang yang membuatmu tidak aman.",
  },
  {
    title: "Hubungi orang yang kamu percaya",
    body: "Sebutkan di mana kamu berada dan bantuan apa yang kamu butuhkan.",
  },
  {
    title: "Hubungi layanan darurat setempat",
    body: "Gunakan nomor darurat yang berlaku di wilayahmu.",
  },
];

export default function EmergencyPage() {
  return (
    <div className="poster-page">
      <section className="poster-masthead">
        <div aria-hidden="true" className="poster-sun" />
        <div className="relative z-[1] mx-auto max-w-4xl px-5 pt-12 pb-20 sm:px-8 sm:pt-14 lg:px-10">
          <h1 className="poster-title max-w-2xl">
            Kalau kamu sedang dalam <span className="hero-highlight">bahaya</span>
          </h1>
          <p className="poster-lead">
            Utamakan keselamatanmu. Hubungi layanan darurat setempat atau orang yang kamu
            percaya. Kamu juga bisa pergi ke tempat ramai terdekat.
          </p>
          <p className="report-alert-line">
            Pelita bukan saluran darurat dan tidak dipantau selama 24 jam. Jangan menunggu
            balasan chat jika kamu membutuhkan pertolongan sekarang.
          </p>
        </div>
        <div className="hero-bottom-rule" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="poster-sheet">
          <span className="poster-tab" aria-hidden="true">
            Kartu darurat
          </span>

          <section className="poster-step" aria-labelledby="sekarang">
            <div className="poster-step-head">
              <span aria-hidden="true" className="poster-step-num">
                01
              </span>
              <h2 id="sekarang" className="poster-step-title">
                Sekarang juga
              </h2>
              <p className="poster-step-note">
                Lakukan yang paling mungkin bagimu saat ini. Tidak harus berurutan.
              </p>
            </div>
            <div className="poster-step-body">
              <ol className="process-list">
                {immediateSteps.map((step, index) => (
                  <li key={step.title} className="process-step">
                    <span aria-hidden="true" className="process-step-mark">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-[#183456]">
                        {step.title}
                      </h3>
                      <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-[#53616a]">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="poster-step" aria-labelledby="kanal">
            <div className="poster-step-head">
              <span aria-hidden="true" className="poster-step-num">
                02
              </span>
              <h2 id="kanal" className="poster-step-title">
                Kanal yang bisa dihubungi
              </h2>
              <p className="poster-step-note">
                Pilih kanal yang paling dekat dengan kebutuhanmu.
              </p>
            </div>
            <div className="poster-step-body">
              <ul className="border-t border-[#c7c9ba]">
                {emergencyContacts.contacts.map((contact) => {
                  const activeChannels = contact.channels.filter((item) => {
                    const value = item.value.trim();
                    return value.length > 0 && value !== PLACEHOLDER;
                  });
                  return (
                    <li key={contact.name} className="border-b border-[#c7c9ba] py-4">
                      <h3 className="font-bold text-[#183456]">{contact.name}</h3>
                      <p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-[#53616a]">
                        {contact.description}
                      </p>
                      {activeChannels.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2.5">
                          {activeChannels.map((item) => {
                            const Icon = item.label === "Email" ? Mail : Phone;
                            const body = (
                              <>
                                <Icon aria-hidden="true" className="size-4 shrink-0 text-[#b34e3c]" />
                                <span className="text-[0.68rem] font-extrabold tracking-[0.12em] uppercase text-[#53616a]">
                                  {item.label}
                                </span>
                                <span className="font-extrabold tracking-tight text-[#183456]">
                                  {item.value.trim()}
                                </span>
                              </>
                            );
                            return item.href ? (
                              <a
                                key={`${contact.name}-${item.label}`}
                                href={item.href}
                                className="inline-flex min-h-11 max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 border border-[#122744] bg-[#f5f4e9] px-3.5 py-2 text-sm transition-colors hover:bg-[#ede8d6] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#122744]"
                              >
                                {body}
                              </a>
                            ) : (
                              <p
                                key={`${contact.name}-${item.label}`}
                                className="inline-flex min-h-11 max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 border border-[#122744] bg-[#f5f4e9] px-3.5 py-2 text-sm"
                              >
                                {body}
                              </p>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-3 inline-flex min-h-11 items-center border border-dashed border-[#b4ae9a] px-4 text-sm text-[#5c6660]">
                          Kanal belum diisi oleh tim.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="poster-note">
                Halaman ini memuat data kontak yang disediakan tim. Pelita tidak mengarang
                nomor atau alamat layanan.
              </p>
            </div>
          </section>
        </div>

        <Link href="/" className="poster-link mt-8">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
