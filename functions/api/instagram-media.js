const ALLOWED_HOSTS = ["imginn.com", "cdninstagram.com", "fbcdn.net"];

function allowed(source) {
  try {
    const url = new URL(source);
    return url.protocol === "https:" &&
      ALLOWED_HOSTS.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function fail(detail) {
  // The reason travels back to the browser. A proxy that only ever says
  // "unavailable" cannot be diagnosed from the device that is failing.
  return new Response(`Instagram media unavailable: ${detail}`, {
    status: 502,
    headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function onRequestGet({ request }) {
  const source = new URL(request.url).searchParams.get("url");
  if (!source || !allowed(source)) return new Response("Invalid media URL", { status: 400 });

  const range = request.headers.get("Range");
  const headers = new Headers({
    Accept: request.headers.get("Accept") || "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.instagram.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  });
  if (range) headers.set("Range", range);

  let upstream;
  try {
    upstream = await fetch(source, { headers, cf: { cacheTtl: 0 } });
  } catch (error) {
    return fail(`fetch threw ${error && error.name}: ${error && error.message}`);
  }

  if (!upstream.ok && upstream.status !== 206) {
    return fail(`upstream ${upstream.status}`);
  }

  const type = upstream.headers.get("Content-Type") || "application/octet-stream";
  const responseHeaders = new Headers({
    "Content-Type": type,
    // iPhones will not begin a video until the server says it accepts byte
    // ranges, so this is stated even when the upstream response omits it.
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=1800",
    "X-Content-Type-Options": "nosniff",
  });
  const contentRange = upstream.headers.get("Content-Range");
  if (contentRange) responseHeaders.set("Content-Range", contentRange);

  // Video is streamed so a phone can start playing before the file arrives.
  // Everything else is read in full first, because a body that fails midway
  // through a stream escapes this handler entirely and the edge answers with
  // its own 502, leaving nothing behind to explain what went wrong.
  if (/^video\//i.test(type) || range) {
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  }

  try {
    const body = await upstream.arrayBuffer();
    if (!body.byteLength) return fail("upstream sent an empty body");
    return new Response(body, { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    return fail(`body read failed ${error && error.name}: ${error && error.message}`);
  }
}
