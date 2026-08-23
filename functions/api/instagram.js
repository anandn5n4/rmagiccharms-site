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

function count(value) {
  if (Number.isFinite(value)) return value;
  const match = String(value || "").trim().toLowerCase().match(/^([\d.]+)([km])?$/);
  if (!match) return null;
  const multiplier = match[2] === "m" ? 1000000 : match[2] === "k" ? 1000 : 1;
  const result = Math.round(Number(match[1]) * multiplier);
  return result >= 0 ? result : null;
}

function mediaProxy(source) {
  return `/api/instagram-media?url=${encodeURIComponent(source)}`;
}

function normalizePublic(item) {
  if (item.owner?.username !== "r_magic_charms" || !item.src || !item.thumb) return null;
  const isVideo = Boolean(item.isVideo);
  return {
    id: item.id || item.code,
    external: true,
    isVideo,
    src: mediaProxy(item.thumb),
    poster: mediaProxy(item.thumb),
    media: isVideo ? mediaProxy(item.src) : "",
    alt: (item.alt || (isVideo ? "Instagram reel" : "Instagram photograph")).slice(0, 240),
    likeCount: count(item.likeCount),
    commentsCount: count(item.commentCount),
    permalink: item.code
      ? `https://www.instagram.com/${isVideo ? "reel" : "p"}/${item.code}/`
      : "https://www.instagram.com/r_magic_charms/",
    timestamp: item.date || "",
  };
}

async function publicPosts(origin) {
  const posts = [];
  const seen = new Set();
  let cursor = "";

  for (let page = 0; page < 10; page += 1) {
    try {
      const url = new URL("https://imginn.com/api/posts/");
      url.searchParams.set("id", "70367859285");
      if (cursor) url.searchParams.set("cursor", cursor);
      const proxy = new URL("/api/instagram-media", origin);
      proxy.searchParams.set("url", url.toString());
      const response = await fetch(proxy.toString(), {
        headers: { Accept: "application/json" },
        cf: { cacheTtl: 600, cacheEverything: true },
      });
      if (!response.ok) throw new Error(`Public Instagram feed returned ${response.status}`);
      const payload = await response.json();
      for (const item of payload.items || []) {
        const post = normalizePublic(item);
        if (post && !seen.has(post.id)) {
          seen.add(post.id);
          posts.push(post);
        }
      }
      cursor = payload.cursor || "";
      if (!payload.hasNext || !cursor) break;
    } catch (error) {
      // Public pagination is best-effort. One stale cursor must not discard the
      // valid account media collected from all earlier pages.
      if (!posts.length) throw error;
      console.warn("Stopped public Instagram pagination after a partial result", error);
      break;
    }
  }

  return posts;
}

export async function onRequestGet({ env, request }) {
  if (!env.INSTAGRAM_USER_ID || !env.INSTAGRAM_ACCESS_TOKEN) {
    try {
      const posts = await publicPosts(new URL(request.url).origin);
      if (!posts.length) return json({ error: "Public Instagram feed returned no media" }, 502);
      return json(
        { posts, source: "public", fetchedAt: new Date().toISOString() },
        200,
        "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
      );
    } catch (error) {
      console.error("Public Instagram request failed", error);
      return json({ error: "Instagram could not be reached" }, 502);
    }
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
      { posts, source: "official", fetchedAt: new Date().toISOString() },
      200,
      "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
    );
  } catch (error) {
    console.error("Instagram request failed", error);
    return json({ error: "Instagram could not be reached" }, 502);
  }
}
