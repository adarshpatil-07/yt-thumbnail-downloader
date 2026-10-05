# YT Thumbnail Downloader

A fast, privacy-focused, and SEO-friendly static web application built with **Hugo (Extended Edition)**, **Tailwind CSS v4 (CLI)**, and **Vanilla JavaScript**. 

It allows users to paste any YouTube link (Standard, Shorts, `youtu.be`, Embed, Live, or Mobile) and instantly preview and download video cover thumbnails in all available resolution sizes with a single click.

---

## Features

- **Multi-Format YouTube URL Parser:** Extract video IDs from standard watch URLs, `youtu.be`, Shorts, embeds, live streams, mobile links, or raw 11-character video IDs.
- **5 Thumbnail Resolutions Supported:**
  - Maximum HD (`1280x720` - `maxresdefault`)
  - Standard HD (`640x480` - `sddefault`)
  - High Quality (`480x360` - `hqdefault`)
  - Medium Quality (`320x180` - `mqdefault`)
  - Small / Default (`120x90` - `default`)
- **Missing Thumbnail Auto-Detection:** Automatically detects missing or 120x90 gray placeholder thumbnails and gracefully hides those cards.
- **One-Click Real File Download:** Triggers direct file download with clean, SEO-friendly file names (e.g. `video-title-maxres.jpg`).
- **Dark Mode Toggle:** Remembers user preference using `localStorage` and respects system `prefers-color-scheme`.
- **Complete SEO & Structured Data:** Pre-configured with OpenGraph, Twitter Cards, canonical links, XML sitemap, `robots.txt`, and JSON-LD schemas (`WebApplication`, `FAQPage`, `Article`).
- **100% Client-Side Privacy:** No server backend or user tracking. All logic runs in the browser.

---

## Tech Stack

| Component | Choice |
|---|---|
| **Site Generator** | Hugo (Extended edition v0.167.0+) |
| **Styling** | Tailwind CSS v4 via `@tailwindcss/cli` |
| **Tool Logic** | Plain Vanilla JavaScript (`static/js/app.js`) |
| **Output** | Host-agnostic static files in `public/` |

---

## Project Structure

```text
yt-thumbnail-downloader/
├── hugo.toml                    # Hugo configuration
├── package.json                 # npm scripts & Tailwind CLI dependency
├── REQUIREMENTS.md              # Project scope & specifications
├── README.md                    # Project documentation
├── assets/
│   └── css/main.css             # Tailwind v4 entry CSS
├── static/
│   ├── css/style.css            # Compiled Tailwind CSS (committed)
│   ├── js/app.js                # Core JavaScript application logic
│   └── favicon.svg              # SVG Favicon
├── content/
│   ├── _index.md                # Homepage meta content
│   ├── about.md                 # About page
│   ├── privacy-policy.md        # Privacy policy
│   └── blog/                    # 3 SEO starter articles
└── layouts/
    ├── _default/                # Base layouts (baseof, single, list)
    ├── index.html               # Main homepage layout & tool UI
    ├── 404.html                 # Custom 404 error page
    ├── partials/                # Partial templates (head, seo, header, footer)
    └── robots.txt               # Robots template referencing sitemap.xml
```

---

## Getting Started & Local Workflow

### Prerequisites

- **Hugo Extended Edition** (v0.167.0 or higher)
- **Node.js** (v18 or higher) & **npm**

### Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd yt-thumbnail-downloader
   ```

2. Install dependencies (Tailwind CSS CLI):
   ```bash
   npm install
   ```

### Running Locally for Development

Open two terminal windows in the project folder:

- **Terminal 1 (Tailwind Watcher):**
  ```bash
  npm run dev
  ```

- **Terminal 2 (Hugo Development Server):**
  ```bash
  hugo server
  ```

Open your browser at `http://localhost:1313/` to view the live site with hot reloading.

---

## Production Build & Deployment

### 1. Building for Production

Compile minified CSS and build the optimized static site bundle:

```bash
npm run build
hugo --gc --minify
```

The compiled, production-ready static site will be generated inside the `public/` folder.

### 2. Host Deployment

This project is completely host-agnostic and requires no backend server. You can deploy the output of the `public/` folder directly to any static host:

- **Cloudflare Pages:** Build command: `npm run build && hugo --gc --minify`, Build output directory: `public`
- **GitHub Pages:** Deploy static `public/` directory via GitHub Actions or gh-pages branch.
- **Vercel / Netlify:** Framework preset: Hugo, Build command: `npm run build && hugo --gc --minify`, Output directory: `public`.

---

## License & Disclaimer

This software is provided for educational and research purposes. This application is not affiliated with, sponsored by, or endorsed by YouTube or Google LLC. All video titles and thumbnails belong to their respective copyright holders.
