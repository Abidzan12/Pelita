import { describe, expect, it } from "vitest";
import { readFormData, readJson, RequestTooLargeError } from "./request-body";

function streamOf(text: string, chunkSize = 1024): ReadableStream<Uint8Array> {
  const bytes = new TextEncoder().encode(text);
  let offset = 0;
  return new ReadableStream({
    pull(controller) {
      if (offset >= bytes.length) {
        controller.close();
        return;
      }
      controller.enqueue(bytes.slice(offset, offset + chunkSize));
      offset += chunkSize;
    },
  });
}

// Body tanpa Content-Length, seperti unggahan chunked.
function chunkedRequest(body: ReadableStream<Uint8Array>, contentType: string): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    body,
    headers: { "content-type": contentType },
    duplex: "half",
  } as unknown as RequestInit);
}

describe("readJson", () => {
  it("membaca JSON yang wajar", async () => {
    const request = chunkedRequest(streamOf('{"pesan":"halo"}'), "application/json");
    await expect(readJson(request, 1024)).resolves.toEqual({ pesan: "halo" });
  });

  it("menolak body chunked yang melewati batas", async () => {
    const request = chunkedRequest(
      streamOf(JSON.stringify({ isi: "x".repeat(200_000) })),
      "application/json",
    );
    await expect(readJson(request, 64 * 1024)).rejects.toBeInstanceOf(
      RequestTooLargeError,
    );
  });
});

describe("readFormData", () => {
  it("membaca form multipart yang wajar", async () => {
    const payload = '--x\r\nContent-Disposition: form-data; name="a"\r\n\r\nhalo\r\n--x--\r\n';
    const request = chunkedRequest(streamOf(payload), "multipart/form-data; boundary=x");
    const form = await readFormData(request, 1024);
    expect(form.get("a")).toBe("halo");
  });

  it("menolak form chunked yang melewati batas", async () => {
    const payload =
      '--x\r\nContent-Disposition: form-data; name="a"\r\n\r\n' +
      "y".repeat(200_000) +
      "\r\n--x--\r\n";
    const request = chunkedRequest(streamOf(payload), "multipart/form-data; boundary=x");
    await expect(readFormData(request, 64 * 1024)).rejects.toBeInstanceOf(
      RequestTooLargeError,
    );
  });
});
