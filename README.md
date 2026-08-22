# R Magic Charms

Wedding photography and films portfolio for R Magic Charms.

## Local preview

Run `start.bat`, then open <http://localhost:4173>.

The local Python server provides media-folder discovery and the Instagram proxy.
The published Cloudflare Pages site remains fully usable when those optional
local endpoints are unavailable.

## Cloudflare Pages

- Repository: `anandn5n4/rmagiccharms-site`
- Production branch: `main`
- Framework preset: `None`
- Build command: leave empty
- Build output directory: `/`

Cloudflare Pages limits each static asset to 25 MiB. Deployable films live in
`resources/web/`; high-resolution source masters are intentionally excluded
from Git.

## Updating content

- Brand, projects, and films: `content.js`
- Page templates and behaviour: `app.js`
- Theme and layout: `styles.css`
- Portfolio images: `resources/uploads/portfolio/`
- Studio images: `resources/uploads/about/`
- Web-ready films: `resources/web/`

See `HOW-TO-ADD-MEDIA.txt` for the media-folder conventions used by the local
preview server.
