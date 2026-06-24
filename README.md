# Celeb Rumour Wire V4

Retro early-2000s celebrity rumour aggregator for Cloudflare Pages.

## What changed in V4

- Clickable story cards
- Full article pages at `/story/...`
- Related story links
- Homepage sections:
  - Breaking Rumours
  - Trending Celebs
  - Celebrity Breakups
  - Reality TV Drama
  - Music Gossip
  - Movie & TV Buzz
- Improved SEO metadata per article/topic page
- Newsletter and ad placeholders
- Better retro styling

## Deploy settings

Cloudflare Pages:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`

## How to update your live site

1. Unzip this folder.
2. Upload/replace the files in your GitHub repo.
3. Commit changes.
4. Cloudflare should redeploy automatically.

## Important

This uses source-led RSS summaries and links back to publishers. Avoid copying full articles or presenting unverified gossip as fact.
