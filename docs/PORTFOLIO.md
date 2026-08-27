# RAEY GPT Suite — Project Case Study

## Overview

RAEY GPT Suite is a personal Chrome extension that redesigns and extends the ChatGPT web experience. What began as a dark-purple theme became an experiment in browser-extension UI engineering: working around a frequently changing React interface, streaming DOM updates, portal-based menus, local persistence, custom interaction layers, and authenticated conversation export.

The project currently combines three ideas:

1. **Interface customization** — dark-purple liquid-glass materials, custom wallpaper controls, animated composer lighting, and room/layout tuning.
2. **Workflow additions** — unlimited local Favorites, prompt tools, conversation stats, and keyboard shortcuts.
3. **Conversation portability** — a full-room ZIP exporter that captures transcripts and attempts to recover attachments/generated assets without opening a visible export manager tab for the current room.

## Design direction

The visual direction is intentionally darker and more editorial than a typical neon theme. Instead of applying a glass border to every element, newer versions use a **one-surface rule**:

- parent surfaces own the material;
- child rows remain mostly borderless;
- reflection carries the glass effect instead of repetitive outlines;
- the composer is treated as the hero interaction surface;
- motion is concentrated on hover/focus moments instead of constantly animating the whole page.

This direction came from repeated visual regression testing. Early builds looked impressive in isolation but created nested strokes, flickering controls, and inconsistent native components. Those bugs led to a more restrained system.

## Key challenges

### 1. Styling a moving React application

ChatGPT's DOM is not a stable static document. Components can be mounted through portals, class names can change, conversations stream character updates, and navigation occurs without full page reloads.

**Approach:**
- prefer semantic attributes and known roles over generated class names;
- avoid reclassifying controls on every text mutation;
- use first-paint CSS for menus/dialogs where possible;
- isolate RAEY-owned surfaces from native layout;
- keep fallback selectors narrow.

### 2. Preventing UI flicker

An early implementation waited for JavaScript observers to detect a newly opened native menu and then added a glass class. This caused a visible native-to-themed flash.

**Fix:** move important menu/dialog styling into semantic CSS that can match on the component's first rendered frame, while JavaScript handles only behavior that genuinely needs runtime context.

### 3. Liquid-glass without visual noise

Applying a reflection edge to every nested element created stacks of strokes and made the interface look debug-like.

**Fix:** establish a component hierarchy where the outer surface owns blur, reflection, and depth. Nested items inherit the atmosphere but do not receive their own heavy borders.

### 4. Animation without unnecessary lag

The composer uses a large animated glow, but animating large blur radii or layout properties every frame would be expensive.

**Approach:** keep the large halo mostly static and animate compositor-friendly properties such as `opacity` and `transform`; use a thin moving perimeter reflection for the visible motion.

### 5. Unlimited conversation Favorites

ChatGPT's native Pin feature is intentionally untouched. RAEY adds a separate local Favorites layer so the extension never needs to mutate ChatGPT's own pin state.

Favorites are persisted through Chrome extension storage and restored as the SPA changes conversations.

### 6. Full-room export

The integrated RAEY Room Exporter v0.5.3 is more than a `document.body.innerText` dump. Its pipeline is designed around normalized conversation data and asset integrity.

The exporter includes:
- API-first transcript recovery;
- Markdown/JSON output;
- attachment and generated-file discovery;
- MIME/binary validation;
- file-ID and content-hash deduplication;
- integrity reporting;
- ZIP generation in the extension;
- direct current-room export without opening a visible manager tab.

## Iteration history

The project went through multiple stability-focused revisions:

- **v1** — initial dark-purple ChatGPT skin.
- **v2** — modular RAEY panel, prompt tools, stats, bookmarks, exporter experiments, shortcuts.
- **v2.1–v2.4** — wallpaper controls, liquid-glass system, first-paint fixes, streaming/flicker fixes, one-surface hierarchy, layout regression work.
- **v2.5** — unlimited Favorites, wallpaper scaling/positioning, SVG launcher, stronger composer material.
- **v2.6** — performance-conscious massive composer glow and motion controls.
- **v2.7** — integrated Room Exporter v0.5.3 and no-new-tab current-room ZIP flow.

Some early features such as per-message Quick Actions and custom Bookmarks were deliberately removed after testing because they added visual clutter and depended too heavily on unstable native message DOM. That removal is part of the design process, not just feature reduction.

## What this project demonstrates

- Chrome Extension Manifest V3 architecture
- DOM observation in a React SPA
- resilient UI theming and component isolation
- browser storage and local user-state design
- interaction/motion design with performance constraints
- iterative visual regression debugging
- authenticated browser-context export workflows
- ZIP generation and asset-integrity handling
- translating personal workflow pain points into product features

## Current status

RAEY GPT Suite is a personal portfolio build rather than a Chrome Web Store product. ChatGPT's frontend evolves frequently, so maintenance is expected when upstream markup or behavior changes.

The goal of the repository is to document the product thinking, engineering decisions, and extension architecture behind the project rather than present it as an official OpenAI client.
