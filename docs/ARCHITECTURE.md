# Architecture Notes

RAEY GPT Suite is split into three broad layers.

## 1. Appearance layer

`theme.css` and parts of `content.js` customize ChatGPT while trying to preserve native layout geometry.

The visual system uses:
- semantic attributes where possible;
- one-surface liquid-glass hierarchy;
- first-paint CSS for menus/dialogs to reduce FOUC;
- lightweight pointer-reactive reflection;
- composer-focused glow animation.

## 2. Productivity layer

`content.js` also owns RAEY-specific interaction features such as:
- unlimited local Favorites;
- prompt utilities;
- shortcut handling;
- wallpaper controls;
- the RAEY floating panel.

Local user state is persisted through Chrome extension storage.

## 3. Export layer

The room exporter spans:
- `exporter-content.js` for page/conversation extraction;
- `background.js` for privileged browser operations and authenticated asset recovery;
- `manager.js` for export orchestration;
- `zip.js` for archive creation.

The v2.7 integration supports current-room ZIP export without opening a visible manager tab.

## Stability strategy

ChatGPT is a frequently changing React application. RAEY therefore avoids assuming that every generated class name is stable.

Key stability rules:
- ignore character-data changes while responses stream;
- do not remove/re-add styling classes on every mutation;
- isolate extension-owned UI from native layout where possible;
- use narrow selectors for native UI customization;
- maintain explicit fallbacks for changed DOM structure.
