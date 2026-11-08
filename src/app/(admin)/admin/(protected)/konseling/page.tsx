import { redirect } from "next/navigation";
import { AdminSlotDeleteButton } from "@/components/admin/AdminSlotDeleteButton";
import { AdminSlotForm } from "@/components/admin/AdminSlotForm";
import { getCurrentAdmin } from "@/lib/auth";
import { decryptToString } from "@/lib/crypto";
import { prisma } from "@/lib/db";

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

export default async function AdminCounselingPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Konseling</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola slot dan lihat permintaan konseling. Kontak hanya ditampilkan kepada
          petugas konseling.
        </p>
      </div>

      <AdminSlotForm isSuperAdmin={isSuperAdmin} counselors={counselors} />

      <section aria-labelledby="slot-heading">
        <h2 id="slot-heading" className="text-lg font-semibold">
          Slot
        </h2>
        {slots.length === 0 ? (
          <p className="mt-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            Belum ada slot.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm"
              >
                <span className="font-medium">
                  {dateTimeFormatter.format(slot.startsAt)}–
                  {timeFormatter.format(slot.endsAt)}
                </span>
                <span className="text-muted-foreground">
                  {modeLabels[slot.mode] ?? slot.mode}
                </span>
                {isSuperAdmin ? (
                  <span className="text-xs text-muted-foreground">
                    {slot.counselor.name}
                  </span>
                ) : null}
                {slot.booking ? (
                  <span className="rounded-md border border-primary/25 bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
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
        <h2 id="booking-heading" className="text-lg font-semibold">
          Permintaan konseling
        </h2>
        {bookings.length === 0 ? (
          <p className="mt-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            Belum ada permintaan konseling.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Jadwal
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Alias
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Kontak
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
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
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {dateTimeFormatter.format(booking.slot.startsAt)}–
                          {timeFormatter.format(booking.slot.endsAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {modeLabels[booking.slot.mode] ?? booking.slot.mode}
                          {isSuperAdmin ? ` · ${booking.slot.counselor.name}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">{booking.aliasName ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {contact ?? "Tidak diisi"}
                      </td>
                      <td className="px-4 py-3">{booking.status}</td>
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
