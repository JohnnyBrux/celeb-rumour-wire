# Celeb Rumour Wire Phase 1

Fresh Phase 1 foundation with:

- Retro early-2000s design
- Clickable article pages
- Admin dashboard mock at `/#/admin`
- Local story creation without GitHub edits
- Trending page
- SEO starter files

## Deploy to Cloudflare Pages

Upload these to the existing GitHub repo:

- `src`
- `public`
- `index.html`
- `package.json`
- `privacy.html`
- `terms.html`
- `README.md`

Do not upload `node_modules` or `dist`.

Cloudflare settings:

- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`

## Admin dashboard

Visit:

`https://your-site.pages.dev/#/admin`

This Phase 1 admin saves to your browser localStorage. Phase 2 should replace this with Supabase auth and database.
