const ALLOWED_HOSTS = ["imginn.com", "cdninstagram.com"];

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
    const upstream = await fetch(source, {
      headers,
      cf: { cacheTtl: 3600, cacheEverything: !range },
    });
    if (!upstream.ok && upstream.status !== 206) {
      return new Response("Instagram media unavailable", { status: 502 });
    }

    const responseHeaders = new Headers();
    for (const name of ["Content-Type", "Content-Length", "Content-Range", "Accept-Ranges"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
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
