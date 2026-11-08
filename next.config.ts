import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js menyisipkan skrip hidrasi inline; nonce akan ditambahkan saat hardening.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const noStore = [{ key: "Cache-Control", value: "no-store, max-age=0" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/", headers: noStore },
      { source: "/api/:path*", headers: noStore },
      { source: "/lapor/:path*", headers: noStore },
      { source: "/lapor", headers: noStore },
      { source: "/status/:path*", headers: noStore },
      { source: "/status", headers: noStore },
    ];
  },
};

export default nextConfig;
