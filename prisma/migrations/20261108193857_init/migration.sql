-- CreateEnum
CREATE TYPE "ReporterRole" AS ENUM ('KORBAN', 'SAKSI');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('KEKERASAN_SEKSUAL', 'PERUNDUNGAN', 'KEKERASAN_FISIK', 'LAINNYA');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DITERIMA', 'DIVERIFIKASI', 'DALAM_PENANGANAN', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('PELAPOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SATGAS', 'KONSELOR', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "ticketHash" TEXT NOT NULL,
    "reporterRole" "ReporterRole" NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "incidentDate" TIMESTAMP(3),
    "locationText" TEXT,
    "descEnc" BYTEA NOT NULL,
    "descIv" BYTEA NOT NULL,
    "descTag" BYTEA NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DITERIMA',
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "iv" BYTEA NOT NULL,
    "authTag" BYTEA NOT NULL,
    "sha256" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "adminId" TEXT,
    "bodyEnc" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "tag" BYTEA NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "totpSecret" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounselingSlot" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "mode" TEXT NOT NULL,

    CONSTRAINT "CounselingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounselingBooking" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "bookingHash" TEXT NOT NULL,
    "aliasName" TEXT,
    "contactEnc" BYTEA,
    "contactIv" BYTEA,
    "contactTag" BYTEA,
    "status" TEXT NOT NULL DEFAULT 'DIJADWALKAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CounselingBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HazardPoint" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HazardPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "bodyMd" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_ticketHash_key" ON "Report"("ticketHash");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_storageKey_key" ON "Evidence"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CounselingBooking_slotId_key" ON "CounselingBooking"("slotId");

-- CreateIndex
CREATE UNIQUE INDEX "CounselingBooking_bookingHash_key" ON "CounselingBooking"("bookingHash");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingSlot" ADD CONSTRAINT "CounselingSlot_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounselingBooking" ADD CONSTRAINT "CounselingBooking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "CounselingSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
