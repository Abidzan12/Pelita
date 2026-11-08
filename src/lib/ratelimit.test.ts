import { beforeEach, describe, expect, it } from "vitest";
import { clearFailures, limitRequest, peekFailures, recordFailure } from "./ratelimit";

beforeEach(() => {
  process.env.SESSION_SECRET = Buffer.alloc(32, 4).toString("base64");
});

function request(ip: string): Request {
  return new Request("http://localhost/api/test", {
    headers: { "x-forwarded-for": `${ip}, 10.0.0.1` },
  });
}

describe("limitRequest", () => {
  it("mengizinkan sampai batas lalu menolak", () => {
    const namespace = `test-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      expect(limitRequest(request("192.0.2.10"), namespace, 3, 60_000).allowed).toBe(
        true,
      );
    }
    const blocked = limitRequest(request("192.0.2.10"), namespace, 3, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("memisahkan batas antar alamat", () => {
    const namespace = `test-${Math.random()}`;
    expect(limitRequest(request("192.0.2.20"), namespace, 1, 60_000).allowed).toBe(true);
    expect(limitRequest(request("192.0.2.21"), namespace, 1, 60_000).allowed).toBe(true);
  });
});

describe("kegagalan login", () => {
  it("mengunci akun setelah lima kegagalan dan membuka setelah dihapus", () => {
    const namespace = `login-${Math.random()}`;
    const account = "contoh@pelita.local";

    for (let index = 0; index < 4; index += 1) {
      recordFailure(namespace, account, 60_000);
    }
    expect(peekFailures(namespace, account, 5).limited).toBe(false);

    recordFailure(namespace, account, 60_000);
    expect(peekFailures(namespace, account, 5).limited).toBe(true);

    clearFailures(namespace, account);
    expect(peekFailures(namespace, account, 5).limited).toBe(false);
  });
});
