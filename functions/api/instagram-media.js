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

export async function onRequestGet({ request }) {
  const source = new URL(request.url).searchParams.get("url");
  if (!source || !allowed(source)) return new Response("Invalid media URL", { status: 400 });

  const headers = new Headers({
    Accept: request.headers.get("Accept") || "*/*",
    Referer: "https://www.instagram.com/",
    "User-Agent": "Mozilla/5.0 (compatible; RMagicCharms/1.0)",
  });
  const range = request.headers.get("Range");
  if (range) headers.set("Range", range);

  try {
    // Only successful replies may be cached. Caching a refusal would pin an
    // empty wall to whichever edge saw it, which is how one device can work
    // perfectly while another never recovers.
    const cache = {
      cacheTtlByStatus: { "200-299": 1800, "300-399": 0, "400-599": 0 },
      cacheEverything: true,
    };
    let upstream = await fetch(source, { headers, cf: range ? undefined : cache });
    // Instagram's mirror refuses a request now and then, and which edge the
    // visitor lands on decides whether they see it. One retry turns that from
    // an empty wall into a brief pause.
    if (!upstream.ok && upstream.status !== 206) {
      upstream = await fetch(source, { headers, cf: { cacheTtl: 0 } });
    }
    if (!upstream.ok && upstream.status !== 206) {
      return new Response(`Instagram media unavailable (${upstream.status})`, {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const responseHeaders = new Headers();
    // Content-Length is deliberately not copied. Instagram's mirror serves the
    // feed gzipped and the runtime hands us the decompressed body, so passing
    // the original length on describes a body that no longer exists and the
    // edge rejects the whole response as invalid. Whether the mirror compresses
    // at all varies between locations, which is why this struck phones and left
    // laptops alone.
    for (const name of ["Content-Type", "Content-Range"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    // iPhones will not begin a video until the server says it accepts byte
    // ranges, so this is stated even when the upstream response omits it.
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Instagram media proxy failed", error);
    return new Response("Instagram media unavailable", { status: 502 });
  }
}
