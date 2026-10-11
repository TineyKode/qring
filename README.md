# QRing

Manifest V3 browser extension that turns a link, some text, or the current tab into a QR code. Copy the image or download it as PNG or SVG.

## What it does

- Opens with the toolbar button, or with Alt+Q
- Fills the box with the current `http` or `https` tab
- **Use this tab** replaces the box with the active tab's URL
- Right-click a link, selected text, an image, or the page to build a code from that
- Error correction: Low, Medium, Quartile, or High
- Download PNG at 512, 1024, or 2048 pixels, or download SVG
- Copy the PNG to the clipboard from the popup button

If the image copy fails, use Download.

## Install

1. Open Chrome, Edge, or another Chromium browser.
2. Go to `chrome://extensions`.
3. Turn on Developer mode.
4. Choose **Load unpacked** and select this folder.

Change the shortcut at `chrome://extensions/shortcuts` if Alt+Q is already taken.

## Files

- `manifest.json` - Manifest V3
- `popup.html`, `popup.css`, `popup.js` - the QR popup
- `background.js` - right-click menus
- `qrcode.js` - vendored QR encoder
- `icons/` - 16, 48, and 128 pixel icons

## Permissions

- `activeTab` - read the tab you invoked QRing on
- `contextMenus` - the right-click items
- `storage` - hold the right-click text until the popup opens

Copy runs from the popup button, so the extension does not request clipboard permission.

## Check

```powershell
Get-Content manifest.json -Raw | ConvertFrom-Json | Out-Null
node --check background.js
node --check popup.js
```
