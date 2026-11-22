// Batas ukuran body. `Content-Length` hanya jalur cepat; body chunked tetap
// dihitung saat dibaca agar klien tidak bisa melewati batas.
export const MAX_JSON_BODY_BYTES = 64 * 1024;

export class RequestTooLargeError extends Error {
  constructor() {
    super("BODY_TOO_LARGE");
  }
}

function headerTooLarge(request: Request, maxBytes: number): boolean {
  const value = request.headers.get("content-length");
  if (!value) {
    return false;
  }
  const length = Number(value);
  return Number.isFinite(length) && length > maxBytes;
}

async function limitedBody(
  request: Request,
  maxBytes: number,
): Promise<ReadableStream<Uint8Array> | null> {
  if (headerTooLarge(request, maxBytes)) {
    throw new RequestTooLargeError();
  }
  if (!request.body) {
    return null;
  }
  let total = 0;
  return request.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        total += chunk.byteLength;
        if (total > maxBytes) {
          controller.error(new RequestTooLargeError());
        } else {
          controller.enqueue(chunk);
        }
      },
    }),
  );
}

export async function readFormData(request: Request, maxBytes: number): Promise<FormData> {
  const body = await limitedBody(request, maxBytes);
  if (!body) {
    return request.formData();
  }
  return new Response(body, {
    headers: { "content-type": request.headers.get("content-type") ?? "" },
  }).formData();
}

export async function readJson(
  request: Request,
  maxBytes: number = MAX_JSON_BODY_BYTES,
): Promise<unknown> {
  const body = await limitedBody(request, maxBytes);
  if (!body) {
    return request.json();
  }
  return new Response(body, {
    headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
  }).json();
}
