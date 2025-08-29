# 3rd Street Boxing Gym — Netlify-ready Vite + React + Tailwind + Supabase

## Quick Start
1. Copy `.env.example` to `.env` and fill the values.
2. `npm install`
3. `npm run dev`

## Deploy on Netlify
- `netlify.toml` already sets the build command and publish directory.
- Set the following Environment variables in your Netlify site:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Notes
- This template trims unused dependencies and Deno-style imports for smooth builds.
- Tailwind is configured via `postcss.config.js` (CommonJS) for maximum compatibility.
