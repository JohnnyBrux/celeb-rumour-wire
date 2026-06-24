# Celeb Rumour Wire V2

This version has a real Cloudflare Pages Function at `/api/stories`.

## Cloudflare settings
Framework preset: Vite
Build command: npm run build
Build output directory: dist

## How it works
- The browser loads the React site.
- The site calls `/api/stories`.
- Cloudflare Function fetches entertainment RSS feeds.
- The function creates source-led rumour cards with summaries and original links.

## Important
Do not publish rumours as fact. Keep the source link and wording like "According to...".
