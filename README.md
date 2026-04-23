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
