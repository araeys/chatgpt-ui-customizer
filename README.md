# RAEY GPT Suite

> A personal Chrome extension that turns ChatGPT into a customizable dark-purple workspace with liquid-glass UI, animated composer effects, unlimited conversation favorites, wallpaper controls, prompt utilities, keyboard shortcuts, and full-room export.

**Current version:** `v2.7.0`  
**Platform:** Chrome / Chromium, Manifest V3  
**Status:** Personal project / portfolio build

RAEY GPT Suite started as a visual theme experiment and grew into a full interface layer for ChatGPT. The goal is not to replace ChatGPT, but to make the web experience feel more personal, expressive, and useful without breaking the underlying product UI.

**Case study:** [`docs/PORTFOLIO.md`](docs/PORTFOLIO.md)  
**Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)  
**Privacy & permissions:** [`docs/PRIVACY.md`](docs/PRIVACY.md)

## Highlights

### Dark-purple liquid glass interface
- Custom near-black / dark-purple visual system
- Liquid-glass surfaces for menus, dialogs, controls, composer, and selected UI surfaces
- Pointer-reactive reflections and subtle depth
- One-surface hierarchy to avoid stacked borders and visual noise
- Stable semantic styling instead of constantly re-decorating the DOM

### Animated composer
- Multi-layer purple ambient glow
- Moving perimeter reflection
- Focus breathing animation
- Embossed liquid corners
- Motion intensity control
- Performance-conscious animation using mostly `transform` and `opacity`

### Custom room appearance
- Custom room background color
- Wallpaper upload
- Wallpaper opacity and blur
- Scale from 25% to 400%
- X/Y positioning
- Cover / contain / original fit modes

### Unlimited Favorites
ChatGPT's native Pin feature is intentionally left untouched. RAEY adds a separate local **Favorites** section inside the sidebar so any number of conversations can be saved for quick access.

Favorites are stored in `chrome.storage.local` and do not modify the conversation itself.

### Prompt utilities
- Local Prompt Library
- Prompt Enhancer workflow
- Clipboard-first interaction to avoid fighting ChatGPT's editor internals

### Keyboard shortcuts
- `Ctrl + N` attempts to open a new ChatGPT conversation when Chromium dispatches the event
- `Alt + N` is included as the reliable fallback because Chrome can reserve `Ctrl + N` for New Window
- Additional RAEY shortcuts can be configured from the extension UI

### Full Room Export
RAEY GPT Suite integrates the **RAEY Room Exporter v0.5.3** engine.

A current conversation can be exported to a ZIP directly from the RAEY panel without opening a separate manager tab.

The export pipeline includes:
- API-first conversation capture
- Markdown and JSON transcript output
- Attachment and generated-file recovery
- Image/media collection
- MIME and binary validation
- File-ID/content-hash deduplication
- Export integrity diagnostics
- No-new-tab current-room ZIP export

Simple HTML, Markdown, and JSON exports are also available.

## Why I built it

ChatGPT is a tool I use heavily for creative work, research, prompting, and project iteration. I wanted an interface that felt less generic and gave me a few workflow features I repeatedly missed:

- a stronger visual identity
- better control over the room background
- unlimited favorite conversations
- reusable prompts
- quick keyboard navigation
- reliable local conversation export

The interesting part of the project became keeping those additions stable while ChatGPT behaves like a modern React SPA with streaming content, portals, dynamic menus, and frequently changing DOM structure.

## Engineering notes

RAEY is built around a few rules learned through repeated regression testing:

1. **Do not continuously re-style streaming DOM.** Character-data mutations from assistant streaming are ignored.
2. **Prefer semantic selectors for first-paint styling.** Menus and dialogs should not flash native styling before the extension catches up.
3. **One component = one glass surface.** Nested rows inherit the material rather than stacking borders and shadows.
4. **Keep expensive effects off high-frequency surfaces.** Large glow areas use compositor-friendly animation where possible.
5. **Treat ChatGPT as a moving target.** Selectors use semantic attributes and fallbacks instead of relying only on generated class names.

## Architecture

```text
RAEY GPT Suite
├── manifest.json
├── content.js             # UI layer, favorites, shortcuts, theme behavior
├── exporter-content.js    # conversation/export extraction helpers
├── background.js          # background/export transport and download flow
├── manager.js             # exporter management logic
├── zip.js                 # ZIP creation
├── theme.css              # ChatGPT visual system
├── suite.css              # RAEY panels/components
├── popup.html
├── popup.js
└── popup.css
```

The extension uses Manifest V3 and runs only on ChatGPT/OpenAI-related hosts declared in `manifest.json`.

## Public repository note

This repository is currently the **portfolio/source showcase** for the project. The packaged personal build is maintained separately while the public snapshot is being cleaned for distribution, especially around exporter permissions and release packaging.

That separation is intentional: the exporter has access to authenticated ChatGPT resources in the local browser session, so a public installable release should be reviewed and documented more carefully than a visual-only theme.

## Privacy and permissions

RAEY is designed as a local browser extension. It does not include analytics or an external telemetry service.

The integrated exporter needs broader browser permissions than a visual-only theme because it has to recover conversation data and downloadable assets from the authenticated ChatGPT session. Authentication context is used in-memory by the extension to perform those local export requests; the project does not intentionally persist or transmit access tokens to a third-party server.

See [`docs/PRIVACY.md`](docs/PRIVACY.md) for the permission model and exporter notes.

## Performance

The visual system deliberately avoids continuously animating expensive full-screen blur filters.

Examples:
- composer halo motion relies mainly on `transform` and `opacity`
- streaming text does not trigger full native-glass reclassification
- nested glass components are flattened into a single surface hierarchy
- UI animation can be disabled
- `prefers-reduced-motion` is respected

## Current scope

This is a personal/portfolio build, not a Chrome Web Store release. ChatGPT can change its frontend at any time, so future OpenAI UI updates may require selector maintenance.

## Credits / research references

The project was informed by public experiments and documentation around ChatGPT DOM behavior and liquid-glass UI techniques, including:

- [Dworrall21/chatgpt-bridge](https://github.com/Dworrall21/chatgpt-bridge/blob/main/dom-selectors.md) for ChatGPT DOM research
- [alexchexes ChatGPT styling gist](https://gist.github.com/alexchexes/d2ff0b9137aa3ac9de8b0448138125ce) for surface/fade behavior research
- [nikdelvin/liquid-glass](https://github.com/nikdelvin/liquid-glass) and [dpawlikowski/liquid-glass](https://github.com/dpawlikowski/liquid-glass) for liquid-glass rendering ideas
- [tlyyxjz ProseMirror injection gist](https://gist.github.com/tlyyxjz/5e6edbc7e97cb3a7682af8520de250ce) during early Prompt Library experiments

The current Prompt Library intentionally uses a clipboard-first workflow rather than direct ProseMirror injection.

## Disclaimer

RAEY GPT Suite is an independent personal project and is not affiliated with, endorsed by, or sponsored by OpenAI. ChatGPT and OpenAI are trademarks of their respective owner.

---

Built by **Reyhan / @araeys** as a UI engineering + browser-extension portfolio project.
