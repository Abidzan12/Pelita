import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSlotDeleteButton } from "@/components/admin/AdminSlotDeleteButton";
import { AdminSlotForm } from "@/components/admin/AdminSlotForm";
import { getCurrentAdmin } from "@/lib/auth";
import { decryptToString } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { BOOKING_STATUS_LABELS } from "@/lib/labels";

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

const modeLabels: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Tatap muka",
};

const bookingStyles: Record<string, string> = {
  DIJADWALKAN: "border-[#c9a53f] bg-[#f7dc85] text-[#3f3110]",
  SELESAI: "border-[#8fae9b] bg-[#e7f0e8] text-[#2c4a3d]",
  DIBATALKAN: "border-[#c9c1ac] bg-[#efe9da] text-[#5c6660]",
};

export default async function AdminCounselingPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  // Kontak konseling hanya untuk Konselor dan Super Admin (lihat ASSUMPTIONS).
  if (admin.role !== "KONSELOR" && admin.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const isSuperAdmin = admin.role === "SUPER_ADMIN";
  const counselorFilter = admin.role === "KONSELOR" ? { counselorId: admin.id } : {};

  const [slots, bookings, counselors] = await Promise.all([
    prisma.counselingSlot.findMany({
      where: counselorFilter,
      orderBy: { startsAt: "asc" },
      take: 100,
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        mode: true,
        counselor: { select: { name: true } },
        booking: { select: { aliasName: true, status: true } },
      },
    }),
    prisma.counselingBooking.findMany({
      where: admin.role === "KONSELOR" ? { slot: { counselorId: admin.id } } : {},
      orderBy: { slot: { startsAt: "asc" } },
      take: 100,
      select: {
        id: true,
        aliasName: true,
        status: true,
        createdAt: true,
        contactEnc: true,
        contactIv: true,
        contactTag: true,
        slot: {
          select: {
            startsAt: true,
            endsAt: true,
            mode: true,
            counselor: { select: { name: true } },
          },
        },
      },
    }),
    isSuperAdmin
      ? prisma.admin.findMany({
          where: { role: "KONSELOR", active: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Konseling"
        description="Kelola slot dan lihat permintaan konseling. Kontak hanya ditampilkan kepada petugas konseling."
      />

      <AdminSlotForm isSuperAdmin={isSuperAdmin} counselors={counselors} />

      <section aria-labelledby="slot-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="slot-heading" className="text-lg font-semibold">
              Slot
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Jadwal yang tampil di halaman konseling.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">
              {slots.length}
            </span>{" "}
            slot
          </p>
        </div>

        {slots.length === 0 ? (
          <div className="admin-empty mt-3">
            <p className="text-sm text-muted-foreground">Belum ada slot.</p>
          </div>
        ) : (
          <ul className="admin-card mt-3 divide-y divide-border">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm"
              >
                <span className="font-medium">
                  {dateTimeFormatter.format(slot.startsAt)}–
                  {timeFormatter.format(slot.endsAt)}
                </span>
                <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {modeLabels[slot.mode] ?? slot.mode}
                </span>
                {isSuperAdmin ? (
                  <span className="text-xs text-muted-foreground">
                    {slot.counselor.name}
                  </span>
                ) : null}
                {slot.booking ? (
                  <span className="rounded-md border border-[#c9a53f] bg-[#f7dc85] px-2 py-0.5 text-xs font-semibold text-[#3f3110]">
                    Dipesan{slot.booking.aliasName ? ` · ${slot.booking.aliasName}` : ""}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Kosong</span>
                )}
                <span className="ml-auto">
                  {slot.booking ? null : <AdminSlotDeleteButton slotId={slot.id} />}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="booking-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="booking-heading" className="text-lg font-semibold">
              Permintaan konseling
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kontak ditampilkan hanya untuk petugas konseling.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">
              {bookings.length}
            </span>{" "}
            permintaan
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="admin-empty mt-3">
            <p className="text-sm text-muted-foreground">
              Belum ada permintaan konseling.
            </p>
          </div>
        ) : (
          <div className="admin-card mt-3 overflow-x-auto">
            <table className="admin-table min-w-[680px]">
              <thead>
                <tr>
                  <th scope="col">Jadwal</th>
                  <th scope="col">Alias</th>
                  <th scope="col">Kontak</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const contact =
                    booking.contactEnc && booking.contactIv && booking.contactTag
                      ? decryptToString({
                          ciphertext: Buffer.from(booking.contactEnc),
                          iv: Buffer.from(booking.contactIv),
                          tag: Buffer.from(booking.contactTag),
                        })
                      : null;
                  return (
                    <tr key={booking.id}>
                      <td>
                        <p className="font-medium">
                          {dateTimeFormatter.format(booking.slot.startsAt)}–
                          {timeFormatter.format(booking.slot.endsAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {modeLabels[booking.slot.mode] ?? booking.slot.mode}
                          {isSuperAdmin ? ` · ${booking.slot.counselor.name}` : ""}
                        </p>
                      </td>
                      <td>{booking.aliasName ?? "—"}</td>
                      <td className="text-muted-foreground">{contact ?? "Tidak diisi"}</td>
                      <td>
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
                            bookingStyles[booking.status] ??
                            "border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
