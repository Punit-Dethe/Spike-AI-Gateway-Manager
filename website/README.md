# Spike — Marketing Website

Next.js 15 + Tailwind v3 + Framer Motion. Same warm sand-and-blue palette as the desktop app.

## Local development

```bash
cd website
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

This is the recommended path.

### Option A — Connect the GitHub repo (one-time setup)

1. Push the project to GitHub: https://github.com/Punit-Dethe/Spike-AI-Gateway-Manager
2. Visit https://vercel.com/new
3. Import the repo
4. **Set the Root Directory to `website`** (this is the only setting you need to change)
5. Framework preset auto-detects as **Next.js**
6. Click Deploy

That's it. Every push to `main` redeploys.

### Option B — Vercel CLI (one-off deploy)

```bash
cd website
npm install -g vercel
vercel
```

Pick the existing project or create a new one. CLI will detect Next.js automatically.

## Structure

```
website/
├── app/
│   ├── layout.tsx       # Fonts, metadata, global wrapper
│   ├── page.tsx         # Homepage composition
│   └── globals.css      # Tailwind + small custom CSS
├── components/
│   ├── Nav.tsx          # Sticky frosted nav
│   ├── Hero.tsx         # Headline + flow diagram + stats
│   ├── FlowDiagram.tsx  # Live SVG flow (cycles through states)
│   ├── Features.tsx     # 5-card bento grid with custom illustrations
│   ├── TunnelSection.tsx# Spotlight section for Cloudflare Tunnel
│   ├── ApiSection.tsx   # Code switcher (Python/SDK/JS/curl)
│   ├── Install.tsx      # Spike + Spike Lite download cards
│   └── Footer.tsx
├── tailwind.config.ts   # Sand palette + accent blue
├── tsconfig.json
└── package.json
```

## Design notes

- **Palette** mirrors the app: `sand-50` background, `sand-100` cards, `sand-200/300` accents, blue `#2563EB` for action.
- **Typography** uses Inter for UI and Crimson Text for the serif display headings — same combo as the desktop app.
- **Animations** are subtle: looping flow lines on the gateway diagram, fade-up on scroll, terminal cursor blink. No autoplay video, no scroll-jacking.
- **No icons library** — all SVG is inline so nothing breaks at build time.

## Customizing

- Update the GitHub URL in `Nav.tsx`, `Hero.tsx`, `Footer.tsx`, `Install.tsx` if the repo moves.
- Swap the eyebrow palette by changing `accent` in `tailwind.config.ts`.
- Add a blog or docs by creating new routes under `app/`.

## License

MIT, same as the rest of Spike.
