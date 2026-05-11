# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

### Development Commands

- **`npm run dev`** — Start the Next.js development server (runs on `http://localhost:3000`)
- **`npm run build`** — Build the production bundle
- **`npm start`** — Run the production server
- **`npm run lint`** — Run ESLint to check code quality

### Environment Setup

Create a `.env.local` file with Supabase credentials (copy from `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase
```

## Project Overview

**SpotiFake** is a Spotify-like music streaming web application built with Next.js, React, and Supabase. The project uses a modern full-stack approach with:

- **Frontend**: React 19.2.3 + TypeScript with the Next.js App Router
- **Styling**: Tailwind CSS 4.2.1 with CSS variables for consistent theming
- **Backend**: Next.js API Routes + Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Context API (PlayerContext for global music player state)

## Architecture

### High-Level Structure

```
app/
├── api/                  # Next.js API routes (fetch data, mutations)
│   ├── canciones/        # Songs endpoints
│   ├── albums/           # Albums endpoints
│   ├── artista/          # Artists endpoints
│   ├── playlists/        # Playlists endpoints
│   ├── likes/            # User likes endpoints
│   └── usuario/          # User profile endpoints
├── components/           # Reusable React components
│   ├── Navbar.js         # Navigation header
│   ├── Footer.js         # Footer
│   ├── MusicPlayer.tsx   # Audio player UI & controls
│   └── ConditionalPlayer.tsx  # Conditional player renderer
├── context/              # React Context providers
│   └── PlayerContext.tsx  # Global music player state & logic
├── auth/                 # Authentication-related pages/routes
│   └── callback/route.ts # OAuth callback handler
├── [pages]/              # Route pages (inicio, discos, playlists, artistas, usuario, etc.)
├── layout.tsx            # Root layout (wraps all pages with Navbar, Footer, PlayerProvider)
├── page.tsx              # Home page (landing with carousel)
└── globals.css           # Global styles & CSS variables
```

### PlayerContext: Global State for Music Playback

The **PlayerContext** (`app/context/PlayerContext.tsx`) manages:

- `track` — Current playing track (title, artist, duration, icon, accent color)
- `queue` — Array of Track objects to play sequentially
- `playing` — Boolean for play/pause state
- `progress` — Percentage (0–100) for progress bar UI
- `elapsed` — Seconds elapsed in current track
- `volume` — Volume level (0–100)
- `shuffle` — Boolean for shuffle mode

**Methods**:
- `playTrack(track, queue?)` — Start playing a track with optional queue
- `toggle()` — Play/pause
- `next()` / `prev()` — Skip tracks
- `seek(percentage)` — Jump to a position
- `setVolume(level)` — Adjust volume
- `toggleShuffle()` — Toggle shuffle mode

**Usage**: Import `usePlayer()` hook in any client component to access/modify playback state.

### API Routes Convention

Each API route in `/app/api/` typically:

1. Authenticates the user (if needed) via Supabase
2. Queries the database or Supabase storage
3. Returns JSON (or errors in appropriate HTTP status codes)

Example flow: `MusicPlayer.tsx` → calls `/api/likes` → Supabase handles the mutation

## Styling & Colors

The project uses **CSS custom properties** (variables) defined in `globals.css`:

```css
--mint-bg: #d4ede4        /* navbar, footer, section backgrounds */
--wood-beige: #f2d2a4     /* warm accents */
--nook-brown: #7d5a50     /* borders, headings, text accents */
--leaf-green: #c2e18f     /* cards, highlights, interactive elements */
--google-coral: #ff7a64   /* Google login button / CTAs */
--pure-white: #ffffff     /* card backgrounds */
```

**Important**: Replace any old `#85f4a8` (old green) with `#c2e18f` (leaf-green) for accents.

The `.nook-bg` class applies a Tom Nook watermark background pattern (from Animal Crossing theming).

### Font Setup

Google Fonts loaded in `layout.tsx`:
- **Geist / Geist Mono** — System fonts
- **Nunito** — Weights: 400, 700, 800, 900
- **Anton** — Display/heading font

## Key Patterns & Conventions

### Client Components

Use `"use client"` directive for interactive components (those with state, events, or context). Examples:
- `MusicPlayer.tsx` — Playback controls & UI
- `Navbar.js` — Navigation & user menu
- Pages that use `usePlayer()` hook

### Data Fetching

- **Server-side**: Route handlers in `/app/api/` can query Supabase directly with service role key
- **Client-side**: Fetch from API routes (never expose Supabase keys in client code)
- **Images**: Supabase Storage images are served via remote patterns configured in `next.config.ts` (domain: `**.supabase.co`)

### TypeScript

- Strict mode enabled (`strict: true` in `tsconfig.json`)
- Use `@/*` path alias for absolute imports (e.g., `@/app/context/PlayerContext`)
- Type your API responses and React props

## Common Development Tasks

### Adding a New Page

1. Create a folder in `/app` (e.g., `/app/my-feature`)
2. Add a `page.tsx` file (or `page.js`) with your route component
3. Wrap interactive elements with `"use client"` if needed
4. Use the `usePlayer()` hook if you need playback features

### Modifying the Player

Edit `app/context/PlayerContext.tsx` for logic, or `app/components/MusicPlayer.tsx` for UI.

### Fetching from Supabase

In an API route, use `@supabase/supabase-js`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.from("table_name").select("*");
```

### Running the Dev Server

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser. The page auto-reloads on code changes.

## Deployment

The project is built for Vercel deployment. Environment variables must be set in Vercel project settings (or `.env.local` for local development).

## Notes

- The project uses Next.js 16 with the App Router (not Pages Router)
- Supabase handles authentication, database, and file storage
- All UI components use Tailwind CSS (no CSS-in-JS libraries)
- The music player is a simulated player (no actual audio playback in current state — audio playback logic can be added to `MusicPlayer.tsx` via HTML5 Audio API)


## Skills
-Antes de crear o modificar cualquier componente UI o página, lee:

skills/frontend-design.md

-Antes de crear o editar un documento Word (.docx), lee:

skills/docx.md

-Antes de crear o editar una presentación (.pptx), lee:

skills/pptx.md

