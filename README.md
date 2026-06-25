# Celeb Rumour Wire V5

Cloudflare Pages/Vite celebrity gossip site with:

- live RSS aggregator at `/api/stories`
- clickable internal article pages using `#/story/...`
- topic sections: breakups, reality TV, music, Hollywood
- related stories
- retro 2000s styling
- newsletter and ad placeholders
- SEO basics: robots, sitemap, meta tags

## Deploy

Upload these files/folders to GitHub, without `node_modules` or `dist`:

- `src`
- `functions`
- `public`
- `index.html`
- `package.json`
- `privacy.html`
- `terms.html`
- `README.md`

Cloudflare Pages settings:

- Framework preset: Vite
- Build command: npm run build
- Build output directory: dist

## Analytics

Add your Google Analytics tag inside `index.html` before `</head>`.

## Important

The RSS endpoint creates short source-led summaries and links back to original publishers. Do not copy full articles or private/paywalled content.
