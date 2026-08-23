const FIELDS = [
  "id",
  "media_type",
  "media_product_type",
  "media_url",
  "thumbnail_url",
  "caption",
  "timestamp",
  "like_count",
  "comments_count",
  "permalink",
].join(",");

function json(body, status = 200, cache = "no-store") {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cache,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function normalize(item) {
  const isVideo = item.media_type === "VIDEO" || item.media_product_type === "REELS";
  const source = item.media_url || item.thumbnail_url;
  if (!source) return null;

  return {
    id: item.id,
    external: true,
    isVideo,
    src: isVideo ? (item.thumbnail_url || source) : source,
    poster: item.thumbnail_url || source,
    media: isVideo ? item.media_url : "",
    alt: (item.caption || (isVideo ? "Instagram reel" : "Instagram photograph")).slice(0, 240),
    likeCount: Number.isFinite(item.like_count) ? item.like_count : null,
    commentsCount: Number.isFinite(item.comments_count) ? item.comments_count : null,
    permalink: item.permalink || "",
    timestamp: item.timestamp || "",
  };
}

export async function onRequestGet({ env }) {
  if (!env.INSTAGRAM_USER_ID || !env.INSTAGRAM_ACCESS_TOKEN) {
    return json({ error: "Instagram integration is not configured" }, 503);
  }

  const version = env.INSTAGRAM_API_VERSION || "v25.0";
  const base = (env.INSTAGRAM_API_BASE || "https://graph.facebook.com").replace(/\/$/, "");
  const url = new URL(`${base}/${version}/${encodeURIComponent(env.INSTAGRAM_USER_ID)}/media`);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("limit", "100");

  try {
    const media = [];
    let after = "";

    // Meta returns at most one page at a time. Follow cursor pagination rather
    // than exposing only the newest page; ten 100-item pages is ample for this
    // studio while still placing a hard ceiling on upstream requests.
    for (let page = 0; page < 10; page += 1) {
      if (after) url.searchParams.set("after", after);
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${env.INSTAGRAM_ACCESS_TOKEN}` },
        cf: { cacheTtl: 600, cacheEverything: true },
      });
      const payload = await response.json();
      if (!response.ok) {
        console.error("Instagram Graph API error", response.status, payload?.error?.type);
        return json({ error: "Instagram could not be reached" }, 502);
      }

      media.push(...(payload.data || []));
      after = payload.paging?.cursors?.after || "";
      if (!after || !payload.paging?.next) break;
    }

    const posts = media.map(normalize).filter(Boolean);
    return json(
      { posts, fetchedAt: new Date().toISOString() },
      200,
      "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
    );
  } catch (error) {
    console.error("Instagram request failed", error);
    return json({ error: "Instagram could not be reached" }, 502);
  }
}
