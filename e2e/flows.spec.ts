import { expect, test } from "@playwright/test";
import { createReport, lookupTicket } from "./helpers";

test("pelapor dapat mengirim laporan dan menerima tiket sekali", async ({ page }) => {
  await page.goto("/lapor");

  await page.getByLabel("Saya yang mengalaminya").check();
  await page.getByLabel("Kategori kejadian").selectOption("PERUNDUNGAN");
  await page
    .getByLabel(/Kronologi/)
    .fill(
      "Laporan uji E2E: saya mengalami perundungan berulang di area kelas selama dua minggu.",
    );
  await page.getByLabel(/Saya memahami bahwa tiket/).check();
  await page.getByRole("button", { name: "Kirim laporan" }).click();

  await expect(page).toHaveURL(/\/lapor\/berhasil$/);
  await expect(page.getByRole("heading", { name: "Simpan tiket ini sekarang" })).toBeVisible();

  const ticket = await page.getByText(/^PLT-[0-9A-Z-]+$/).first().textContent();
  expect(ticket).toMatch(/^PLT-[0-9A-Z]{4}(-[0-9A-Z]{4}){3}$/);
  expect(page.url()).not.toContain("PLT-");

  const storage = await page.evaluate(() => ({
    localStorage: Object.keys(localStorage).length,
    sessionStorage: Object.keys(sessionStorage).length,
  }));
  expect(storage.localStorage).toBe(0);
  expect(storage.sessionStorage).toBe(0);
});

test("pelapor dapat membuka status dan mengirim pesan", async ({ page, request }) => {
  const ticket = await createReport(
    request,
    "Laporan uji E2E untuk alur cek status dan chat dua arah.",
  );

  await page.goto("/status");
  await page.getByLabel("Tiket").fill(ticket);
  await page.getByRole("button", { name: "Buka laporan" }).click();

  await expect(page.getByRole("heading", { name: "Status laporanmu" })).toBeVisible();
  await expect(page.getByText("Diterima", { exact: true })).toBeVisible();
  expect(page.url()).not.toContain(ticket);

  const message = "Pesan uji E2E dari pelapor. Mohon ditindaklanjuti.";
  await page.getByLabel("Tulis pesan").fill(message);
  await page.getByRole("button", { name: "Kirim pesan" }).click();
  await expect(page.getByText(message)).toBeVisible();
});

test("admin dapat membalas laporan pelapor", async ({ page, request }) => {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL;
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  test.skip(!email || !password, "Akun seed belum diisi di .env.");

  const ticket = await createReport(
    request,
    "Laporan uji E2E untuk alur balasan admin dari panel.",
  );

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email as string);
  await page.getByLabel("Password").fill(password as string);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/laporan");
  await page.getByRole("link", { name: /^#/ }).first().click();
  await expect(page.getByRole("heading", { name: "Kronologi" })).toBeVisible();

  const reply = "Balasan uji E2E dari petugas. Terima kasih sudah melapor.";
  await page.getByLabel("Balas pelapor").fill(reply);
  await page.getByRole("button", { name: "Kirim balasan" }).click();
  await expect(page.getByLabel("Balas pelapor")).toHaveValue("");
  await expect(page.getByText(reply)).toBeVisible();

  const lookup = await lookupTicket(request, ticket);
  const lastMessage = lookup.messages.at(-1);
  expect(lastMessage?.sender).toBe("ADMIN");
  expect(lastMessage?.body).toBe(reply);
});

test("tombol keluar cepat mengalihkan halaman", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Keluar cepat/i }).click();
  await page.waitForURL(/google\.com/, { timeout: 20_000 });
  expect(page.url()).toContain("google.com");
});

test("quick exit mengalihkan halaman saat Esc ditekan dua kali", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.waitForURL(/google\.com/, { timeout: 20_000 });
  expect(page.url()).toContain("google.com");
});
