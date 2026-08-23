// ============================================================================
// R MAGIC CHARMS — WEBSITE CONTENT
// This is the only file you need to edit when adding couples and photographs.
//
// COUPLE PHOTOS
// 1. Create: resources/couples/couple-name/
// 2. Copy that couple's JPG, JPEG, PNG, or WEBP files into the folder.
// 3. Copy a COUPLE STORIES block below and update its text and photo paths.
//
// Photo sizes: "large" = full width, "medium" = offset, "duo" = paired.
// ============================================================================

const MEDIA = {
  local1: "resources/optimized/dsc01427.webp",
  local2: "resources/optimized/dsc03894.webp",
  local3: "resources/optimized/dsc04345.webp",
  local4: "resources/optimized/dsc04357.webp",
  local5: "resources/optimized/dsc01310.webp",
  westernGhats: "resources/editorial/western-ghats.webp",
  mysuruPalace: "resources/editorial/mysuru-palace.webp",
  hampiTemple: "resources/editorial/hampi-temple.webp",
  heroLoop: "resources/web/hero-loop.mp4",
  instagram1: "resources/uploads/portfolio/couple-market-moment.webp",
  instagram2: "resources/uploads/portfolio/groom-urban-portrait.webp",
  instagram3: "resources/uploads/portfolio/intimate-couple-portrait.webp",
  instagram4: "resources/uploads/portfolio/wedding-blessing-ritual.webp",
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
  },

  // ── COUPLE STORIES ────────────────────────────────────────────────────────
  couples: [
    {
      slug: "kavya-and-yathish",
      title: "Kavya & Yathish",
      type: "PRE-WEDDING",
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
};
