# 🎵 Sur o Jhankaar

> **"Har Sur Mein Ek Kahaani" (Every Melody, a Story)**

A production-grade, ad-free (by the platform itself), no-login, real-time, cinematically animated Indian music & audio story platform.

---

## 🌟 Key Highlights

- **Zero-Login Public App**: Immediate playback from splash to home. All history, liked songs, and queues are persisted locally in device IndexedDB/Room.
- **Dynamic Theme Engine (`mood_theme`)**: Visual atmosphere cross-fades in real time matching playlist and song identities across 10 distinct visual archetypes (Cinematic Maroon & Gold, Dusty VHS Sepia, Tagore Literary Cream & Green, Near-Black Story Spotlight, and more).
- **Classic Analog Radio Mode**: Vintage radio tuner dial with frequency scale (98.7 FM, 91.9 FM, 92.7 FM, 104.0 FM) and intelligent weighted-selection repeat prevention.
- **Sunday Suspense Story Mode**: Full storytelling visualizer with dynamic waveform pulses and narrator metadata replacing generic album covers.
- **Master 1,894-Row Ingestion**: Built-in CSV batch processor with instant preview reports, duplicate detection, and live Socket.IO progress bar.
- **Protected Admin Portal**: Dedicated JWT + RBAC authenticated surface for song management, single/playlist URL ingestion, analytics, and theme live-editor.

---

## 🏗️ Architecture

```
sur-o-jhankaar/
├── apps/
│   ├── web/                    # Next.js 15 App Router + Tailwind CSS + Framer Motion
│   └── android/                # Jetpack Compose + Media3/ExoPlayer + Room
├── server/                     # Node.js + Express + TypeScript + Socket.IO
├── python-engine/              # Python FastAPI classification & ingestion engine
├── packages/
│   ├── shared-types/           # Cross-app TypeScript interfaces
│   ├── theme-engine/           # Theme registry, CSS variables & color blending
│   └── player-core/            # Queue state machine & Radio scoring algorithm
├── data/
│   ├── master_library.csv      # 1,894-row verified master library seed
│   └── seed_playlists.json     # 14 verified playlists with custom mood_themes
├── docs/                       # Developer & system guides
└── docker-compose.yml
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ or 22+
- npm 9+
- Python 3.11+
- MongoDB & Redis (Optional locally or via Docker)

### 2. Install Dependencies & Build Packages
```bash
# In the root directory:
npm install
npm run build:packages
```

### 3. Run Backend Server
```bash
cd server
npm install
npm run dev
```

### 4. Run Web Application
```bash
cd apps/web
npm install
npm run dev
```

The Web Music Player will be live at `http://localhost:3000`.
The Admin Portal is accessible at `http://localhost:3000/admin/login` (Default credentials: `admin@surojhankaar.in` / `AdminSur@2026`).
The API Server runs at `http://localhost:5000/api`.

---

## 📜 14 Verified Master Playlists

1. **Bollywood Melody** (`bollywood-melody`) — `cinematic_gold_maroon`
2. **Hindi Evergreen** (`hindi-evergreen`) — `cinematic_gold_maroon`
3. **Roadside Nostalgia** (`roadside-nostalgia`) — `dusty_sepia_vhs`
4. **Bhojpuri Hits** (`bhojpuri-hits`) — `vibrant_folk_festival`
5. **Bengali Folk** (`bengali-folk`) — `earthy_terracotta_river`
6. **Manbhum, Purulia & Bankura** (`manbhum`) — `earthy_terracotta_river`
7. **Modern Bengali** (`modern-bengali`) — `neon_teal_purple_city`
8. **Bengali Evergreen** (`bengali-evergreen`) — `sepia_ivory_gramophone`
9. **Old Bengali Melody** (`old-bengali-melody`) — `sepia_ivory_gramophone`
10. **Sangeet Bangla Era** (`sangeet-bangla-era`) — `deep_indigo_radio`
11. **Rabindra Sangeet** (`rabindra-sangeet`) — `cream_green_tagore`
12. **Shyama Sangeet** (`shyama-sangeet`) — `deep_red_gold_temple`
13. **Durga Pujo Special** (`durga-pujo-special`) — `deep_red_gold_temple`
14. **Sunday Suspense** (`sunday-suspense`) — `near_black_story_spotlight`
