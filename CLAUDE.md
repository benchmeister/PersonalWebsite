# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A static personal blog/portfolio site with a hacker/terminal aesthetic. No build system, no package manager, no framework — everything is vanilla HTML, CSS, and JavaScript served directly from the filesystem or any static host.

## Development

Open `index.html` directly in a browser, or use any static file server:

```bash
python3 -m http.server 8000
```

Posts must be served over HTTP (not `file://`) because `script.js` uses `fetch()` to load post content inline.

## Architecture

### Two rendering modes for posts

Posts are HTML files in `posts/` and can be consumed two ways:

1. **Inline (3-panel view)** — `script.js:loadPost()` fetches the post HTML, extracts `.post-page`, and injects it into `#post-content-container` inside the feed panel. The back-button and `<script>` tags from the post are stripped.
2. **Standalone (direct URL)** — navigating to `posts/post-N.html` directly renders the full page.

`toc.js` detects which mode is active by checking for `#panel-feed` in the DOM, then calls either `buildSidebar()` (inline grid layout) or `buildFloat()` (fixed sidebar).

### Adding a new post

1. Copy `posts/_template.html` to `posts/post-N.html` and write content inside `.post-body`.
2. Add a `.feed-entry` block in `index.html` (`#feed-list`) with the correct `data-category` and a `href` pointing to the new file.
3. Update the entry/category counts in the topbar and `#lens-list` in `index.html` manually.

> `posts.js` is a legacy data file with stub content — it is **not** used by the current site. Real post content lives in the individual HTML files.

### Categories

Valid `data-category` values on `.feed-entry` elements: `certs`, `deploy`, `ti`. The filter buttons in `#lens-list` match against these. Adding a new category requires a new `.lens-btn` entry and a matching CSS class for its dot color in `styles.css`.

### TOC behaviour

`toc.js` auto-scans `h2`/`h3` inside `.post-body` and builds a nav. It requires at least 2 headings to render. Heading IDs are auto-generated via `slugify()` if absent.

### Fake terminal widget

The animated terminal in the left panel (`#term-body`) runs `termScenarios` defined in `script.js` (lines 180–249). Add or edit scenarios there to change the displayed commands.
