'use strict';

const SETTINGS_KEY = 'raeySettingsV21';
const WALLPAPER_KEY = 'raeyWallpaper';

const DEFAULT_SHORTCUTS = Object.freeze({
  togglePanel: 'Alt+Shift+R',
  promptLibrary: 'Alt+Shift+P',
  enhance: 'Alt+Shift+E',
  exportMarkdown: 'Alt+Shift+X',
  newChat: 'Ctrl+N'
});

const DEFAULTS = Object.freeze({
  enabled: true,
  accent: '#8c5cff',
  roomColor: '#08060d',
  wallpaperOpacity: 35,
  wallpaperBlur: 0,
  wallpaperScale: 100,
  wallpaperPositionX: 50,
  wallpaperPositionY: 50,
  wallpaperFit: 'cover',
  glow: 28,
  composerGlowMotion: 82,
  blur: 18,
  reflection: 60,
  depth: 55,
  radius: 18,
  messageWidth: 900,
  fontScale: 100,
  density: 'comfortable',
  animations: true,
  bubbleAnimations: true,
  bubbleMotion: 65,
  watermark: true,
  promptLibrary: true,
  promptEnhancer: true,
  conversationStats: true,
  exporter: true,
  favorites: true,
  shortcutsEnabled: true,
  shortcuts: DEFAULT_SHORTCUTS
});

const ids = [
  'enabled', 'accent', 'roomColor', 'wallpaperOpacity', 'wallpaperBlur', 'wallpaperScale', 'wallpaperPositionX', 'wallpaperPositionY', 'wallpaperFit',
  'glow', 'composerGlowMotion', 'blur', 'reflection', 'depth', 'radius', 'messageWidth', 'fontScale', 'density',
  'animations', 'bubbleAnimations', 'bubbleMotion', 'watermark',
  'promptLibrary', 'promptEnhancer', 'conversationStats', 'exporter', 'favorites', 'shortcutsEnabled'
];

const checkboxIds = new Set([
  'enabled', 'animations', 'bubbleAnimations', 'watermark',
  'promptLibrary', 'promptEnhancer', 'conversationStats', 'exporter', 'favorites', 'shortcutsEnabled'
]);

const numberIds = new Set([
  'wallpaperOpacity', 'wallpaperBlur', 'wallpaperScale', 'wallpaperPositionX', 'wallpaperPositionY', 'glow', 'composerGlowMotion', 'blur', 'reflection', 'depth', 'radius',
  'messageWidth', 'fontScale', 'bubbleMotion'
]);

const els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const liveStatus = document.getElementById('liveStatus');
const wallpaperFile = document.getElementById('wallpaperFile');
const wallpaperPreview = document.getElementById('wallpaperPreview');
const clearWallpaper = document.getElementById('clearWallpaper');
let settings = { ...DEFAULTS, shortcuts: { ...DEFAULT_SHORTCUTS } };
let wallpaper = null;
let saveTimer = null;
let statusTimer = null;
let previewRevision = 0;

function clamp(value, min, max, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

function validHex(value, fallback) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback;
}

function normalize(raw = {}) {
  return {
    enabled: raw.enabled !== false,
    accent: validHex(raw.accent, DEFAULTS.accent),
    roomColor: validHex(raw.roomColor, DEFAULTS.roomColor),
    wallpaperOpacity: clamp(raw.wallpaperOpacity, 0, 100, DEFAULTS.wallpaperOpacity),
    wallpaperBlur: clamp(raw.wallpaperBlur, 0, 36, DEFAULTS.wallpaperBlur),
    wallpaperScale: clamp(raw.wallpaperScale, 25, 400, DEFAULTS.wallpaperScale),
    wallpaperPositionX: clamp(raw.wallpaperPositionX, 0, 100, DEFAULTS.wallpaperPositionX),
    wallpaperPositionY: clamp(raw.wallpaperPositionY, 0, 100, DEFAULTS.wallpaperPositionY),
    wallpaperFit: ['cover', 'contain', 'auto'].includes(raw.wallpaperFit) ? raw.wallpaperFit : DEFAULTS.wallpaperFit,
    glow: clamp(raw.glow, 0, 100, DEFAULTS.glow),
    composerGlowMotion: clamp(raw.composerGlowMotion, 0, 100, DEFAULTS.composerGlowMotion),
    blur: clamp(raw.blur, 0, 40, DEFAULTS.blur),
    reflection: clamp(raw.reflection, 0, 100, DEFAULTS.reflection),
    depth: clamp(raw.depth, 0, 100, DEFAULTS.depth),
    radius: clamp(raw.radius, 8, 32, DEFAULTS.radius),
    messageWidth: clamp(raw.messageWidth, 640, 1120, DEFAULTS.messageWidth),
    fontScale: clamp(raw.fontScale, 90, 115, DEFAULTS.fontScale),
    density: ['compact', 'comfortable', 'airy'].includes(raw.density) ? raw.density : DEFAULTS.density,
    animations: raw.animations !== false,
    bubbleAnimations: raw.bubbleAnimations !== false,
    bubbleMotion: clamp(raw.bubbleMotion, 0, 100, DEFAULTS.bubbleMotion),
    watermark: raw.watermark !== false,
    promptLibrary: raw.promptLibrary !== false,
    promptEnhancer: raw.promptEnhancer !== false,
    conversationStats: raw.conversationStats !== false,
    exporter: raw.exporter !== false,
    favorites: raw.favorites !== false,
    shortcutsEnabled: raw.shortcutsEnabled !== false,
    shortcuts: { ...DEFAULT_SHORTCUTS, ...(raw.shortcuts || {}) }
  };
}

function setStatus(text, type = '') {
  liveStatus.textContent = text;
  liveStatus.className = `live-status${type ? ` ${type}` : ''}`;
  clearTimeout(statusTimer);
  if (type) {
    statusTimer = setTimeout(() => {
      liveStatus.textContent = 'Live preview ready';
      liveStatus.className = 'live-status';
    }, 1600);
  }
}

function updateOutputs() {
  document.getElementById('wallpaperOpacityValue').textContent = `${els.wallpaperOpacity.value}%`;
  document.getElementById('wallpaperBlurValue').textContent = `${els.wallpaperBlur.value}px`;
  document.getElementById('wallpaperScaleValue').textContent = `${els.wallpaperScale.value}%`;
  document.getElementById('wallpaperPositionXValue').textContent = `${els.wallpaperPositionX.value}%`;
  document.getElementById('wallpaperPositionYValue').textContent = `${els.wallpaperPositionY.value}%`;
  document.getElementById('glowValue').textContent = `${els.glow.value}%`;
  document.getElementById('composerGlowMotionValue').textContent = `${els.composerGlowMotion.value}%`;
  document.getElementById('blurValue').textContent = `${els.blur.value}px`;
  document.getElementById('reflectionValue').textContent = `${els.reflection.value}%`;
  document.getElementById('depthValue').textContent = `${els.depth.value}%`;
  document.getElementById('radiusValue').textContent = `${els.radius.value}px`;
  document.getElementById('messageWidthValue').textContent = `${els.messageWidth.value}px`;
  document.getElementById('fontScaleValue').textContent = `${els.fontScale.value}%`;
  document.getElementById('bubbleMotionValue').textContent = `${els.bubbleMotion.value}%`;

  const reflection = Number(els.reflection.value) / 100;
  const depth = Number(els.depth.value) / 100;
  document.documentElement.style.setProperty('--accent', els.accent.value);
  document.documentElement.style.setProperty('--glass-blur', `${els.blur.value}px`);
  document.documentElement.style.setProperty('--glass-blur-soft', `${Math.round(Number(els.blur.value) * 0.68)}px`);
  document.documentElement.style.setProperty('--glass-reflection', String(reflection));
  document.documentElement.style.setProperty('--glass-reflection-alpha', String((0.05 + reflection * 0.20).toFixed(3)));
  document.documentElement.style.setProperty('--glass-reflection-soft-alpha', String((0.02 + reflection * 0.08).toFixed(3)));
  document.documentElement.style.setProperty('--glass-depth', String(depth));
  document.documentElement.style.setProperty('--glass-depth-y', `${Math.round(8 + depth * 15)}px`);
  document.documentElement.style.setProperty('--glass-depth-blur', `${Math.round(24 + depth * 34)}px`);
  document.documentElement.style.setProperty('--glass-depth-alpha', String((0.18 + depth * 0.25).toFixed(3)));
}

function readForm() {
  const next = {};
  for (const id of ids) {
    if (checkboxIds.has(id)) next[id] = els[id].checked;
    else if (numberIds.has(id)) next[id] = Number(els[id].value);
    else next[id] = els[id].value;
  }
  next.shortcuts = settings.shortcuts || DEFAULT_SHORTCUTS;
  return normalize(next);
}

function setForm(raw) {
  settings = normalize(raw);
  for (const id of ids) {
    if (checkboxIds.has(id)) els[id].checked = Boolean(settings[id]);
    else els[id].value = settings[id];
  }
  updateOutputs();
}

function renderWallpaperPreview() {
  const dataUrl = wallpaper?.dataUrl || '';
  wallpaperPreview.classList.toggle('has-image', Boolean(dataUrl));
  wallpaperPreview.style.setProperty('--preview-room', settings.roomColor);
  wallpaperPreview.style.setProperty('--preview-wallpaper', dataUrl ? `url(${JSON.stringify(dataUrl)})` : 'none');
  wallpaperPreview.style.setProperty('--preview-opacity', String(settings.wallpaperOpacity / 100));
  wallpaperPreview.style.setProperty('--preview-blur', `${settings.wallpaperBlur}px`);
  wallpaperPreview.style.setProperty('--preview-scale', String(settings.wallpaperScale / 100));
  wallpaperPreview.style.setProperty('--preview-x', `${settings.wallpaperPositionX}%`);
  wallpaperPreview.style.setProperty('--preview-y', `${settings.wallpaperPositionY}%`);
  wallpaperPreview.style.setProperty('--preview-fit', settings.wallpaperFit === 'auto' ? 'auto' : settings.wallpaperFit);
}

async function getActiveChatTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs?.[0];
    if (!tab?.id) return null;
    return tab;
  } catch {
    return null;
  }
}

async function sendPreview(message) {
  const tab = await getActiveChatTab();
  if (!tab?.id) return false;
  try {
    await chrome.tabs.sendMessage(tab.id, message);
    return true;
  } catch {
    return false;
  }
}

async function persistNow() {
  clearTimeout(saveTimer);
  saveTimer = null;
  try {
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
    setStatus('Saved + live', '');
    return true;
  } catch {
    setStatus('Could not save', 'is-error');
    return false;
  }
}

function schedulePersist() {
  clearTimeout(saveTimer);
  setStatus('Saving...', 'is-saving');
  saveTimer = setTimeout(() => { persistNow(); }, 180);
}

async function applyFormLive({ persistImmediately = false } = {}) {
  settings = readForm();
  updateOutputs();
  renderWallpaperPreview();
  const revision = ++previewRevision;
  const ok = await sendPreview({ type: 'RAEY_PREVIEW_SETTINGS', settings, revision });
  if (revision === previewRevision && !ok) setStatus('Open ChatGPT for live preview', 'is-error');
  if (persistImmediately) await persistNow();
  else schedulePersist();
}

function storageGet(area, keys) {
  return new Promise(resolve => {
    chrome.storage[area].get(keys, result => resolve(result || {}));
  });
}

async function loadSettings() {
  const local = await storageGet('local', [SETTINGS_KEY, WALLPAPER_KEY]);
  wallpaper = local[WALLPAPER_KEY] || null;

  if (local[SETTINGS_KEY]) {
    setForm(local[SETTINGS_KEY]);
  } else {
    const legacy = await storageGet('sync', DEFAULTS);
    setForm(legacy);
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  }

  renderWallpaperPreview();
}

async function optimizeWallpaper(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('not-image');
  if (file.size > 25 * 1024 * 1024) throw new Error('too-large');

  const bitmap = await createImageBitmap(file);
  const maxSide = 2560;
  const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.88));
  if (!blob) throw new Error('encode-failed');
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return { dataUrl, name: file.name, width, height, savedAt: Date.now() };
}

for (const el of Object.values(els)) {
  const liveWhileDragging = el.matches('input[type="range"], input[type="color"]');
  if (liveWhileDragging) el.addEventListener('input', () => applyFormLive({ persistImmediately: false }));
  el.addEventListener('change', () => applyFormLive({ persistImmediately: true }));
}

wallpaperFile.addEventListener('change', async () => {
  const file = wallpaperFile.files?.[0];
  if (!file) return;
  setStatus('Optimizing wallpaper...', 'is-saving');
  try {
    wallpaper = await optimizeWallpaper(file);
    await chrome.storage.local.set({ [WALLPAPER_KEY]: wallpaper });
    renderWallpaperPreview();
    const ok = await sendPreview({ type: 'RAEY_WALLPAPER_UPDATE', wallpaper, revision: ++previewRevision });
    setStatus(ok ? 'Wallpaper live' : 'Wallpaper saved', '');
  } catch (error) {
    setStatus(error?.message === 'too-large' ? 'Image too large (max 25 MB)' : 'Wallpaper failed', 'is-error');
  } finally {
    wallpaperFile.value = '';
  }
});

clearWallpaper.addEventListener('click', async () => {
  wallpaper = null;
  await chrome.storage.local.remove(WALLPAPER_KEY);
  renderWallpaperPreview();
  await sendPreview({ type: 'RAEY_WALLPAPER_UPDATE', wallpaper: null, revision: ++previewRevision });
  setStatus('Wallpaper cleared', '');
});

document.getElementById('reset').addEventListener('click', async () => {
  settings = normalize(DEFAULTS);
  setForm(settings);
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  await sendPreview({ type: 'RAEY_PREVIEW_SETTINGS', settings, revision: ++previewRevision });
  renderWallpaperPreview();
  setStatus('Settings reset', '');
});

loadSettings().catch(() => setStatus('Settings load failed', 'is-error'));
