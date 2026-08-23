# R Magic Charms

South Indian wedding photography portfolio for R Magic Charms.

## Local preview

Run `start.bat`, then open <http://localhost:4173>.

The portfolio is static. In production, the social wall can additionally read
the studio's own media through a Cloudflare Pages Function. Local preview and
an unconfigured production deployment fall back to the committed media archive.

## Adding photographs

Photographs are never referenced by hand. Drop a shoot into `media-src/`, then
run:

```
media.bat
```

That regenerates `resources/` and `media.js`, and the album appears on the Work
page automatically. See `HOW-TO-ADD-MEDIA.txt` for the full walkthrough.

## How the media pipeline works

```
media-src/                    your working folder (kept off the website)
  photos/<album>/*.jpg        one folder per shoot -> one gallery
  photos/<album>/album.json   title, date, ceremony, cover, captions
  site/<group>/*.jpg          offerings, portfolio, editorial, about, brand
  site.json                   picks the home page hero poster
  video/hero-loop.mp4         copied through, never re-encoded

resources/                    generated, committed, served
  photos/... site/...         400 / 900 / 1600px WebP of every image
  media.json                  the manifest
media.js                      the manifest as a script tag
```

`tools/build_media.py` records each photograph's real width, height and average
colour. The site uses that to serve phones a 400px file instead of the desktop
one, to lay galleries out before the images arrive, and to keep the homepage
hero preload in `index.html` pointing at a file that actually exists.

## Updating the rest

- Studio contact details: `content.js`
- Page templates and behaviour: `app.js`
- Theme and layout: `styles.css`

## Cloudflare Pages

- Repository: `anandn5n4/rmagiccharms-site`
- Production branch: `main`
- Framework preset: `None`
- Build command: leave empty
- Build output directory: `/`

`resources/` is committed already built, so Cloudflare only has to serve files.
Remember to bump the `?v=` cache version in `index.html` after editing
`app.js`, `styles.css` or `fixes.css`.

### Live Instagram media

`functions/api/instagram.js` securely calls Meta's Graph API. Add these under
Cloudflare Pages → Settings → Variables and Secrets:

- `INSTAGRAM_USER_ID` — the linked Instagram professional account ID
- `INSTAGRAM_ACCESS_TOKEN` — a secret long-lived access token; never commit it
- `INSTAGRAM_API_VERSION` — optional, defaults to `v25.0`
- `INSTAGRAM_API_BASE` — optional, defaults to `https://graph.facebook.com`

The account must be a Business or Creator account linked to a Facebook Page.
The token needs `instagram_basic` and `pages_read_engagement`. The endpoint
returns only display fields to the browser; the token remains inside Cloudflare.
Reels, photographs, permalinks and available like counts then refresh from
Instagram automatically, with a ten-minute edge cache.