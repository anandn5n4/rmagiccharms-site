const content = window.RMAGIC_CONTENT;
const brand = content.brand;
const projects = content.couples;
const filmList = content.films;
const IG = {
  p1: MEDIA.instagram1,
  p2: MEDIA.instagram2,
  p3: MEDIA.instagram3,
  p4: MEDIA.instagram4,
  r1: MEDIA.local1,
  r2: MEDIA.local2,
  r3: MEDIA.local3,
  r4: MEDIA.local4,
  r5: MEDIA.local5,
};

const app = document.querySelector("#app");
const header = document.querySelector("#site-header");
const footer = document.querySelector("#site-footer");

function link(to, label, className = "") {
  return `<a href="#${to}" class="${className}">${label}</a>`;
}

function image(src, alt, className = "") {
  const loading = className.includes("eager") ? "eager" : "lazy";
  return `<img class="${className}" src="${src}" alt="${alt}" loading="${loading}" />`;
}

function renderHeader() {
  header.innerHTML = `
    <a href="#home" class="wordmark" aria-label="R Magic Charms home"><img class="brand-mark" src="resources/r-magic-charms-mark.png" alt="" /><span class="wordmark-text">R Magic Charms</span></a>
    <div class="header-right">
      <button class="menu-toggle" aria-expanded="false" aria-controls="primary-nav"><i></i><i></i><span>Menu</span></button>
      <nav id="primary-nav" aria-label="Main navigation">
        ${link("work", "Work")}
        ${link("films", "Films")}
        ${link("about", "Studio")}
        ${link("contact", "Enquiries")}
        ${link("contact", "Check availability", "nav-cta")}
      </nav>
    </div>`;
  header.querySelector(".menu-toggle").addEventListener("click", toggleMenu);
}

function renderFooter() {
  footer.innerHTML = `
    <div class="footer-main">
      <div class="footer-brand"><img src="resources/r-magic-charms-logo.png" alt="R Magic Charms" /><p>South Indian wedding photography and films, rooted in Karnataka.</p></div>
      <div><p class="eyebrow">BASED IN</p><a href="${brand.mapUrl}" target="_blank" rel="noreferrer">${brand.location} ↗</a><p>Available across India and worldwide.</p></div>
      <div><p class="eyebrow">CONNECT</p><a href="tel:+${brand.phoneDigits}">${brand.phoneDisplay}</a><a href="https://www.instagram.com/${brand.instagram}" target="_blank" rel="noreferrer">@${brand.instagram}</a></div>
    </div>
    <div class="footer-bottom"><p>© ${new Date().getFullYear()} R MAGIC CHARMS</p><p>Karnataka · India · Available worldwide</p></div>`;
}

function renderSocialRail() {
  const rail = document.querySelector("#socialRail");
  const icons = {
    instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="fill"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.2 7.1a2.8 2.8 0 0 0-2-2C17.4 4.6 12 4.6 12 4.6s-5.4 0-7.2.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.3 12a29 29 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.8.5 7.2.5 7.2.5s5.4 0 7.2-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.9 29 29 0 0 0-.5-4.9Z"/><path d="m10 15.4 5-3.4-5-3.4Z" class="fill-light"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.5 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.6 1.4c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.3-6.1-3.6-8.4Zm-8.3 18.2c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.7 9.7 0 1 1 8.5 4.7Zm5.3-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.2-3.7-.3-.6.3-.5.9-1.8.1-.2 0-.4 0-.6l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.1.2 2.4 3.7 5.9 5.2 2.2.9 3.1 1 4.2.8.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.4-.2-.7-.3Z"/></svg>`,
  };
  const links = [
    { href: `https://www.instagram.com/${brand.instagram}`, icon: icons.instagram, name: "Instagram", className: "instagram", external: true },
    { href: brand.youtube || "#films", icon: icons.youtube, name: brand.youtube ? "YouTube" : "YouTube channel coming soon", className: "youtube", external: Boolean(brand.youtube) },
  ];
  rail.innerHTML = `
    <a class="dock-chat" href="https://wa.me/${brand.phoneDigits}?text=${encodeURIComponent("Namaste R Magic Charms, we are planning our wedding and would like to discuss photography and films.")}" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">${icons.whatsapp}<b>Chat</b></a>
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

// ─── INSTAGRAM LIVE FEED ─────────────────────────────────────────────────────
// Fetches real posts from @r_magic_charms via imginn.com API at page load.
// Seed URLs (s10.imginn.com CDN) used as instant fallback if fetch fails.
const INSTA_UID = "70367859285";
const INSTA_SEED = [
  { src: IG.r4, alt: "Wedding ceremony — two lives become one", code: "DSwbF95Eslh", isVideo: false },
  { src: IG.r1, alt: "Pre-wedding film — Kavya & Yathish", code: "DVcqXhAE6Iw", isVideo: false },
  { src: IG.r3, alt: "Celebrating life's beautiful moments", code: "DVcqXhAE6Iw", isVideo: false },
  { src: IG.r2, alt: "Candid wedding moments by @r_magic_charms", code: "DZfH9zHS-W6", isVideo: false },
  { src: IG.r1, alt: "Misty hills — pre-wedding portraits", code: "DVcqXhAE6Iw", isVideo: false },
  { src: IG.r5, alt: "South Indian wedding traditions", code: "DSwbF95Eslh", isVideo: false },
  { src: IG.r3, alt: "Jasmine and silk — wedding details", code: "DSwbF95Eslh", isVideo: false },
  { src: IG.r2, alt: "The laughter between the rituals", code: "DSwbF95Eslh", isVideo: false },
  { src: IG.r4, alt: "Golden hour portraits", code: "DSwbF95Eslh", isVideo: false },
];

async function fetchInstaFeed(cursor = "") {
  try {
    const query = new URLSearchParams({ fresh: Date.now(), cursor });
    const res = await fetch(`/api/insta?${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error("api error " + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    const posts = (data.items || [])
      .filter(p => p.owner && p.owner.username === "r_magic_charms")
      .sort((a, b) => Number(b.date || 0) - Number(a.date || 0))
      .map(p => ({
        src: "/api/img?url=" + encodeURIComponent(p.thumb),
        media: p.isVideo ? "/api/media?url=" + encodeURIComponent(p.src) : "",
        alt: p.alt ? p.alt.replace(/#\S+/g, "").replace(/@\S+/g, "").trim().slice(0, 80) || "Wedding moment by @r_magic_charms" : "Wedding moment by @r_magic_charms",
        code: p.code,
        isVideo: p.isVideo,
        date: Number(p.date || 0),
      }));
    return {
      posts: posts.length || cursor ? posts : INSTA_SEED,
      cursor: data.cursor || "",
      hasNext: Boolean(data.hasNext && data.cursor),
    };
  } catch {
    return { posts: cursor ? [] : INSTA_SEED, cursor: "", hasNext: false };
  }
}

async function populateInstaGrid() {
  const grid = document.getElementById("instaGrid");
  if (!grid) return;
  const soundToggle = document.getElementById("reelSoundToggle");
  const moreButton = document.getElementById("instaMore");
  let reelSoundEnabled = false;
  let posts = [];
  let cursor = "";
  let hasNext = false;
  let visibleCount = 0;
  let prefetchPromise = null;

  soundToggle?.addEventListener("click", () => {
    reelSoundEnabled = !reelSoundEnabled;
    soundToggle.classList.toggle("active", reelSoundEnabled);
    soundToggle.setAttribute("aria-pressed", String(reelSoundEnabled));
    soundToggle.querySelector("span").textContent = reelSoundEnabled ? "♫" : "♪";
    soundToggle.querySelector("b").textContent = reelSoundEnabled ? "Reel sound on" : "Enable reel sound";
    grid.querySelectorAll(".insta-preview").forEach(preview => {
      preview.muted = !reelSoundEnabled;
      if (reelSoundEnabled && preview.closest(".insta-cell").matches(":hover")) {
        preview.play().catch(() => {});
      }
    });
  });

  const previewObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const preview = entry.target;
      if (!preview.src) {
        preview.src = preview.dataset.src;
        preview.preload = "metadata";
        preview.load();
      }
      previewObserver.unobserve(preview);
    });
  }, { rootMargin: "220px 0px", threshold: 0.01 });

  const renderPosts = additions => {
    const startIndex = visibleCount;
    grid.insertAdjacentHTML("beforeend", additions.map((p, offset) => `
    <button type="button" class="insta-cell${p.isVideo ? " insta-video" : ""}" data-insta-index="${startIndex + offset}" aria-label="${p.isVideo ? "Play reel" : "View photo"}: ${p.alt}">
      ${p.isVideo && p.media
        ? `<video class="insta-preview" muted loop playsinline preload="none" poster="${p.src}" data-src="${p.media}"></video>`
        : `<img src="${p.src}" alt="${p.alt}" loading="lazy">`}
      <span class="insta-hover"><b>${p.isVideo ? "▶ Hover to play" : "View moment"}</b><small>${p.isVideo ? "Pauses when you leave" : "Open on this website"}</small></span>
    </button>`).join(""));
    const cells = [...grid.querySelectorAll("[data-insta-index]")].slice(startIndex);
    cells.forEach(cell => {
    cell.addEventListener("click", () => openInstaViewer(posts[Number(cell.dataset.instaIndex)]));
    const preview = cell.querySelector(".insta-preview");
    if (preview) {
      cell.addEventListener("mouseenter", () => {
        grid.querySelectorAll(".insta-preview").forEach(other => {
          if (other !== preview) other.pause();
        });
        if (!preview.src) {
          preview.src = preview.dataset.src;
          preview.load();
        }
        preview.muted = !reelSoundEnabled;
        preview.play().catch(() => {});
      });
      cell.addEventListener("mouseleave", () => preview.pause());
      previewObserver.observe(preview);
    }
  });
    visibleCount += additions.length;
    if (moreButton) moreButton.hidden = visibleCount >= posts.length && !hasNext;
  };

  const loadPage = async () => {
    const page = await fetchInstaFeed(cursor);
    cursor = page.cursor;
    hasNext = page.hasNext;
    const knownCodes = new Set(posts.map(post => post.code));
    const additions = page.posts.filter(post => !knownCodes.has(post.code));
    posts.push(...additions);
    renderPosts(additions.slice(0, 9));
  };

  const queueNextPage = async () => {
    const page = await fetchInstaFeed(cursor);
    cursor = page.cursor;
    hasNext = page.hasNext;
    const knownCodes = new Set(posts.map(post => post.code));
    posts.push(...page.posts.filter(post => !knownCodes.has(post.code)));
  };

  const prefetchNextPage = () => {
    if (!hasNext || prefetchPromise) return;
    const pending = queueNextPage();
    prefetchPromise = pending;
    pending.finally(() => {
      if (prefetchPromise === pending) prefetchPromise = null;
    });
  };

  grid.innerHTML = "";
  await loadPage();
  prefetchNextPage();
  moreButton?.addEventListener("click", async () => {
    moreButton.disabled = true;
    moreButton.querySelector("b").textContent = "Loading…";
    try {
      let waiting = posts.slice(visibleCount, visibleCount + 9);
      if (!waiting.length && prefetchPromise) {
        await prefetchPromise;
        waiting = posts.slice(visibleCount, visibleCount + 9);
      } else if (!waiting.length && hasNext) {
        await queueNextPage();
        waiting = posts.slice(visibleCount, visibleCount + 9);
      }
      if (waiting.length) renderPosts(waiting);
      prefetchNextPage();
    } finally {
      moreButton.disabled = false;
      moreButton.querySelector("b").textContent = "View more";
    }
  });
}

function openInstaViewer(post) {
  document.querySelectorAll(".insta-preview").forEach(preview => preview.pause());
  const viewer = document.createElement("div");
  viewer.className = "insta-viewer";
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-label", post.isVideo ? "Instagram reel player" : "Instagram photo viewer");
  viewer.innerHTML = `
    <button class="insta-viewer-close" type="button" aria-label="Close">×</button>
    <div class="insta-viewer-content">
      ${post.isVideo && post.media
        ? `<video controls autoplay playsinline poster="${post.src}"><source src="${post.media}" type="video/mp4"></video>`
        : `<img src="${post.src}" alt="${post.alt}">`}
      <div class="insta-viewer-caption">
        <p>${post.alt}</p>
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
    <!-- VIDEO HERO — inspired by weddingbellsstories.com -->
    <section class="hero hero-video">
      <div class="hero-video-wrap">
        <video class="hero-vid" autoplay muted loop playsinline preload="metadata"
               poster="${projects[0].image}">
          <source src="${MEDIA.heroLoop}" type="video/mp4">
          <img src="${projects[0].image}" alt="R Magic Charms wedding film" />
        </video>
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
      <p class="hero-overline">SOUTH INDIAN WEDDING PHOTOGRAPHY &amp; FILMS <span>BY R MAGIC CHARMS</span></p>
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
        <p>Thoughtful photography and cinematic films for intimate rituals, joyful gatherings and everything surrounding your family's milestone.</p>
      </div>
      <div class="offerings-grid">
        <article class="offering-card offering-large">
          ${image("resources/editorial/offerings/mehendi.jpg", "Intricate bridal mehendi being applied")}
          <span class="offering-number">01</span><div><p>COLOUR · LAUGHTER · FAMILY</p><h3>Mehendi &amp; Haldi</h3><b>Explore coverage ↗</b></div>
          <a class="offering-hit" href="#contact" aria-label="Enquire about Mehendi and Haldi coverage"></a>
          <a class="offering-credit" href="https://commons.wikimedia.org/wiki/File:Indian_Folk_Mehndi_Ceremony_(3).jpg" target="_blank" rel="noreferrer">AmanAgrahari01 · CC BY-SA 4.0</a>
        </article>
        <article class="offering-card offering-prewed">
          ${image("resources/editorial/offerings/pre-wedding.jpg", "Pre-wedding portrait session by R Magic Charms")}
          <span class="offering-number">02</span>
          <div><p>SAVE THE DATE · OUTDOOR · CINEMATIC</p><h3>Pre-Wedding Shoots</h3><b>Plan your shoot ↗</b></div>
          <a class="offering-hit" href="#contact" aria-label="Enquire about pre-wedding photography"></a>
        </article>
        <article class="offering-card offering-reception">
          ${image("resources/editorial/offerings/reception.jpg", "Indian couple at their wedding reception")}
          <span class="offering-number">03</span><div><p>ELEGANCE · PORTRAITS · TOASTS</p><h3>Reception Stories</h3><b>Explore coverage ↗</b></div>
          <a class="offering-hit" href="#contact" aria-label="Enquire about reception photography"></a>
          <a class="offering-credit" href="https://commons.wikimedia.org/wiki/File:Indian_couple_at_wedding_reception.png" target="_blank" rel="noreferrer">Gargiekulkarni · CC BY-SA 4.0</a>
        </article>
        <article class="offering-card offering-couple">
          ${image("resources/editorial/offerings/couple-shoot.jpg", "Indian couple during a pre-wedding portrait session")}
          <span class="offering-number">04</span><div><p>UNHURRIED · AFTER THE RUSH</p><h3>Post-Wedding Portraits</h3><b>Plan your session ↗</b></div>
          <a class="offering-hit" href="#contact" aria-label="Enquire about post-wedding couple portraits"></a>
          <a class="offering-credit" href="https://commons.wikimedia.org/wiki/File:Couple_Photoshoot_at_The_Lodhi_Garden.jpg" target="_blank" rel="noreferrer">Akarshan Sapra · CC BY-SA 4.0</a>
        </article>
        <article class="offering-card offering-drone">
          ${image("resources/editorial/offerings/drone-venue.jpg", "Aerial view of an Indian palace venue")}
          <span class="offering-number">05</span><div><p>AERIAL FILMS · GRAND PERSPECTIVES</p><h3>Drone Coverage</h3><b>See the possibilities ↗</b></div>
          <a class="offering-hit" href="#contact" aria-label="Enquire about drone wedding coverage"></a>
          <a class="offering-credit" href="https://commons.wikimedia.org/wiki/File:Aerial_View_Umaid_Mahal_Jodhpur.jpg" target="_blank" rel="noreferrer">Daniel Romanson · CC0</a>
        </article>
        <article class="offering-card offering-complete">
          ${image("resources/editorial/offerings/south-indian-wedding.jpg", "Traditional South Indian wedding ceremony")}
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
    <section class="uploaded-photo-section" id="homeUploads" hidden></section>

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
        <div class="statement-arch">${image(IG.r4, "Auspicious South Indian wedding ceremony")}</div>
        <p>RITUAL · BLESSING · UNION</p>
      </div>
    </section>

    <!-- FILM TEASER -->
    <section class="film-teaser reveal">
      <div class="film-teaser-video">
        ${image(projects[1].image, "South Indian wedding film", "film-teaser-image")}
        <div class="film-teaser-overlay">
          <p class="eyebrow">04 / WEDDING FILMS</p>
          <h2>Hear the nadaswaram.<br><em>Feel the blessings again.</em></h2>
          ${link("films", "Experience the wedding films <span>↗</span>", "text-link text-link-light")}
        </div>
      </div>
    </section>
    <!-- INSTAGRAM GRID -->
    <section class="insta-section">
      <div class="insta-header">
        <div>
          <p class="eyebrow">05 / AS SEEN ON INSTAGRAM</p>
          <h2>Recent <em>celebrations</em></h2>
        </div>
        <div class="insta-actions">
          <button type="button" class="reel-sound-toggle" id="reelSoundToggle" aria-pressed="false"><span>♪</span><b>Enable reel sound</b></button>
          <a href="https://www.instagram.com/r_magic_charms" target="_blank" rel="noreferrer" class="text-link insta-handle">@r_magic_charms <span>↗</span></a>
        </div>
      </div>
      <div class="insta-grid" id="instaGrid">
        ${Array(9).fill(0).map(() => `<div class="insta-cell insta-shimmer"></div>`).join("")}
      </div>
      <div class="insta-footer">
        <button type="button" class="big-link insta-more" id="instaMore" hidden><b>View more</b><span>↓</span></button>
      </div>
    </section>

    `;
}

function projectCard(project) {
  return `<article class="project-card ${project.className} reveal" data-category="${project.filter || "wedding-day"}">${image(project.image, project.title)}<div><p class="eyebrow">${project.type}</p><h3>${project.title}</h3><p class="project-location">${project.location} · ${project.year}</p></div>${link(`story/${project.slug}`, `Open ${project.title}`, "card-hit")}</article>`;
}

function work() {
  return `${pageFrame("THE WEDDING ARCHIVE / 2019—NOW", "Tradition, joy and<br><em>blessed beginnings.</em>", "Nalangu laughter, turmeric in the morning sun, intricate mehendi, the sacred muhurtham and generations gathered in blessing. Every wedding is preserved as one complete family story.")}
  <section class="filter-row" aria-label="Filter wedding stories"><button class="active" data-filter="all">All stories</button><button data-filter="pre-wedding">Pre-wedding</button><button data-filter="nalangu-haldi">Nalangu &amp; Haldi</button><button data-filter="muhurtham">Muhurtham</button><button data-filter="sangeet-reception">Sangeet &amp; Reception</button></section>
  <section class="work-grid">${projects.map(projectCard).join("")}</section>
  <section class="uploaded-photo-section" id="portfolioUploads" hidden></section>`;
}

// Renders gallery blocks from a project's photos[] array.
// Consecutive "duo"-sized photos are automatically paired.
function storyGallery(project) {
  const photos = project.photos || [];
  if (!photos.length) {
    return `<figure class="story-large">${image(project.image, project.title)}</figure>`;
  }

  const blocks = [];
  let i = 0;
  while (i < photos.length) {
    const p = photos[i];
    if (p.size === "duo" && photos[i + 1]?.size === "duo") {
      blocks.push({ type: "duo", a: photos[i], b: photos[i + 1] });
      i += 2;
    } else {
      blocks.push({ type: p.size || "large", photo: p });
      i++;
    }
  }

  return blocks.map(block => {
    if (block.type === "duo") {
      return `<div class="story-duo"><figure>${image(block.a.src, block.a.alt)}</figure><figure>${image(block.b.src, block.b.alt)}</figure></div>`;
    }
    const cls = block.type === "medium" ? "story-medium" : "story-large";
    return `<figure class="${cls}">${image(block.photo.src, block.photo.alt)}</figure>`;
  }).join("\n");
}

function story(slug) {
  const project = projects.find(p => p.slug === slug) || projects[0];
  const quote = project.quote || "The pictures gave us back the day we were too full of joy to fully see.";
  const quoteAuthor = project.quoteAuthor || "— AN R MAGIC CHARMS COUPLE";
  const nextProject = projects[(projects.indexOf(project) + 1) % projects.length];
  return `
    <section class="story-hero">${image(project.image, project.title, "eager")}<a class="back-link" href="#work">← &nbsp; Back to work</a><div><p class="eyebrow">${project.type} / ${project.year}</p><h1>${project.title}</h1><p>${project.location}</p></div></section>
    <section class="story-intro"><p class="eyebrow">THE WEDDING STORY</p><p>A union blessed by family, tradition and sacred ritual. We preserve the silk, flowers, prayers and unrepeatable moments that make every auspicious celebration entirely its own.</p></section>
    <section class="story-gallery">
      ${storyGallery(project)}
      <blockquote>"${quote}"<cite>${quoteAuthor}</cite></blockquote>
    </section>
    <section class="next-project"><p class="eyebrow">NEXT STORY</p>${link(`story/${nextProject.slug}`, `<span>${nextProject.title}</span> <i>↗</i>`, "next-link")}</section>`;
}

function about() {
  return `
  <section class="about-video-hero">
    <video class="about-vid-bed" autoplay muted loop playsinline preload="metadata" aria-hidden="true" tabindex="-1">
      <source src="resources/About.mp4" type="video/mp4">
    </video>
    <div class="about-vid-overlay"></div>
    <div class="about-hero-inner">
      <div class="about-vid-frame">
        <video class="about-vid" autoplay muted loop playsinline preload="metadata">
          <source src="resources/About.mp4" type="video/mp4">
        </video>
      </div>
      <div class="about-vid-text">
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
    <div><b>200+</b><span>CELEBRATIONS FILMED</span></div>
    <div><b>7</b><span>YEARS BEHIND THE LENS</span></div>
    <div><b>20+</b><span>CITIES TRAVELLED</span></div>
    <div><b>100%</b><span>RITUALS UNINTERRUPTED</span></div>
  </section>

  <section class="about-portrait">
    <figure class="framed-photo">
      ${image("resources/uploads/about/photographer-at-work.jpg", "The R Magic Charms team photographing a celebration")}
      <figcaption>On the mantap, working quietly · Karnataka</figcaption>
    </figure>
    <p>R Magic Charms is a South Indian wedding photography and film team devoted to preserving auspicious beginnings with grace and authenticity.<br><br>We understand that a wedding is more than one day: it is sacred ritual, ancestral tradition, joyful celebration and two families becoming one.</p>
  </section>

  <section class="strip">
    <div class="section-heading">
      <p class="eyebrow">WHERE WE WORK</p>
      <span class="heading-note">Temples, palaces &amp; hill country</span>
    </div>
    <div class="strip-grid">
      <figure>${image("resources/editorial/hampi-temple.jpg", "Temple architecture at Hampi")}<figcaption>Temple weddings</figcaption></figure>
      <figure>${image("resources/editorial/mysuru-palace.jpg", "Mysuru Palace")}<figcaption>Palace celebrations</figcaption></figure>
      <figure>${image("resources/editorial/western-ghats.jpg", "The Western Ghats")}<figcaption>Hill-country shoots</figcaption></figure>
    </div>
  </section>

  <section class="uploaded-photo-section uploaded-photo-about" id="aboutUploads" hidden></section>

  <section class="philosophy"><p class="eyebrow">HOW WE WORK</p><ol><li><span>01</span>We listen to your family and traditions.</li><li><span>02</span>We honour every ritual without interruption.</li><li><span>03</span>We preserve each blessing with honesty.</li></ol></section>

  <section class="ritual-context">
    <div><p class="eyebrow">ROOTED IN KARNATAKA</p><h2>We understand the meaning<br>before we frame the moment.</h2><p>Naandi begins the festivities with prayer. Arishina brings turmeric, laughter and blessing. Kashi Yatre makes room for playfulness; jeerige bella speaks of sharing life's sweetness and challenges. Through dhaare, saptapadi and the auspicious muhurtha, we work quietly and respectfully around the people who matter most.</p></div>
    <div class="ritual-terms"><span>NAANDI</span><span>ARISHINA</span><span>KASHI YATRE</span><span>JEERIGE BELLA</span><span>DHAARE</span><span>SAPTAPADI</span></div>
  </section>

  <section class="quote-band">
    ${image("resources/uploads/portfolio/wedding-blessing-ritual.jpg", "Elders blessing the couple at a South Indian wedding")}
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
      <span class="heading-note">Photography &amp; film</span>
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

function films() {
  return `
    <section class="cine-hero reveal">
      <video class="cine-hero-vid" autoplay muted loop playsinline preload="metadata" poster="${projects[0].image}">
        <source src="resources/About.mp4" type="video/mp4">
      </video>
      <div class="cine-hero-scrim"></div>
      <div class="cine-hero-copy">
        <p class="eyebrow">WEDDING FILMS / 2022—NOW</p>
        <h1>Hear the nadaswaram.<br>Relive <em>every blessing.</em></h1>
        <p class="cine-hero-sub">A photograph holds the moment. A film holds the sound of it — the chants, the laughter, your mother's voice as she gives you away.</p>
      </div>
      <div class="cine-hero-meta">
        <div><b>4K</b><span>CINEMA CAPTURE</span></div>
        <div><b>2</b><span>FILMS PER WEDDING</span></div>
        <div><b>8 WK</b><span>TYPICAL DELIVERY</span></div>
      </div>
    </section>

    <section class="films-list" id="filmsList">
      <div class="section-heading">
        <p class="eyebrow">01 / THE FILM ARCHIVE</p>
        <span class="heading-note">YouTube premieres coming soon</span>
      </div>
      ${filmList.map(filmCardMarkup).join("")}
    </section>

    <section class="process">
      <div class="section-heading">
        <p class="eyebrow">02 / HOW A FILM IS MADE</p>
      </div>
      <ol class="process-list">
        <li class="lift"><span>01</span><h3>We listen first</h3><p>Before a single frame, we learn your ceremonies, your family, and which moments carry the most weight. A Kashi Yatre is filmed differently to a dhaare.</p></li>
        <li class="lift"><span>02</span><h3>We film without interrupting</h3><p>Two cinematographers, discreet lenses and dedicated audio on the mantap. The purohit is never asked to repeat a mantra for our benefit.</p></li>
        <li class="lift"><span>03</span><h3>We cut for feeling</h3><p>Edited to the real sound of your day — the nadaswaram, the getti melam, the vows — rather than a licensed track laid over silence.</p></li>
        <li class="lift"><span>04</span><h3>We deliver to keep</h3><p>Your films arrive in 4K with a private link for family abroad, plus an archival copy your children can still open in thirty years.</p></li>
      </ol>
    </section>

    <section class="spec">
      <div class="section-heading">
        <p class="eyebrow">03 / WHAT YOU RECEIVE</p>
      </div>
      <div class="spec-grid">
        <div class="lift"><b>The Wedding Film</b><p>8–12 minutes. The full arc of your day, from the first prayer to the last blessing.</p></div>
        <div class="lift"><b>The Teaser</b><p>60–90 seconds, delivered first — made to be shared the week you return.</p></div>
        <div class="lift"><b>Full Ceremony Record</b><p>The complete muhurtham, uncut, with clean ritual audio for the family archive.</p></div>
        <div class="lift"><b>4K Masters</b><p>Original-quality files on a drive, plus a private streaming link that never expires.</p></div>
      </div>
    </section>

    ${ctaBand("Every wedding sounds different.", "Tell us about yours and we will suggest the right film coverage for your ceremonies.")}`;
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
      <a class="cta-primary" href="https://wa.me/${brand.phoneDigits}?text=${encodeURIComponent("Namaste R Magic Charms, we are planning our wedding and would like to discuss photography and films.")}" target="_blank" rel="noreferrer">Message us on WhatsApp <span>↗</span></a>
      ${link("contact", "Send a full enquiry <span>↓</span>", "cta-secondary")}
    </div>
  </section>`;
}

function filmCardMarkup(film) {
  const year = film.year ? ` · ${film.year}` : "";
  const poster = film.poster || projects[0].image;
  const player = film.youtubeId
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(film.youtubeId)}"
         title="${film.title}" loading="lazy"
         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
         referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
    : `<div class="youtube-placeholder">
         ${image(poster, `${film.title} wedding film`)}
         <div class="youtube-placeholder-scrim"></div>
         <span class="youtube-play" aria-hidden="true">▶</span>
         <div class="youtube-placeholder-copy">
           <b>Coming soon on YouTube</b>
           <span>Full films will premiere here after our channel launches.</span>
         </div>
       </div>`;
  return `
    <article class="film-card reveal ${film.size || "feature"}">
      <div class="film-card-video">
        ${player}
      </div>
      <div class="film-card-info">
        <p class="eyebrow">${film.type || "WEDDING FILM"}${year}</p>
        <h2>${film.title}</h2>
        <p class="film-sub">${film.subtitle || "R MAGIC CHARMS"}</p>
      </div>
    </article>`;
}

async function populateUploadedImages(page) {
  const section = page === "contact" ? "about" : page === "work" ? "portfolio" : page;
  const settings = {
    home: { target: "homeUploads", eyebrow: "NEWLY ADDED", title: "Latest <em>frames</em>" },
    about: { target: "aboutUploads", eyebrow: "THE CRAFT", title: "Behind the <em>frame</em>" },
    portfolio: { target: "portfolioUploads", eyebrow: "MORE FROM THE ARCHIVE", title: "Recently <em>added</em>" },
  }[section];
  if (!settings) return;

  try {
    const response = await fetch(`/api/images?section=${section}&fresh=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to scan image uploads");
    const { images = [] } = await response.json();
    const target = document.getElementById(settings.target);
    if (!target || !images.length) return;
    target.hidden = false;
    target.innerHTML = `
      <div class="uploaded-photo-heading"><p class="eyebrow">${settings.eyebrow}</p><h2>${settings.title}</h2></div>
      <div class="uploaded-photo-grid">${images.map(item => `
        <figure>
          ${image(item.src, item.alt)}
          <figcaption><span>${item.title}</span>${item.credit ? `<a href="${item.creditUrl || "#"}" target="_blank" rel="noreferrer">${item.credit}</a>` : ""}</figcaption>
        </figure>`).join("")}
      </div>`;
  } catch {
    // The fixed site content remains complete when an optional upload folder is unavailable.
  }
}

function enquirySection() {
  const emailLink = brand.email ? `<a href="mailto:${brand.email}">${brand.email}</a>` : "";
  return `
  <section class="contact-anchor" id="enquiry">
    <div class="contact-intro"><p class="eyebrow">STUDIO &amp; ENQUIRIES</p><h2>Tell us about your<br><em>auspicious celebration.</em></h2><p>Share your dates, traditions, ceremonies and the families gathering to bless your new beginning. We respond personally and guide you through the next steps.</p></div>
    <section class="contact-choice"><p class="eyebrow">CHOOSE HOW TO REACH US</p><div><a class="contact-choice-card" href="https://wa.me/${brand.phoneDigits}?text=${encodeURIComponent("Namaste R Magic Charms, we are planning our wedding and would like to discuss photography and films.")}" target="_blank" rel="noreferrer"><span>01</span><h2>Speak with us</h2><p>Tell us about your celebration and the traditions important to your family.</p><b>Open WhatsApp ↗</b></a><button type="button" class="contact-choice-card" data-scroll-inquiry><span>02</span><h2>Share the details</h2><p>Send your ceremonies, dates and location as one formal wedding inquiry.</p><b>Fill the form ↓</b></button></div></section>
    <section class="contact-layout"><form id="inquiry-form" novalidate><label>Your name<input name="name" autocomplete="name" required placeholder="Bride, groom or family contact" /></label><label>Mobile number<input name="phone" type="tel" autocomplete="tel" required placeholder="+91 98765 43210" /></label><label>Email address (optional)<input name="email" type="email" autocomplete="email" placeholder="you@example.com" /></label><label>What are we celebrating?<select name="kind"><option>Complete wedding celebration</option><option>Pre-Wedding</option><option>Engagement</option><option>Haldi or Mehendi</option><option>Wedding or Muhurtham</option><option>Reception</option><option>Couple or portrait shoot</option><option>Post-Wedding</option><option>We would like your guidance</option></select></label><label>Event date and location<input name="event" required placeholder="12 December 2026, Bengaluru" /></label><label>Tell us about the ceremonies<textarea name="message" required placeholder="Traditions, rituals, number of days and the moments important to your family…"></textarea></label><button type="submit" class="submit-button">Review &amp; send on WhatsApp <span>↗</span></button><p class="form-note">Submitting opens WhatsApp with your details. Review the message and tap Send so your inquiry reaches R Magic Charms directly.</p><p class="form-status" aria-live="polite"></p></form><aside><figure class="aside-photo">${image("resources/uploads/portfolio/intimate-couple-portrait.jpg", "A quiet moment between a couple")}</figure><p class="eyebrow">R MAGIC CHARMS</p><a href="tel:+${brand.phoneDigits}">${brand.phoneDisplay}</a>${emailLink}<p><a href="${brand.mapUrl}" target="_blank" rel="noreferrer">${brand.location} ↗</a><br>Available across India and worldwide</p><div><a href="https://wa.me/${brand.phoneDigits}" target="_blank" rel="noreferrer">Formal WhatsApp enquiry ↗</a><a href="https://www.instagram.com/${brand.instagram}" target="_blank" rel="noreferrer">@${brand.instagram} ↗</a></div></aside></section>
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
      ${image("resources/uploads/portfolio/wedding-forehead-blessing.jpg", "A blessing given at a South Indian wedding")}
      <figcaption>A blessing, quietly received · Karnataka</figcaption>
    </figure>
  </section>

  ${enquirySection()}

  <section class="quote-band">
    ${image("resources/uploads/portfolio/south-indian-wedding-portrait.jpg", "South Indian bride and groom at the muhurtham")}
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
      <div class="lift"><b>Do you travel outside Karnataka?</b><p>Yes. We regularly film across South India and travel internationally. Travel and stay are quoted transparently, with nothing hidden.</p></div>
      <div class="lift"><b>What does coverage cost?</b><p>It depends on your ceremonies, number of days and whether you want film alongside photography. We send a clear breakdown once we understand your plans.</p></div>
      <div class="lift"><b>When do we receive everything?</b><p>A teaser within two weeks, edited photographs in 4–6 weeks, and your full wedding film in around 8 weeks.</p></div>
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
  const templates = { home, work, films, about, contact };
  app.innerHTML = page === "story" ? story(slug) : (templates[page] ? templates[page]() : notFound());
  document.title = page === "home" ? "R Magic Charms — Wedding Photography & Films" : `${page === "story" ? (projects.find(p => p.slug === slug)?.title || "Story") : page[0].toUpperCase() + page.slice(1)} — R Magic Charms`;
  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "auto" });
  observeReveals();
  bindForm();
  bindFilters();
  if (page === "home") bindHeroSound();
  if (page === "home") populateInstaGrid();
  if (page === "about") syncAboutHero();
  if (["home", "about", "contact", "work"].includes(page)) populateUploadedImages(page);
}

// The Studio hero layers two copies of the same file. Keep the background bed
// locked to the framed reel so the overlap reads as one shot, not two.
function syncAboutHero() {
  const bed = document.querySelector(".about-vid-bed");
  const front = document.querySelector(".about-vid");
  if (!bed || !front) return;
  const sync = () => { if (Math.abs(bed.currentTime - front.currentTime) > 0.12) bed.currentTime = front.currentTime; };
  front.addEventListener("play", () => { bed.play().catch(() => {}); sync(); });
  front.addEventListener("seeked", sync);
  front.addEventListener("timeupdate", sync);
  bed.play().catch(() => {});
  front.play().catch(() => {});
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

  const enableSound = async () => {
    if (video.muted) {
      video.muted = false;
      video.volume = 0.8;
      try {
        await video.play();
      } catch {
        video.muted = true;
        await video.play().catch(() => {});
      }
      syncHeroSoundButton(video, button);
    }
  };

  syncHeroSoundButton(video, button);
  enableSound();
  document.querySelector(".hero-video")?.addEventListener("pointerdown", event => {
    if (!event.target.closest("#heroSoundToggle")) enableSound();
  }, { once: true });
  button.addEventListener("click", async () => {
    if (!video.muted) {
      video.muted = true;
    } else {
      await enableSound();
    }
    syncHeroSoundButton(video, button);
  });
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
