import { beforeEach, describe, expect, it } from "vitest";
import {
  clearFailures,
  consumeFailureSlot,
  limitRequest,
  peekFailures,
  recordFailure,
  releaseFailureSlot,
} from "./ratelimit";

beforeEach(() => {
  process.env.SESSION_SECRET = Buffer.alloc(32, 4).toString("base64");
});

function request(ip: string): Request {
  return new Request("http://localhost/api/test", {
    headers: { "x-real-ip": ip },
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

  it("memakai entri terakhir X-Forwarded-For, bukan yang dikirim klien", () => {
    const namespace = `test-${Math.random()}`;
    const spoof = (head: string) =>
      new Request("http://localhost/api/test", {
        headers: { "x-forwarded-for": `${head}, 192.0.2.30` },
      });

    expect(limitRequest(spoof("1.1.1.1"), namespace, 1, 60_000).allowed).toBe(true);
    expect(limitRequest(spoof("2.2.2.2"), namespace, 1, 60_000).allowed).toBe(false);
  });

  it("membatasi total lintas alamat palsu", () => {
    const namespace = `test-${Math.random()}`;
    for (let index = 0; index < 20; index += 1) {
      expect(
        limitRequest(request(`198.51.100.${index}`), namespace, 1, 60_000).allowed,
      ).toBe(true);
    }
    expect(limitRequest(request("198.51.100.200"), namespace, 1, 60_000).allowed).toBe(
      false,
    );
  });

  it("klien yang sudah kena batas tidak menghabiskan batas global", () => {
    const namespace = `test-${Math.random()}`;
    for (let index = 0; index < 30; index += 1) {
      limitRequest(request("192.0.2.40"), namespace, 1, 60_000);
    }
    expect(limitRequest(request("192.0.2.41"), namespace, 1, 60_000).allowed).toBe(true);
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

  it("consumeFailureSlot mengunci sinkron di atas lima percobaan dan releaseFailureSlot melepas satu slot", () => {
    const namespace = `slot-${Math.random()}`;
    const account = "slot@pelita.local";

    for (let i = 0; i < 5; i += 1) {
      expect(consumeFailureSlot(namespace, account, 5, 60_000).limited).toBe(false);
    }
    expect(consumeFailureSlot(namespace, account, 5, 60_000).limited).toBe(true);

    releaseFailureSlot(namespace, account);
    expect(consumeFailureSlot(namespace, account, 5, 60_000).limited).toBe(false);
    expect(consumeFailureSlot(namespace, account, 5, 60_000).limited).toBe(true);
  });

  it("banjir bucket request publik tidak menghapus lockout kegagalan akun admin", () => {
    const account = `locked-${Math.random()}@pelita.local`;
    for (let i = 0; i < 5; i += 1) {
      expect(consumeFailureSlot("admin-login-account", account, 5, 60_000).limited).toBe(
        false,
      );
    }

    const ns = `flood-${Math.random()}`;
    for (let i = 0; i < 10_050; i += 1) {
      limitRequest(request(`203.0.113.${i % 256}-${i}`), ns, 30, 60_000);
    }

    expect(consumeFailureSlot("admin-login-account", account, 5, 60_000).limited).toBe(
      true,
    );
  });
});
