# Project: YT Thumbnail Downloader (Hugo site)

> Read this whole file first. Build **one phase at a time**. After each phase, stop, tell me how to run/check it, and wait for my go-ahead before starting the next phase.

## 1. What we are building

A fast, SEO-friendly static website where a user pastes a YouTube link and instantly gets the video's thumbnail in all available sizes, with a one-click download for each.

Inspiration: youtube-thumbnail-grabber.com (structure and feature set only).
**Do not copy its text, design, branding or images.** Make the UI original and cleaner.

Project and site name: **YT Thumbnail Downloader** (set once in `hugo.toml` and used in the header, page titles and SEO tags).
Folder name: `yt-thumbnail-downloader`.

## 2. Scope

### In scope
- Paste a YouTube link, get the thumbnail in 5 sizes
- One-click download per size (real file download, not "right-click, save")
- Video title and channel name shown above the results
- Copy-image-link button for each size
- Dark mode toggle
- Blog section (starter posts for SEO), Privacy Policy, About, and a short disclaimer
- Strong on-page SEO

### Out of scope (do NOT build)
- Video or audio downloading
- Vimeo support and the image resizer (these go in a separate React project)
- User accounts, databases, analytics, ads, or any backend
- Browser extensions

## 3. Tech stack (fixed)

| Part | Choice |
|---|---|
| Site generator | **Hugo (extended edition)**, latest stable |
| Templates | Hugo templates (HTML), content in Markdown |
| Styling | **Tailwind CSS v4 via the CLI** (npm), compiled to `static/css/style.css`. Commit the compiled CSS so the host only needs Hugo |
| Tool logic | **Plain vanilla JavaScript** in `static/js/app.js` (no React, no frameworks, no bundler) |
| Config | `hugo.toml` |
| Hosting target | Static host (Cloudflare Pages or GitHub Pages). Keep the site host-agnostic, no host-specific code |

Add npm scripts:
- `dev`: runs the Tailwind watcher
- `build`: compiles minified Tailwind CSS once

Local workflow: run `npm run dev` in one terminal and `hugo server` in another.
Production build: `npm run build` then `hugo --gc --minify` (output in `public/`).

## 4. Environment (already set up on my machine)

- OS: Windows
- Hugo extended v0.167.0 is installed and working (`hugo version` confirmed)
- Node.js and npm are installed
- Tailwind is **not** installed yet: install `tailwindcss` and `@tailwindcss/cli` into this project with npm during Phase 1

## 5. Folder structure

```
yt-thumbnail-downloader/
├── hugo.toml
├── package.json
├── REQUIREMENTS.md
├── assets/css/main.css          # Tailwind input
├── static/
│   ├── css/style.css            # compiled Tailwind (committed)
│   ├── js/app.js                # tool logic
│   ├── images/                  # logo, og-image
│   └── favicon.svg
├── content/
│   ├── _index.md                # home page content (FAQ etc.)
│   ├── about.md
│   ├── privacy-policy.md
│   └── blog/                    # 3 starter posts
└── layouts/
    ├── _default/{baseof,single,list}.html
    ├── index.html               # home page with the tool
    ├── partials/{head,seo,header,footer}.html
    └── robots.txt
```

## 6. Phases

### Phase 1: Scaffold
- Create the Hugo site with the structure above
- Run `npm init -y`, then install Tailwind (`npm install tailwindcss @tailwindcss/cli`) and set up the npm scripts
- Base layout with header, footer, and a placeholder home page
- `hugo.toml` with title, description, `baseURL` placeholder, `enableRobotsTXT = true`, sitemap enabled
- **Done when:** `hugo server` shows the placeholder page styled by Tailwind. Tell me the exact commands to run.

### Phase 2: UI design
- Clean, modern, mobile-first layout: big centered hero with a large input and a "Get Thumbnail" button
- Results area made of cards (one per size) with image preview, resolution label, Download button, Copy link button
- Light and dark themes, using system preference by default, with a toggle that remembers the choice in `localStorage`
- Sections below the tool: how it works (3 steps), supported link formats, FAQ, short disclaimer
- Smooth but subtle transitions, good spacing and typography, accessible contrast
- **Done when:** the page looks finished with dummy data, and works from 360px to desktop width.

### Phase 3: Tool logic (`static/js/app.js`)

**1. Parse the video ID** from all of these (plus a bare 11-character ID):
- `youtube.com/watch?v=ID` (also with extra params like `&t=`)
- `youtu.be/ID`
- `youtube.com/shorts/ID`
- `youtube.com/embed/ID`
- `youtube.com/live/ID`
- `m.youtube.com/...`

Show a friendly error for invalid input.

**2. Build the 5 image URLs** from `https://img.youtube.com/vi/ID/<name>.jpg`:

| Name | Size |
|---|---|
| `maxresdefault` | 1280x720 |
| `sddefault` | 640x480 |
| `hqdefault` | 480x360 |
| `mqdefault` | 320x180 |
| `default` | 120x90 |

`maxresdefault` and `sddefault` do not exist for every video. Detect failed or placeholder loads (use `onerror` and a small `naturalWidth` check) and hide those cards.

**3. Video title and channel**
- Fetch `https://www.youtube.com/oembed?url=<video url>&format=json` and show `title` and `author_name`.
- If the browser blocks the request or it fails, hide the title area gracefully. The rest of the tool must still work. Tell me in your summary whether the request worked in the browser.

**4. Download button**
- Use `fetch()` on the image, turn it into a blob, and trigger a download through a temporary `<a download>`.
- File name: `<slugified-title>-<quality>.jpg` (fall back to `thumbnail-<ID>-<quality>.jpg`).
- If the fetch is blocked (CORS), fall back to opening the image in a new tab and show a small tip. **Tell me clearly if this happens**, because then we will add a small proxy function later. Do not build a proxy now.

**5. Copy link button** copies the image URL and shows a brief "Copied" state.

**6. States:** loading, error, empty. Pressing Enter in the input also submits. No page reload.

**Done when:** all link formats work, hidden-size handling works, and I can download real files.

### Phase 4: Content and SEO
- Per-page `<title>` and meta description, canonical URL, Open Graph and Twitter tags (via `partials/seo.html`)
- JSON-LD: `WebApplication` on the home page, `FAQPage` for the FAQ section, `Article` for blog posts
- Sitemap (Hugo built-in) and `robots.txt` template referencing it
- One `<h1>` per page, semantic HTML, descriptive alt text
- 3 starter blog posts (original, helpful, ~500 words each), for example:
  1. How to download a YouTube thumbnail in HD
  2. YouTube thumbnail size and best-practice dimensions (1280x720, 16:9)
  3. Why a YouTube thumbnail is sometimes not available in maxres
- Privacy Policy page: the tool runs in the browser, we do not store the links users enter, and note any third-party requests (YouTube image servers, oEmbed)
- Disclaimer (footer and home page): not affiliated with YouTube or Google, thumbnails belong to their creators, use them responsibly and respect copyright

### Phase 5: Polish and checks
- Lighthouse run, aim for 90+ on Performance, Accessibility, Best Practices and SEO
- Test in Chrome and Firefox, desktop and mobile width
- Keyboard navigation and focus styles
- 404 page
- Final `hugo --gc --minify` build with no warnings
- Short README: how to run, how to build, how to deploy

## 7. Rules for the agent

- Keep the code beginner-readable: clear names and short comments explaining non-obvious parts. I am a student and want to understand it.
- No extra dependencies beyond Hugo and Tailwind unless you ask me first.
- Don't hardcode secrets or API keys (none are needed).
- Don't create files outside the structure above without telling me why.
- At the end of each phase, give me: what changed, how to run it, and what to check.