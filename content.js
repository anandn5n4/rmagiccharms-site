// ============================================================================
// R MAGIC CHARMS — WEBSITE CONTENT
// This is the only file you need to edit when adding couples or films.
//
// COUPLE PHOTOS
// 1. Create: resources/couples/couple-name/
// 2. Copy that couple's JPG, JPEG, PNG, or WEBP files into the folder.
// 3. Copy a COUPLE STORIES block below and update its text and photo paths.
//
// VIDEOS
// Copy MP4 files into resources/videos/. They are discovered automatically
// and appear on both the home page and Films page after a refresh.
// The WEDDING FILMS list below is only for permanently featured films that
// need custom titles, posters, types, or years.
//
// Photo sizes: "large" = full width, "medium" = offset, "duo" = paired.
// Film sizes: "feature" = wide film, "reel" = shorter portrait film.
// ============================================================================

const MEDIA = {
  local1: "resources/optimized/dsc01427.jpg",
  local2: "resources/optimized/dsc03894.jpg",
  local3: "resources/optimized/dsc04345.jpg",
  local4: "resources/optimized/dsc04357.jpg",
  local5: "resources/optimized/dsc01310.jpg",
  westernGhats: "resources/editorial/western-ghats.jpg",
  mysuruPalace: "resources/editorial/mysuru-palace.jpg",
  hampiTemple: "resources/editorial/hampi-temple.jpg",
  instagram1: "https://s10.imginn.com/606011278_17900956011347286_2198961011597185709_n.jpg",
  instagram2: "https://s10.imginn.com/642432717_17909723286347286_3474546402585949577_n.jpg",
  instagram3: "https://s10.imginn.com/749419601_17932276722347286_8508349124287960314_n.jpg",
  instagram4: "https://s10.imginn.com/723126611_17926206489347286_8351562861960163135_n.jpg",
};

window.RMAGIC_CONTENT = {
  brand: {
    name: "R Magic Charms",
    instagram: "r_magic_charms",
    phoneDisplay: "+91 78923 22716",
    phoneDigits: "917892322716",
    location: "Karnataka, India",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Karnataka%2C%20India",
    // Add verified public details here when available. Empty values stay hidden.
    email: "",
    // Replace this search URL with the official channel URL when available.
    youtube: "https://www.youtube.com/results?search_query=R%20Magic%20Charms",
  },

  // ── COUPLE STORIES ────────────────────────────────────────────────────────
  couples: [
    {
      slug: "kavya-and-yathish",
      title: "Kavya & Yathish",
      type: "PRE-WEDDING FILM",
      filter: "pre-wedding",
      location: "Gopalaswami Hills, Karnataka",
      year: "2024",
      image: MEDIA.local2,
      className: "wide",
      photos: [
        { src: MEDIA.local1, alt: "Kavya and Yathish at Gopalaswami Hills", size: "large" },
        { src: MEDIA.local2, alt: "Together in the hills", size: "duo" },
        { src: MEDIA.local3, alt: "Pre-wedding portrait", size: "duo" },
      ],
      quote: "The pictures gave us back the day we were too full of joy to fully see.",
      quoteAuthor: "— KAVYA & YATHISH",
    },
    {
      slug: "shivaney-wedding",
      title: "Shivaney Wedding",
      type: "WEDDING DAY",
      filter: "muhurtham",
      location: "Karnataka",
      year: "2024",
      image: MEDIA.local4,
      className: "portrait",
      photos: [
        { src: MEDIA.local4, alt: "The moment two lives became one", size: "large" },
        { src: MEDIA.local5, alt: "Wedding details and rituals", size: "medium" },
        { src: MEDIA.local2, alt: "Candid wedding moment", size: "medium" },
      ],
      quote: "Captured at the exact moment two lives became one.",
      quoteAuthor: "— R MAGIC CHARMS",
    },
    {
      slug: "priya-and-kiran",
      title: "Priya & Kiran",
      type: "NALANGU / HALDI",
      filter: "nalangu-haldi",
      location: "Mysuru, Karnataka",
      year: "2024",
      image: MEDIA.local3,
      className: "square",
      photos: [
        { src: MEDIA.local2, alt: "Priya and Kiran during nalangu", size: "large" },
        { src: MEDIA.local5, alt: "Turmeric and flowers", size: "duo" },
        { src: MEDIA.local3, alt: "Family laughter", size: "duo" },
      ],
    },
    {
      slug: "ananya-and-rohit",
      title: "Ananya & Rohit",
      type: "MUHURTHAM",
      filter: "muhurtham",
      location: "Bengaluru, Karnataka",
      year: "2025",
      image: MEDIA.local3,
      className: "portrait",
      photos: [
        { src: MEDIA.local3, alt: "Ananya and Rohit receiving blessings", size: "large" },
        { src: MEDIA.local5, alt: "Mangalsutra moment", size: "medium" },
      ],
    },
    {
      slug: "deepika-and-varun",
      title: "Deepika & Varun",
      type: "RECEPTION",
      filter: "sangeet-reception",
      location: "Bengaluru, Karnataka",
      year: "2025",
      image: MEDIA.local5,
      className: "wide",
      photos: [{ src: MEDIA.local5, alt: "Deepika and Varun at their reception", size: "large" }],
    },
    {
      slug: "meghna-and-aditya",
      title: "Meghna & Aditya",
      type: "SANGEET",
      filter: "sangeet-reception",
      location: "Mangaluru, Karnataka",
      year: "2024",
      image: MEDIA.local1,
      className: "square",
      photos: [{ src: MEDIA.local1, alt: "Meghna and Aditya at their sangeet", size: "large" }],
    },
  ],

  // ── WEDDING FILMS ─────────────────────────────────────────────────────────
  films: [
    {
      src: "resources/web/ayyo-shivaney.mp4",
      poster: MEDIA.local4,
      title: "Ayyo Shivaney",
      subtitle: "THE FILM",
      type: "WEDDING FILM",
      year: "2024",
      size: "feature",
    },
    {
      src: "resources/web/kavya-yathish-gopalaswami-hills.mp4",
      poster: MEDIA.local1,
      title: "Kavya & Yathish",
      subtitle: "GOPALASWAMI HILLS",
      type: "PRE-WEDDING FILM",
      year: "2024",
      size: "feature",
    },
  ],
};
