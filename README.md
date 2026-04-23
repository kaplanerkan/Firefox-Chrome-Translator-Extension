# Seçimi Çevir (Selection Translator)

A lightweight Firefox and Chrome extension that translates any text you select on a web page. Right-click the selection, pick **Çevir** (Translate), and the translation appears in a compact tooltip right next to the text you highlighted — no new tab, no page reload.

- **Default target language:** Turkish (`tr`)
- **Source language:** auto-detect by default, configurable
- **Translation backend:** Google Translate public endpoint (`translate.googleapis.com`) — no API key required
- **Manifest:** V3 (cross-browser: Firefox + Chromium)
- **No build step, no dependencies** — plain ES modules

## Features

- Right-click context menu on any text selection
- In-page tooltip rendered inside a Shadow DOM (no style collisions with the host page)
- Viewport-aware positioning
- Copy-to-clipboard button
- Close via outer click or `Esc`
- Options page with source/target language pickers (40+ languages)
- Settings persisted via `storage.sync`

## Project structure

```
.
├── manifest.json           # MV3 manifest (dual background for FF + Chrome)
├── background/background.js  # context menu + Google Translate fetch
├── content/content.js      # Shadow DOM tooltip + message listener
├── options/                # options page (language pickers)
│   ├── options.html
│   ├── options.js
│   └── options.css
├── _locales/tr/messages.json
└── icons/
    ├── icon-48.png
    └── icon-96.png
```

## Installation

### Firefox (temporary, for development)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Select `manifest.json` from this repo (or the built `.xpi`)

The add-on stays loaded until Firefox restarts.

For a persistent install, either submit the `.xpi` to [addons.mozilla.org](https://addons.mozilla.org) for signing, or use Firefox Developer Edition / Nightly with `xpinstall.signatures.required` set to `false` in `about:config`.

### Chrome / Chromium / Edge / Brave

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select this project's root folder
   — *or* drag-and-drop the `.zip` from `web-ext-artifacts/`

### Building the packages

```bash
# Lint the source
npx web-ext lint

# Build a distributable zip/xpi (outputs into web-ext-artifacts/)
npx web-ext build --overwrite-dest
```

The same zip works for both browsers; rename it to `.xpi` for Firefox if desired.

### Running in dev mode (hot-reload Firefox)

```bash
npx web-ext run
```

This launches a fresh Firefox profile with the extension installed and auto-reloads on file changes.

## Usage

1. Select any text on a web page
2. Right-click and choose **Çevir: "…"**
3. The translation appears in a tooltip next to the selection
4. Click **Kopyala** to copy the translated text, or press `Esc` / click outside to close

To change languages, open the extension's options:
- Firefox: `about:addons` → Seçimi Çevir → Preferences
- Chrome: `chrome://extensions` → Seçimi Çevir → Details → Extension options

## Testing & Debugging

### Manual test scenarios

1. **Basic translation** — Open any page (e.g. `https://en.wikipedia.org/wiki/Firefox`), select a sentence, right-click → **Çevir: "..."**. A dark tooltip should appear anchored to the selection with the Turkish translation.
2. **Change target language** — Open the options page, set target to `de` (German), save, then translate the same selection again. The result should now be German.
3. **Copy button** — Click **Kopyala** in the tooltip and paste elsewhere to confirm the translated text was copied.
4. **Dismissal** — Press `Esc` or click outside the tooltip — it should disappear.
5. **Long text guard** — Select 5000+ characters. You should see a friendly "Seçim çok uzun" error instead of a failed request.
6. **Offline** — Disable the network and try translating — the tooltip should show an error, not hang.

### Opening the dev consoles

- **Chrome — background (service worker):** `chrome://extensions` → Seçimi Çevir → **Inspect views: service worker**.
- **Firefox — background:** `about:debugging#/runtime/this-firefox` → Seçimi Çevir → **Inspect**.
- **Content script (both browsers):** On the tested page press `F12` → **Console**. Content-script logs appear here.
- **Options page:** Right-click inside the options popup → **Inspect**.

### Reloading after code changes

- **Chrome:** `chrome://extensions` → click the **reload** (↻) icon on the extension card. Always required after changing `manifest.json` or `background.js`. For content-script-only edits, reloading the page is enough.
- **Firefox:** `about:debugging` → **Reload** next to the extension. Or use `npx web-ext run` which auto-reloads on file changes.

### Rate limits

The free Google Translate endpoint may occasionally return HTTP 429 (too many requests). You'll see the error in the service-worker / background console. Wait a minute or switch networks and retry.

## Permissions

| Permission | Why |
|---|---|
| `contextMenus` | Adds the "Çevir" item to the right-click menu |
| `storage` | Persists source/target language across sessions |
| `host_permissions: translate.googleapis.com` | Sends selected text to the translation endpoint |

The extension declares `data_collection_permissions: ["websiteContent"]` on Firefox because the selected page text is sent to Google's translation endpoint.

## Limitations

- Uses Google's unofficial public endpoint — Google may rate-limit or change it at any time
- Max 5000 characters per selection (longer selections show a friendly error)
- Only runs in top-level frames (iframes not currently supported)
- `about:`, `chrome://`, and similar restricted pages cannot host content scripts

## License

MIT
