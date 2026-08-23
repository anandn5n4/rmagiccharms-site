const content = window.RMAGIC_CONTENT;
const brand = content.brand;

// Everything visual is described by resources/media.json, generated from
// media-src/ by tools/build_media.py and shipped as media.js. Nothing is
// discovered at runtime, so the site behaves identically on localhost and on
// the static host.
const MEDIA_DATA = window.RMAGIC_MEDIA || { albums: [], site: {}, video: {} };

const siteGroup = name => MEDIA_DATA.site[name] || [];
const sitePhoto = (group, id) => siteGroup(group).find(p => p.id === id) || siteGroup(group)[0] || null;
const HERO_LOOP = MEDIA_DATA.video["hero-loop"] || "";
const albumBySlug = slug => MEDIA_DATA.albums.find(album => album.slug === slug);
const signatureFrames = albumBySlug("signature-frames")?.photos || [];
const signature = id => signatureFrames.find(p => p.id === id) || signatureFrames[0] || null;

// Pinned by media-src/site.json. The pipeline writes the matching
// <link rel=preload> into index.html so the two can never drift apart.
const HERO_POSTER = MEDIA_DATA.heroPoster || signature("together-in-the-hills");

// The cover's real aspect ratio drives the archive layout, so the grid follows
// the photographs instead of a hand-maintained className.
const shapeOf = photo =>
  !photo ? "square" : photo.ratio > 1.2 ? "wide" : photo.ratio < 0.85 ? "portrait" : "square";

const projects = MEDIA_DATA.albums
  .filter(album => album.listed !== false && album.photos.length)
  .map(album => ({
    ...album,
    type: (album.ceremony || "Wedding").toUpperCase(),
    image: album.cover,
    className: shapeOf(album.cover),
  }));

// Drawn from the albums themselves rather than a fixed list, so the social
// grid keeps working as shoots are added and removed. Albums are interleaved
// so the grid opens with a spread of work rather than one whole wedding.
const socialPool = () => {
  const pool = [];
  const albums = MEDIA_DATA.albums.filter(a => a.listed !== false && a.photos.length);
  const deepest = Math.max(0, ...albums.map(a => a.photos.length));
  for (let depth = 0; depth < deepest; depth += 1) {
    for (const album of albums) {
      const photo = album.photos[depth];
      if (photo) pool.push({ photo, album });
    }
  }
  return pool;
};

// A stable pick from the published work, used where the layout wants one strong
// photograph rather than a specific named file.
const featuredPhoto = index => {
  const pool = socialPool();
  return pool.length ? pool[index % pool.length].photo : null;
};

const app = document.querySelector("#app");
const header = document.querySelector("#site-header");
const footer = document.querySelector("#site-footer");

function link(to, label, className = "") {
  return `<a href="#${to}" class="${className}">${label}</a>`;
}

function srcsetFor(photo) {
  return photo.widths.map(w => `${photo.base}-${w}.webp ${w}w`).join(", ");
}

// Pick a concrete file. Callers pass the width they expect to render at; the
// closest published width that can fill it is used as the src fallback.
function photoSrc(photo, width) {
  const widths = photo.widths;
  const pick = width ? widths.find(w => w >= width) || widths[widths.length - 1]
                     : widths[widths.length - 1];
  return `${photo.base}-${pick}.webp`;
}

// `sizes` tells the browser how wide the image will actually be rendered, which
// is what lets a phone download the 400px file instead of the desktop one.
function image(photo, alt, className = "", sizes = "(max-width: 720px) 100vw, (max-width: 1200px) 60vw, 45vw") {
  if (!photo) return "";
  const eager = className.includes("eager");
  return `<img class="${className}" src="${photoSrc(photo)}" srcset="${srcsetFor(photo)}" sizes="${sizes}"
    width="${photo.w}" height="${photo.h}" style="--tint:${photo.tint}"
    alt="${alt || photo.alt || ""}" loading="${eager ? "eager" : "lazy"}" decoding="async"${eager ? ' fetchpriority="high"' : ""} />`;
}

function renderHeader() {
  header.innerHTML = `
    <a href="#home" class="wordmark" aria-label="R Magic Charms home"><img class="brand-mark" src="${photoSrc(sitePhoto("brand", "r-magic-charms-mark"), 400)}" alt="" /><span class="wordmark-text">R Magic Charms</span></a>
    <div class="header-right">
      <button class="menu-toggle" aria-expanded="false" aria-controls="primary-nav"><i></i><i></i><span>Menu</span></button>
      <nav id="primary-nav" aria-label="Main navigation">
        ${link("work", "Work")}
        ${link("about", "Studio")}
        ${link("contact", "Check availability", "nav-cta")}
      </nav>
    </div>`;
  header.querySelector(".menu-toggle").addEventListener("click", toggleMenu);
}

function renderFooter() {
  footer.innerHTML = `
    <div class="footer-main">
      <div class="footer-brand"><img src="${photoSrc(sitePhoto("brand", "r-magic-charms-logo"), 400)}" alt="R Magic Charms" /><p>South Indian wedding photography, rooted in Karnataka.</p></div>
      <div><p class="eyebrow">BASED IN</p><a href="${brand.mapUrl}" target="_blank" rel="noreferrer">${brand.location} ↗</a><p>Available across India and worldwide.</p></div>
      <div><p class="eyebrow">CONNECT</p><a href="tel:+${brand.phoneDigits}">${brand.phoneDisplay}</a><a href="https://www.instagram.com/${brand.instagram}" target="_blank" rel="noreferrer">@${brand.instagram}</a></div>
    </div>
    <div class="footer-bottom"><p>© ${new Date().getFullYear()} R MAGIC CHARMS</p><p>Karnataka · India · Available worldwide</p></div>`;
}

function renderSocialRail() {
  const rail = document.querySelector("#socialRail");
  const icons = {
    instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="fill"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.5 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.6 1.4c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.3-6.1-3.6-8.4Zm-8.3 18.2c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.7 9.7 0 1 1 8.5 4.7Zm5.3-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.2-3.7-.3-.6.3-.5.9-1.8.1-.2 0-.4 0-.6l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.1.2 2.4 3.7 5.9 5.2 2.2.9 3.1 1 4.2.8.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.4-.2-.7-.3Z"/></svg>`,
  };
  const links = [
    { href: `https://www.instagram.com/${brand.instagram}`, icon: icons.instagram, name: "Instagram", className: "instagram", external: true },
  ];
  rail.innerHTML = `
    <a class="dock-chat" href="https://wa.me/${brand.phoneDigits}?text=${encodeURIComponent("Namaste R Magic Charms, we are planning our wedding and would like to discuss photography.")}" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">${icons.whatsapp}<b>Chat</b></a>
    <div class="dock-icons">${links.map(({ href, icon, name, className, external }) => `<a class="${className}" href="${href}"${external ? ' target="_blank" rel="noreferrer"' : ""} aria-label="${name}" title="${name}">${icon}</a>`).join("")}</div>`;
}

function toggleMenu() {
  const button = header.querySelector(".menu-toggle");
  const isOpen = header.classList.toggle("menu-open");
  button.setAttribute("aria-expanded", String(isOpen));
}

function closeMenu() { header.classList.remove("menu-open"); header.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false"); }

function pageFrame(kicker, title, copy) {
  return `<section class="page-intro reveal"><p class="eyebrow">${kicker}</p><h1>${title}</h1>${copy ? `<p class="intro-copy">${copy}</p>` : ""}</section>`;
}

// Repository-hosted gallery: fast and reliable on static Cloudflare Pages.
// Every video dropped into media-src/video ships as a reel, and every album
// photograph fills the rest, so nothing here needs editing when a shoot or a
// reel is added — the manifest is the only source of truth.
const REELS = Object.entries(MEDIA_DATA.video || {})
  .sort(([a], [b]) => (a === "hero-loop" ? -1 : b === "hero-loop" ? 1 : a.localeCompare(b)))
  .map(([id, src]) => ({ id, src }));

// Reels are spread through the wall instead of stacked at the top, so it reads
// like a feed rather than a video row followed by a block of photographs.
const REEL_EVERY = 5;

const LOCAL_INSTA_POSTS = (() => {
  const photos = socialPool();
  const queue = [...REELS];
  const posts = [];
  // A reel takes the slot of the photograph it displaces and borrows it as its
  // poster, so the tile always has something to show before it starts playing.
  const reelPost = (reel, { photo, album }) => ({
    src: photo,
    alt: `${album.title} — film`,
    code: album.slug,
    isVideo: true,
    media: reel.src,
  });

  photos.forEach((entry, index) => {
    if (queue.length && index % REEL_EVERY === 0) {
      posts.push(reelPost(queue.shift(), entry));
      return;
    }
    posts.push({
      src: entry.photo,
      alt: `${entry.photo.alt} — ${entry.album.title}`,
      code: entry.album.slug,
      isVideo: false,
      media: "",
    });
  });

  // More films than the spacing could absorb: the remainder still gets shown
  // rather than silently dropped.
  queue.forEach((reel, offset) => {
    if (!photos.length) return;
    posts.push(reelPost(reel, photos[offset % photos.length]));
  });

  return posts;
})();

const escapeHtml = value => String(value || "").replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

async function instagramPosts() {
  try {
    const response = await fetch("/api/instagram", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Instagram API returned ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.posts) || !payload.posts.length) throw new Error("Instagram API returned no media");
    return { posts: payload.posts, live: true, source: payload.source };
  } catch (error) {
    console.warn("Using the studio media archive because live Instagram media is unavailable.", error);
    return { posts: LOCAL_INSTA_POSTS, live: false, source: "local" };
  }
}

async function populateInstaGrid(page) {
  const grid = document.getElementById("instaGrid");
  if (!grid) return;
  const moreButton = document.getElementById("instaMore");
  const soundToggle = document.getElementById("reelSoundToggle");
  const status = document.getElementById("instaStatus");
  const { posts, live, source } = await instagramPosts();
  if (status) status.textContent = live
    ? (source === "official" ? "Live via Instagram API" : "Live from public Instagram")
    : "Studio media archive";
  const batchSize = 12;
  const homePreview = page === "home";
  let visibleCount = 0;
  let reelSoundEnabled = false;

  // Phones and tablets never fire mouseenter, so on those the reels used to
  // sit there as still frames and look like ordinary photographs. There they
  // play themselves whenever they scroll into view instead.
  const hoverless = window.matchMedia("(hover: none)").matches;
  const startReel = preview => {
    grid.querySelectorAll(".insta-preview").forEach(other => {
      if (other !== preview) other.pause();
    });
    if (!preview.src) {
      preview.src = preview.dataset.src;
      preview.load();
    }
    preview.muted = !reelSoundEnabled;
    preview.play().catch(() => {});
  };

  const autoplayInView = hoverless && "IntersectionObserver" in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const preview = entry.target;
          if (entry.isIntersecting) startReel(preview);
          else preview.pause();
        });
      }, { threshold: 0.6 })
    : null;

  soundToggle?.addEventListener("click", () => {
    reelSoundEnabled = !reelSoundEnabled;
    soundToggle.classList.toggle("active", reelSoundEnabled);
    soundToggle.setAttribute("aria-pressed", String(reelSoundEnabled));
    soundToggle.querySelector("span").textContent = reelSoundEnabled ? "♫" : "♪";
    soundToggle.querySelector("b").textContent = reelSoundEnabled ? "Reel sound on" : "Enable reel sound";
    grid.querySelectorAll(".insta-preview").forEach(preview => {
      preview.muted = !reelSoundEnabled;
    });
  });

  const renderPosts = additions => {
    const startIndex = visibleCount;
    grid.insertAdjacentHTML("beforeend", additions.map((p, offset) => {
      const alt = escapeHtml(p.alt);
      const poster = p.external ? escapeHtml(p.poster || p.src) : photoSrc(p.src, 400);
      const photo = p.external
        ? `<img src="${escapeHtml(p.src)}" alt="${alt}" loading="lazy" decoding="async" />`
        : image(p.src, p.alt, "", "(max-width: 720px) 45vw, 300px");
      const likes = Number.isFinite(p.likeCount) ? `♥ ${p.likeCount.toLocaleString()}` : "♡ View";
      return `
    <button type="button" class="insta-cell${p.isVideo ? " insta-video" : ""}" data-insta-index="${startIndex + offset}" aria-label="${p.isVideo ? "Play reel" : "View photo"}: ${alt}">
      ${p.isVideo
        ? `<video class="insta-preview" muted loop playsinline preload="none" poster="${poster}" data-src="${escapeHtml(p.media)}"></video>`
        : photo}
      <span class="insta-hover"><b>${p.isVideo ? `▶ Film${Number.isFinite(p.likeCount) ? ` · ♥ ${p.likeCount.toLocaleString()}` : ""}` : likes}</b><small>${p.isVideo ? "Tap to open" : "View photograph"}</small></span>
    </button>`;
    }).join(""));
    const cells = [...grid.querySelectorAll("[data-insta-index]")].slice(startIndex);
    cells.forEach(cell => {
    cell.addEventListener("click", () => openInstaViewer(posts[Number(cell.dataset.instaIndex)]));
    const preview = cell.querySelector(".insta-preview");
    if (preview) {
      if (autoplayInView) autoplayInView.observe(preview);
      cell.addEventListener("mouseenter", () => startReel(preview));
      cell.addEventListener("mouseleave", () => preview.pause());
    }
  });
    visibleCount += additions.length;
    if (moreButton) moreButton.hidden = visibleCount >= posts.length;
  };

  grid.innerHTML = "";
  const loadMore = () => renderPosts(posts.slice(visibleCount, visibleCount + batchSize));
  loadMore();
  if (homePreview) return;
  moreButton?.addEventListener("click", loadMore);

  // Keep loading as the visitor scrolls, so the whole archive is reachable
  // without repeated clicking. The button stays as the fallback and as the
  // signal that there is more to see.
  if (moreButton && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      if (visibleCount >= posts.length) {
        observer.disconnect();
        return;
      }
      loadMore();
    }, { rootMargin: "600px 0px" });
    observer.observe(moreButton);
  }
}

function openInstaViewer(post) {
  document.querySelectorAll(".insta-preview").forEach(preview => preview.pause());
  const viewer = document.createElement("div");
  viewer.className = "insta-viewer";
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-label", post.isVideo ? "Instagram reel player" : "Instagram photo viewer");
  const poster = post.external ? escapeHtml(post.poster || post.src) : photoSrc(post.src, 900);
  const photograph = post.external
    ? `<img src="${escapeHtml(post.src)}" alt="${escapeHtml(post.alt)}">`
    : `<img src="${photoSrc(post.src)}" srcset="${srcsetFor(post.src)}" sizes="90vw" alt="${post.alt}">`;
  viewer.innerHTML = `
    <button class="insta-viewer-close" type="button" aria-label="Close">×</button>
    <div class="insta-viewer-content">
      ${post.isVideo
        ? `<video controls autoplay playsinline poster="${poster}"><source src="${escapeHtml(post.media)}" type="video/mp4"></video>`
        : photograph}
      <div class="insta-viewer-caption">
        <p>${escapeHtml(post.alt)}${Number.isFinite(post.likeCount) ? ` · ♥ ${post.likeCount.toLocaleString()}` : ""}</p>
        ${post.permalink ? `<a href="${escapeHtml(post.permalink)}" target="_blank" rel="noreferrer">Open on Instagram ↗</a>` : ""}
      </div>
    </div>`;
  document.body.appendChild(viewer);
  const close = () => {
    viewer.querySelector("video")?.pause();
    viewer.remove();
    document.removeEventListener("keydown", onKeydown);
  };
  const onKeydown = event => { if (event.key === "Escape") close(); };
  viewer.querySelector(".insta-viewer-close").addEventListener("click", close);
  viewer.addEventListener("click", event => { if (event.target === viewer) close(); });
  document.addEventListener("keydown", onKeydown);
}

function home() {
  return `
    <section class="hero hero-video">
      <div class="hero-video-wrap">
        <video class="hero-vid" autoplay muted loop playsinline preload="none" poster="${photoSrc(HERO_POSTER, 1600)}" data-src="${HERO_LOOP}"></video>
        <div class="hero-video-overlay"></div>
      </div>
      <!-- Animated circle badge (like WeddingBells) -->
      <div class="hero-badge" aria-hidden="true">
        <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="hero-badge-ring">
          <path id="circlePath" d="M110,110 m-95,0 a95,95 0 1,1 190,0 a95,95 0 1,1 -190,0"/>
          <text class="hero-badge-text"><textPath href="#circlePath" startOffset="0">
            R MAGIC CHARMS · PHOTOGRAPHY · SOUTH INDIAN WEDDINGS ·&nbsp;
          </textPath></text>
        </svg>
        <span class="hero-badge-center">◆</span>
      </div>
      <p class="hero-overline">SOUTH INDIAN WEDDING PHOTOGRAPHY <span>BY R MAGIC CHARMS</span></p>
      <div class="hero-copy">
        <p class="hero-small">SACRED RITUALS · FAMILY BLESSINGS · AUSPICIOUS BEGINNINGS</p>
        <h1>Two families.<br><em>One blessed beginning.</em></h1>
        <div class="hero-actions">
          <a class="hero-cta" href="#contact">Share your wedding story</a>
          <button class="hero-sound-toggle" id="heroSoundToggle" type="button" aria-pressed="false"><span>▶</span><b>Play film sound</b></button>
        </div>
      </div>
      <a class="scroll-note" href="#offerings">SCROLL <span>↓</span></a>
      <div class="hero-side-note">NALANGU · HALDI · MEHENDI<br>MUHURTHAM · SANGEET · RECEPTION</div>
    </section>

    <!-- OFFERINGS -->
    <section class="offerings" id="offerings">
      <div class="offerings-heading">
        <div><p class="eyebrow">01 / WHAT WE CREATE</p><h2>Every celebration,<br><em>beautifully remembered.</em></h2></div>
        <p>Thoughtful photography for intimate rituals, joyful gatherings and everything surrounding your family's milestone.</p>
      </div>
      <div class="offerings-grid">
        <article class="offering-card offering-large">
          ${image(sitePhoto("offerings", "mehendi"), "Intricate bridal mehendi being applied")}
          <span class="offering-number">01</span><div><p>COLOUR · LAUGHTER · FAMILY</p><h3>Mehendi &amp; Haldi</h3><b>Explore coverage ↗</b></div>
          <a class="offering-hit" href="#contact" aria-label="Enquire about Mehendi and Haldi coverage"></a>
          <a class="offering-credit" href="https://commons.wikimedia.org/wiki/File:Indian_Folk_Mehndi_Ceremony_(3).jpg" target="_blank" rel="noreferrer">AmanAgrahari01 · CC BY-SA 4.0</a>
        </article>
        <article class="offering-card offering-prewed">
          ${image(sitePhoto("offerings", "pre-wedding"), "Pre-wedding portrait session by R Magic Charms")}
          <span class="offering-number">02</span>
          <div><p>SAVE THE DATE · OUTDOOR · CINEMATIC</p><h3>Pre-Wedding Shoots</h3><b>Plan your shoot ↗</b></div>
          <a class="offering-hit" href="#contact" aria-label="Enquire about pre-wedding photography"></a>
        </article>
        <article class="offering-card offering-reception">
          ${image(sitePhoto("offerings", "reception"), "Indian couple at their wedding reception")}
          <span class="offering-number">03</span><div><p>ELEGANCE · PORTRAITS · TOASTS</p><h3>Reception Stories</h3><b>Explore coverage ↗</b></div>
          <a class="offering-hit" href="#contact" aria-label="Enquire about reception photography"></a>
          <a class="offering-credit" href="https://commons.wikimedia.org/wiki/File:Indian_couple_at_wedding_reception.png" target="_blank" rel="noreferrer">Gargiekulkarni · CC BY-SA 4.0</a>
        </article>
        <article class="offering-card offering-couple">
          ${image(sitePhoto("offerings", "couple-shoot"), "Indian couple during a pre-wedding portrait session")}
          <span class="offering-number">04</span><div><p>UNHURRIED · AFTER THE RUSH</p><h3>Post-Wedding Portraits</h3><b>Plan your session ↗</b></div>
          <a class="offering-hit" href="#contact" aria-label="Enquire about post-wedding couple portraits"></a>
          <a class="offering-credit" href="https://commons.wikimedia.org/wiki/File:Couple_Photoshoot_at_The_Lodhi_Garden.jpg" target="_blank" rel="noreferrer">Akarshan Sapra · CC BY-SA 4.0</a>
        </article>
        <article class="offering-card offering-drone">
          ${image(sitePhoto("offerings", "drone-venue"), "Aerial view of an Indian palace venue")}
          <span class="offering-number">05</span><div><p>AERIAL PORTRAITS · GRAND PERSPECTIVES</p><h3>Drone Photography</h3><b>See the possibilities ↗</b></div>
          <a class="offering-hit" href="#contact" aria-label="Enquire about drone wedding coverage"></a>
          <a class="offering-credit" href="https://commons.wikimedia.org/wiki/File:Aerial_View_Umaid_Mahal_Jodhpur.jpg" target="_blank" rel="noreferrer">Daniel Romanson · CC0</a>
        </article>
        <article class="offering-card offering-complete">
          ${image(sitePhoto("offerings", "south-indian-wedding"), "Traditional South Indian wedding ceremony")}
          <span class="offering-number">06</span><div><p>FROM NAANDI TO RECEPTION</p><h3>Complete Wedding Stories</h3><b>Build your collection ↗</b></div>
          <a class="offering-hit" href="#contact" aria-label="Enquire about complete wedding coverage"></a>
          <a class="offering-credit" href="https://commons.wikimedia.org/wiki/File:Traditional_South_Indian_Wedding_Ceremony.jpg" target="_blank" rel="noreferrer">Bhavya Bubbles · CC BY-SA 4.0</a>
        </article>
      </div>
    </section>

    <!-- SELECTED WORK -->
    <section class="selected-work">
      <div class="section-heading">
        <p class="eyebrow">02 / WEDDING STORIES</p>
        ${link("work", "Explore the archive <span>↗</span>", "text-link")}
      </div>
      <div class="featured-project reveal">
        ${image(projects[0].image, `${projects[0].title} — ${projects[0].location}`)}
        <div class="project-overlay">
          <p class="eyebrow">${projects[0].type} · ${projects[0].year}</p>
          <h3>${projects[0].title}</h3>
          ${link(`story/${projects[0].slug}`, "View story <span>↗</span>", "project-link")}
        </div>
      </div>
      <div class="work-pair">
        ${projectCard(projects[1])}${projectCard(projects[2])}
      </div>
    </section>

    <!-- STATEMENT -->
    <section class="statement-band">
      <div class="statement-copy">
        <p class="eyebrow">03 / ROOTED IN TRADITION</p>
        <p class="statement-mangalam">MANGALAM</p>
        <h2>Sacred vows.<br>Generations gathered.<br><em>A lifetime begins.</em></h2>
        <p class="statement-caption">Under the sacred canopy, every prayer, promise and blessing becomes part of a story carried forward for generations.</p>
      </div>
      <div class="statement-visual" aria-hidden="true">
        <div class="statement-rings"></div>
        <div class="statement-arch">${image(featuredPhoto(1), "Auspicious South Indian wedding ceremony")}</div>
        <p>RITUAL · BLESSING · UNION</p>
      </div>
    </section>

    <!-- INSTAGRAM GRID -->
    <section class="insta-section">
      <div class="insta-header">
        <div>
          <p class="eyebrow">04 / AS SEEN ON INSTAGRAM</p>
          <h2>Recent <em>celebrations</em></h2>
        </div>
        <div class="insta-actions">
          <button type="button" class="reel-sound-toggle" id="reelSoundToggle" aria-pressed="false"><span>♪</span><b>Enable reel sound</b></button>
          <span class="insta-status" id="instaStatus">Connecting to Instagram…</span>
          <a href="https://www.instagram.com/r_magic_charms" target="_blank" rel="noreferrer" class="text-link insta-handle">@r_magic_charms <span>↗</span></a>
        </div>
      </div>
      <div class="insta-grid" id="instaGrid">
        ${Array(12).fill(0).map(() => `<div class="insta-cell insta-shimmer"></div>`).join("")}
      </div>
      <div class="insta-footer">
        ${link("social", "View all films &amp; frames <span>↗</span>", "big-link insta-more")}
      </div>
    </section>

    `;
}

function social() {
  return `
    ${pageFrame("FILMS & FRAMES", "The social <em>archive.</em>", "Reels and photographs from recent celebrations. New media added to the studio library appears here automatically.")}
    <section class="insta-section social-archive">
      <div class="insta-header">
        <div>
          <p class="eyebrow">THE COMPLETE WALL</p>
          <h2>Stories in <em>motion &amp; stills</em></h2>
        </div>
        <div class="insta-actions">
          <button type="button" class="reel-sound-toggle" id="reelSoundToggle" aria-pressed="false"><span>♪</span><b>Enable reel sound</b></button>
          <span class="insta-status" id="instaStatus">Connecting to Instagram…</span>
          <a href="https://www.instagram.com/r_magic_charms" target="_blank" rel="noreferrer" class="text-link insta-handle">@r_magic_charms <span>↗</span></a>
        </div>
      </div>
      <div class="insta-grid" id="instaGrid">
        ${Array(12).fill(0).map(() => `<div class="insta-cell insta-shimmer"></div>`).join("")}
      </div>
      <div class="insta-footer">
        <button type="button" class="big-link insta-more" id="instaMore" hidden><b>Load more</b><span>↓</span></button>
      </div>
    </section>`;
}

function projectCard(project) {
  const count = project.photos.length;
  return `<article class="project-card ${project.className} reveal" data-category="${project.filter || "all"}" style="--tint:${project.cover.tint}">
    ${image(project.image, project.title, "", "(max-width: 720px) 92vw, (max-width: 1100px) 46vw, 32vw")}
    <div>
      <p class="eyebrow">${project.type}</p>
      <h3>${project.title}</h3>
      <p class="project-location">${project.location} · ${project.year}</p>
      <p class="project-count">${count} ${count === 1 ? "frame" : "frames"}</p>
    </div>
    ${link(`story/${project.slug}`, `Open ${project.title}`, "card-hit")}
  </article>`;
}

function work() {
  const frames = projects.reduce((total, project) => total + project.photos.length, 0);
  return `${pageFrame("THE WEDDING ARCHIVE / 2019—NOW", "Tradition, joy and<br><em>blessed beginnings.</em>", "Nalangu laughter, turmeric in the morning sun, intricate mehendi, the sacred muhurtham and generations gathered in blessing. Every wedding is preserved as one complete family story.")}
  <section class="archive-meta reveal"><span>${projects.length} ${projects.length === 1 ? "story" : "stories"}</span><i></i><span>${frames} frames</span><i></i><span>Newest first</span></section>
  <section class="work-grid">${projects.map(projectCard).join("")}</section>`;
}

// A justified gallery: every figure grows in proportion to the photograph's own
// aspect ratio, so rows fill the width without any image being cropped or any
// layout shifting once the files arrive.
function storyGallery(album) {
  const figures = album.photos.map((photo, index) => `
    <figure style="--r:${photo.ratio}; --tint:${photo.tint}">
      <button type="button" class="gallery-open" data-photo="${index}" aria-label="Open ${photo.alt}">
        ${image(photo, photo.alt, "", "(max-width: 720px) 100vw, (max-width: 1200px) 60vw, 42vw")}
      </button>
      ${photo.caption ? `<figcaption>${photo.caption}</figcaption>` : ""}
    </figure>`).join("");

  return `<div class="gallery-justified">${figures}<i class="gallery-filler" aria-hidden="true"></i></div>`;
}

function story(slug) {
  const album = projects.find(p => p.slug === slug) || projects[0];
  if (!album) return notFound();

  const quote = album.quote || "The pictures gave us back the day we were too full of joy to fully see.";
  const quoteAuthor = album.quoteAuthor || "— AN R MAGIC CHARMS COUPLE";
  const nextAlbum = projects[(projects.indexOf(album) + 1) % projects.length];
  const intro = album.story || "A union blessed by family, tradition and sacred ritual. We preserve the silk, flowers, prayers and unrepeatable moments that make every auspicious celebration entirely its own.";

  return `
    <section class="story-hero">${image(album.image, album.title, "eager", "100vw")}<a class="back-link" href="#work">← &nbsp; Back to work</a><div><p class="eyebrow">${album.type} / ${album.year}</p><h1>${album.title}</h1><p>${album.location}</p></div></section>
    <section class="story-intro"><p class="eyebrow">THE WEDDING STORY</p><p>${intro}</p></section>
    <section class="story-gallery">
      ${storyGallery(album)}
      <blockquote>"${quote}"<cite>${quoteAuthor}</cite></blockquote>
    </section>
    <section class="next-project"><p class="eyebrow">NEXT STORY</p>${link(`story/${nextAlbum.slug}`, `<span>${nextAlbum.title}</span> <i>↗</i>`, "next-link")}</section>`;
}

// Full-screen viewer for a story gallery, with keyboard navigation and
// neighbour preloading so stepping through an album never stalls.
function bindGalleryLightbox(album) {
  const triggers = [...document.querySelectorAll(".gallery-open")];
  if (!triggers.length) return;
  const photos = album.photos;

  let index = 0;
  let overlay = null;

  const preload = position => {
    const photo = photos[position];
    if (!photo) return;
    const img = new Image();
    img.src = photoSrc(photo, 1600);
  };

  const show = position => {
    index = (position + photos.length) % photos.length;
    const photo = photos[index];
    overlay.querySelector(".lightbox-figure").innerHTML =
      `<img src="${photoSrc(photo, 1600)}" srcset="${srcsetFor(photo)}" sizes="92vw" alt="${photo.alt}" style="--r:${photo.ratio}">`;
    overlay.querySelector(".lightbox-caption").textContent = photo.caption || photo.alt;
    overlay.querySelector(".lightbox-count").textContent = `${index + 1} / ${photos.length}`;
    preload(index + 1);
    preload(index - 1);
  };

  const close = () => {
    overlay?.remove();
    overlay = null;
    document.removeEventListener("keydown", onKeydown);
    document.body.classList.remove("lightbox-open");
  };

  const onKeydown = event => {
    if (event.key === "Escape") close();
    else if (event.key === "ArrowRight") show(index + 1);
    else if (event.key === "ArrowLeft") show(index - 1);
  };

  const open = position => {
    overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", `${album.title} gallery`);
    overlay.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close">×</button>
      <button class="lightbox-nav prev" type="button" aria-label="Previous photograph">‹</button>
      <button class="lightbox-nav next" type="button" aria-label="Next photograph">›</button>
      <div class="lightbox-stage"><div class="lightbox-figure"></div>
        <div class="lightbox-meta"><p class="lightbox-caption"></p><span class="lightbox-count"></span></div>
      </div>`;
    document.body.appendChild(overlay);
    document.body.classList.add("lightbox-open");
    overlay.querySelector(".lightbox-close").addEventListener("click", close);
    overlay.querySelector(".prev").addEventListener("click", () => show(index - 1));
    overlay.querySelector(".next").addEventListener("click", () => show(index + 1));
    overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
    document.addEventListener("keydown", onKeydown);
    show(position);
  };

  triggers.forEach(trigger =>
    trigger.addEventListener("click", () => open(Number(trigger.dataset.photo))));
}

function about() {
  return `
  <section class="about-photo-hero">
    <div class="about-hero-inner">
      <figure class="about-photo-frame">
        ${image(sitePhoto("about", "photographer-at-work"), "The R Magic Charms photographer at work")}
      </figure>
      <div class="about-photo-text">
        <p class="eyebrow">THE PEOPLE BEHIND THE LENS</p>
        <h1>Honouring tradition.<br>Preserving <em>every blessing.</em></h1>
        <p class="about-hero-lede">We are a small Bengaluru team who photograph South Indian weddings the way families actually live them — the kashi yatra teasing, the mangalsutra moment, the aunt who cries every single time.</p>
        <div class="about-hero-meta">
          <div><b>Bengaluru</b><span>BASED · TRAVELLING ALL INDIA</span></div>
          <div><b>Kannada · Tamil</b><span>TELUGU · MALAYALAM · HINDI</span></div>
        </div>
        <a class="about-hero-cta" href="#contact">Check your date <span>→</span></a>
      </div>
    </div>
  </section>

  <section class="stat-band reveal">
    <div><b>200+</b><span>CELEBRATIONS PHOTOGRAPHED</span></div>
    <div><b>7</b><span>YEARS BEHIND THE LENS</span></div>
    <div><b>20+</b><span>CITIES TRAVELLED</span></div>
    <div><b>100%</b><span>RITUALS UNINTERRUPTED</span></div>
  </section>

  <section class="about-portrait">
    <figure class="framed-photo">
      ${image(sitePhoto("about", "photographer-at-work"), "The R Magic Charms team photographing a celebration")}
      <figcaption>On the mantap, working quietly · Karnataka</figcaption>
    </figure>
    <p>R Magic Charms is a South Indian wedding photography team devoted to preserving auspicious beginnings with grace and authenticity.<br><br>We understand that a wedding is more than one day: it is sacred ritual, ancestral tradition, joyful celebration and two families becoming one.</p>
  </section>

  <section class="strip">
    <div class="section-heading">
      <p class="eyebrow">WHERE WE WORK</p>
      <span class="heading-note">Temples, palaces &amp; hill country</span>
    </div>
    <div class="strip-grid">
      <figure>${image(sitePhoto("editorial", "hampi-temple"), "Temple architecture at Hampi")}<figcaption>Temple weddings</figcaption></figure>
      <figure>${image(sitePhoto("editorial", "mysuru-palace"), "Mysuru Palace")}<figcaption>Palace celebrations</figcaption></figure>
      <figure>${image(sitePhoto("editorial", "western-ghats"), "The Western Ghats")}<figcaption>Hill-country shoots</figcaption></figure>
    </div>
  </section>

  <section class="ritual-context">
    <div><p class="eyebrow">ROOTED IN KARNATAKA</p><h2>We understand the meaning<br>before we frame the moment.</h2><p>Naandi begins the festivities with prayer. Arishina brings turmeric, laughter and blessing. Kashi Yatre makes room for playfulness; jeerige bella speaks of sharing life's sweetness and challenges. Through dhaare, saptapadi and the auspicious muhurtha, we work quietly and respectfully around the people who matter most.</p></div>
    <div class="ritual-terms"><span>NAANDI</span><span>ARISHINA</span><span>KASHI YATRE</span><span>JEERIGE BELLA</span><span>DHAARE</span><span>SAPTAPADI</span></div>
  </section>

  <section class="quote-band">
    ${image(sitePhoto("portfolio", "wedding-blessing-ritual"), "Elders blessing the couple at a South Indian wedding")}
    <div class="quote-band-scrim"></div>
    <blockquote>
      <p class="eyebrow">WHAT WE BELIEVE</p>
      <p>“A wedding photograph should feel like the room felt — not like a photograph.”</p>
      <cite>R Magic Charms</cite>
    </blockquote>
  </section>

  <section class="coverage">
    <div class="section-heading">
      <p class="eyebrow">WHAT WE COVER</p>
      <span class="heading-note">Photography with intention</span>
    </div>
    <ul class="coverage-grid">
      ${["Pre-Wedding","Engagement","Haldi","Mehendi","Wedding","Reception","Couple Shoot","Candid Moments","Bridal Portraits","Groom Portraits","Family &amp; Friends","Post-Wedding"]
        .map((event, index) => `<li class="lift"><span>${String(index + 1).padStart(2, "0")}</span><b>${event}</b></li>`).join("")}
    </ul>
  </section>

  <section class="promise">
    <div class="section-heading"><p class="eyebrow">OUR PROMISE TO YOUR FAMILY</p></div>
    <div class="promise-grid">
      <div class="lift"><b>The mantap comes first</b><p>We never ask a purohit to pause, or a couple to repeat a ritual, for the sake of a photograph.</p></div>
      <div class="lift"><b>Your elders are seen</b><p>Grandparents, aunts and the family who travelled far are photographed with the same care as the couple.</p></div>
      <div class="lift"><b>Nothing is lost</b><p>Every frame is backed up twice on the day itself, before we leave your venue.</p></div>
      <div class="lift"><b>You are never chased</b><p>Clear timelines, honest pricing and one point of contact from enquiry to final delivery.</p></div>
    </div>
  </section>

  ${ctaBand("Let us hear about your celebration.", "Share your dates and ceremonies, and we will tell you honestly whether we are the right team for your family.")}`;
}

function ctaBand(title, copy) {
  return `
  <section class="cta-band reveal">
    <div>
      <p class="eyebrow">START THE CONVERSATION</p>
      <h2>${title}</h2>
      <p>${copy}</p>
    </div>
    <div class="cta-band-actions">
      <a class="cta-primary" href="https://wa.me/${brand.phoneDigits}?text=${encodeURIComponent("Namaste R Magic Charms, we are planning our wedding and would like to discuss photography.")}" target="_blank" rel="noreferrer">Message us on WhatsApp <span>↗</span></a>
      ${link("contact", "Send a full enquiry <span>↓</span>", "cta-secondary")}
    </div>
  </section>`;
}

const IS_LOCAL_PREVIEW = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);

function enquirySection() {
  const emailLink = brand.email ? `<a href="mailto:${brand.email}">${brand.email}</a>` : "";
  return `
  <section class="contact-anchor" id="enquiry">
    <section class="contact-choice"><p class="eyebrow">CHOOSE HOW TO REACH US</p><div><a class="contact-choice-card" href="https://wa.me/${brand.phoneDigits}?text=${encodeURIComponent("Namaste R Magic Charms, we are planning our wedding and would like to discuss photography.")}" target="_blank" rel="noreferrer"><span>01</span><h2>Speak with us</h2><p>Tell us about your celebration and the traditions important to your family.</p><b>Open WhatsApp ↗</b></a><button type="button" class="contact-choice-card" data-scroll-inquiry><span>02</span><h2>Share the details</h2><p>Send your ceremonies, dates and location as one formal wedding inquiry.</p><b>Fill the form ↓</b></button></div></section>
    <section class="contact-layout"><form id="inquiry-form" novalidate><label>Your name<input name="name" autocomplete="name" required placeholder="Bride, groom or family contact" /></label><label>Mobile number<input name="phone" type="tel" autocomplete="tel" required placeholder="+91 98765 43210" /></label><label>Email address (optional)<input name="email" type="email" autocomplete="email" placeholder="you@example.com" /></label><label>What are we celebrating?<select name="kind"><option>Complete wedding celebration</option><option>Pre-Wedding</option><option>Engagement</option><option>Haldi or Mehendi</option><option>Wedding or Muhurtham</option><option>Reception</option><option>Couple or portrait shoot</option><option>Post-Wedding</option><option>We would like your guidance</option></select></label><label>Event date and location<input name="event" required placeholder="12 December 2026, Bengaluru" /></label><label>Tell us about the ceremonies<textarea name="message" required placeholder="Traditions, rituals, number of days and the moments important to your family…"></textarea></label><button type="submit" class="submit-button">Review &amp; send on WhatsApp <span>↗</span></button><p class="form-note">Submitting opens WhatsApp with your details. Review the message and tap Send so your inquiry reaches R Magic Charms directly.</p><p class="form-status" aria-live="polite"></p></form><aside><figure class="aside-photo">${image(sitePhoto("portfolio", "intimate-couple-portrait"), "A quiet moment between a couple")}</figure><p class="eyebrow">R MAGIC CHARMS</p><a href="tel:+${brand.phoneDigits}">${brand.phoneDisplay}</a>${emailLink}<p><a href="${brand.mapUrl}" target="_blank" rel="noreferrer">${brand.location} ↗</a><br>Available across India and worldwide</p><div><a href="https://wa.me/${brand.phoneDigits}" target="_blank" rel="noreferrer">Formal WhatsApp enquiry ↗</a><a href="https://www.instagram.com/${brand.instagram}" target="_blank" rel="noreferrer">@${brand.instagram} ↗</a></div></aside></section>
  </section>`;
}

function contact() {
  return `
  <section class="split-hero reveal">
    <div class="split-hero-copy">
      <p class="eyebrow">STUDIO &amp; ENQUIRIES</p>
      <h1>Let's begin your<br><em>wedding story.</em></h1>
      <p class="split-hero-sub">Every wedding we take on starts with a conversation — about your ceremonies, your families, and the moments you most want held onto. No obligation, no sales script. Just tell us what you are planning.</p>
      <div class="split-hero-meta">
        <div><b>Within 24 hours</b><span>WE REPLY</span></div>
        <div><b>Karnataka based</b><span>TRAVELLING WORLDWIDE</span></div>
        <div><b>Kannada · Tamil · Telugu<br>Hindi · English</b><span>WE SPEAK</span></div>
      </div>
    </div>
    <figure class="framed-photo">
      ${image(sitePhoto("portfolio", "wedding-forehead-blessing"), "A blessing given at a South Indian wedding")}
      <figcaption>A blessing, quietly received · Karnataka</figcaption>
    </figure>
  </section>

  ${enquirySection()}

  <section class="quote-band">
    ${image(sitePhoto("portfolio", "south-indian-wedding-portrait"), "South Indian bride and groom at the muhurtham")}
    <div class="quote-band-scrim"></div>
    <blockquote>
      <p class="eyebrow">WHY FAMILIES CHOOSE US</p>
      <p>“We wanted someone who knew what was happening at the mantap — not just where to stand. They knew every ritual before we explained it.”</p>
      <cite>A Bengaluru family, 2024</cite>
    </blockquote>
  </section>

  <section class="faq">
    <div class="section-heading"><p class="eyebrow">BEFORE YOU WRITE</p><span class="heading-note">Common questions</span></div>
    <div class="faq-grid">
      <div class="lift"><b>How far ahead should we book?</b><p>Most families reach out 6–12 months before the muhurtham. Peak Karnataka wedding months fill earliest, but always ask — dates do open up.</p></div>
      <div class="lift"><b>Do you travel outside Karnataka?</b><p>Yes. We regularly photograph celebrations across South India and travel internationally. Travel and stay are quoted transparently, with nothing hidden.</p></div>
      <div class="lift"><b>What does coverage cost?</b><p>It depends on your ceremonies, number of days and the photography team required. We send a clear breakdown once we understand your plans.</p></div>
      <div class="lift"><b>When do we receive everything?</b><p>A preview within two weeks and your complete edited photograph collection in 4–6 weeks.</p></div>
      <div class="lift"><b>Will you follow our family's rituals?</b><p>Always. Tell us your traditions and we brief our team beforehand, so nothing sacred is interrupted or mis-framed.</p></div>
      <div class="lift"><b>Can we meet before deciding?</b><p>Of course. We are glad to speak on a call or meet in person so you feel certain before committing to anything.</p></div>
    </div>
  </section>`;
}

function notFound() { return `${pageFrame("404", "This frame is<br><em>out of focus.</em>", "The page you’re looking for isn’t in our archive.")}<div class="center-link">${link("home", "Return home <span>↗</span>", "big-link")}</div>`; }

function render() {
  closeMenu();
  const route = location.hash.slice(1) || "home";
  const [page, slug] = route.split("/");
  header.classList.toggle("on-light", !["home", "story", "about", "contact"].includes(page));
  const templates = { home, work, social, about, contact };
  app.innerHTML = page === "story" ? story(slug) : (templates[page] ? templates[page]() : notFound());
  document.title = page === "home" ? "R Magic Charms — Wedding Photography" : `${page === "story" ? (projects.find(p => p.slug === slug)?.title || "Story") : page[0].toUpperCase() + page.slice(1)} — R Magic Charms`;
  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "auto" });
  observeReveals();
  bindForm();
  bindFilters();
  if (page === "home") {
    bindHeroVideo();
    bindHeroSound();
  }
  if (page === "home" || page === "social") populateInstaGrid(page);
  if (page === "story") {
    const album = projects.find(p => p.slug === slug) || projects[0];
    if (album) bindGalleryLightbox(album);
  }
}

// The hero loop is by far the heaviest asset on the page. Its poster paints
// straight away, and the video itself only starts downloading once the rest of
// the first screen has settled, so it never competes for bandwidth with the
// stylesheet, fonts and above-the-fold photographs.
function bindHeroVideo() {
  const video = document.querySelector(".hero-vid");
  if (!video || video.dataset.loaded) return;

  const start = () => {
    if (video.dataset.loaded) return;
    // Respect data-saver and slow connections: the poster frame already carries
    // the page, so a 5 MB loop is not worth forcing on a 3G phone.
    const net = navigator.connection;
    if (net && (net.saveData || /^([23]g|slow-2g)$/.test(net.effectiveType || ""))) return;
    video.dataset.loaded = "1";
    video.src = video.dataset.src;
    video.load();
    video.play().catch(() => {});
  };

  const schedule = () => {
    if (window.requestIdleCallback) requestIdleCallback(start, { timeout: 1500 });
    else setTimeout(start, 600);
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
}

function syncHeroSoundButton(video, button) {
  const playingSound = !video.muted;
  button.classList.toggle("active", playingSound);
  button.setAttribute("aria-pressed", String(playingSound));
  button.querySelector("span").textContent = playingSound ? "♫" : "▶";
  button.querySelector("b").textContent = playingSound ? "Film sound on" : "Play film sound";
}

function bindHeroSound() {
  const video = document.querySelector(".hero-vid");
  const button = document.getElementById("heroSoundToggle");
  if (!video || !button) return;

  button.addEventListener("click", async () => {
    if (!video.dataset.loaded && video.dataset.src) {
      video.dataset.loaded = "1";
      video.src = video.dataset.src;
    }
    video.muted = !video.muted;
    video.volume = 0.8;
    await video.play().catch(() => {
      video.muted = true;
    });
    syncHeroSoundButton(video, button);
  });
  syncHeroSoundButton(video, button);
}

function observeReveals() {
  const observer = new IntersectionObserver(entries => {
    const arriving = entries.filter(entry => entry.isIntersecting);
    arriving.forEach((entry, index) => {
      entry.target.style.setProperty("--d", `${Math.min(index, 4) * 110}ms`);
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: "0px 0px -5% 0px" });
  document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
}

function initChrome() {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    header.classList.toggle("is-scrolled", window.scrollY > 90);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
}

function bindForm() {
  const form = document.querySelector("#inquiry-form");
  if (!form) return;
  document.querySelector("[data-scroll-inquiry]")?.addEventListener("click", () => {
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.querySelector("input")?.focus({ preventScroll: true });
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const status = form.querySelector(".form-status");
    if (!form.checkValidity()) { status.textContent = "A few details are still waiting for you."; form.reportValidity(); return; }
    const data = new FormData(form);
    const lines = [
      "Namaste R Magic Charms, we are planning our wedding and would like to make an inquiry.",
      "",
      `Name: ${data.get("name")}`,
      `Mobile: ${data.get("phone")}`,
      `Email: ${data.get("email") || "Not provided"}`,
      `Celebration: ${data.get("kind")}`,
      `Date & location: ${data.get("event")}`,
      "",
      `Details: ${data.get("message")}`,
    ];
    const whatsappUrl = `https://wa.me/${brand.phoneDigits}?text=${encodeURIComponent(lines.join("\n"))}`;
    status.textContent = "Opening WhatsApp with your inquiry…";
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });
}

function bindFilters() {
  const filters = document.querySelectorAll("[data-filter]");
  if (!filters.length) return;
  const cards = document.querySelectorAll(".work-grid .project-card");
  filters.forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filters.forEach(item => item.classList.toggle("active", item === button));
    cards.forEach(card => card.classList.toggle("is-filtered-out", filter !== "all" && card.dataset.category !== filter));
  }));
}

renderHeader();
renderFooter();
renderSocialRail();
initChrome();
window.addEventListener("hashchange", render);
render();
