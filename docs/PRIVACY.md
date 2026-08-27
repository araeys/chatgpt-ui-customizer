# Privacy & Permission Notes

RAEY GPT Suite is a local Chrome extension built for personal use.

## Data handling

- No analytics SDK is included.
- No external telemetry backend is included.
- Theme settings, wallpaper preferences, prompt data, and Favorites are stored locally with Chrome extension storage.
- Conversation exports are generated locally and downloaded through the browser.

## Export authentication context

The full-room exporter needs access to resources that ChatGPT exposes only to the authenticated browser session. To make local export possible, the extension can observe/reuse authentication context from the current ChatGPT tab while an export is running.

The intended behavior is:

1. use the active authenticated ChatGPT session;
2. fetch the selected conversation/assets locally in the browser;
3. build the export archive;
4. download it to the user;
5. do not intentionally send session credentials to an unrelated third-party service.

Because this is powerful access, review the source before installing it and only install builds you trust.

## Permissions

The exact permission list is defined in `manifest.json`. The integrated exporter requires permissions beyond a visual theme, including downloads/tabs/scripting/web-request capabilities and ChatGPT/OpenAI host access.

## Distribution status

This repository documents a personal/portfolio build. It has not been packaged as a Chrome Web Store product and has not gone through Chrome Web Store review.
