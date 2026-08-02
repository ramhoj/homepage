---
name: retina-screenshots
description: Use when taking browser screenshots for presentations or documentation that need to be crisp and high-resolution on Retina/HiDPI displays
---

# Retina Screenshots via Playwright + CDP

Captures 2× Retina-quality screenshots by connecting to an already-authenticated browser via Chrome DevTools Protocol (CDP), then using `Page.captureScreenshot` with `scale: 1`. On a Mac with a native 2× display, this produces screenshots at double the logical pixel dimensions (e.g. 2880×1696 for a 1440×848 viewport clip).

## When to use

- Taking screenshots for presentations, docs, or READMEs that need to look sharp on Retina displays
- Automating screenshot workflows against an authenticated dev/staging app
- Replacing blurry 1× screenshots that look bad on modern screens

## Core setup

```javascript
import { chromium } from './node_modules/playwright/index.mjs';
import { writeFileSync, readFileSync } from 'fs';

// Connect to the already-authenticated MCP Playwright browser
// Find the CDP port with: lsof -nP -iTCP -sTCP:LISTEN | grep chromium
const browser = await chromium.connectOverCDP('http://localhost:52249');
const context = browser.contexts()[0];
const page = context.pages()[0];
await page.setViewportSize({ width: 1440, height: 900 });
const cdp = await context.newCDPSession(page);

// The key: scale: 1 on a Mac Retina display (native 2× DPR) outputs at 2× logical pixels
async function shot(outputPath, clip) {
  const r = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    clip: { ...clip, scale: 1 },
  });
  writeFileSync(outputPath, Buffer.from(r.data, 'base64'));
  // Log dimensions for verification
  const b = readFileSync(outputPath);
  console.log(`${outputPath}: ${b.readUInt32BE(16)}×${b.readUInt32BE(20)} (${Math.round(b.length / 1024)}KB)`);
}

// Common clips at 1440×900 viewport
const FULL    = { x: 0,   y: 52, width: 1440, height: 848 }; // → 2880×1696 output
const CONTENT = { x: 295, y: 52, width: 1145, height: 848 }; // → 2290×1696 output (no sidebar)
```

## Why scale: 1 works

`Page.captureScreenshot` renders at the browser's native device pixel ratio. When Chrome is running on a Mac Retina display, the DPR is 2. Requesting `scale: 1` uses that native DPR — so a 1440×848 logical clip becomes 2880×1696 physical pixels. This is equivalent to what the user sees at native resolution.

Do NOT use `Emulation.setDeviceMetricsOverride` with `deviceScaleFactor: 2` — this only affects emulated pages, not the native connected browser's DPR.

## Navigating without stale state (Ember apps)

Ember preserves filter/panel state across route transitions. Use `about:blank` as a hard reset:

```javascript
async function freshNav(url) {
  await page.goto('about:blank');
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2000); // let Ember settle
}
```

## Clicking inside modals (backdrop intercepts pointer events)

Ember modals render with a backdrop div that has `pointer-events: none` on its children but intercepts events at the backdrop level. `elementHandle.click()` times out. Use `page.evaluate()` instead:

```javascript
// ❌ Fails with timeout — backdrop intercepts:
await page.click('button:has-text("Archive")');

// ✅ Works — directly calls .click() on the DOM node:
await page.evaluate((txt) => {
  // IMPORTANT: use innerText (rendered text), not textContent (includes hidden whitespace)
  const modal = document.querySelector('#ember-teamtailor-modal, [role="dialog"]');
  const btn = [...(modal || document).querySelectorAll('button')]
    .find(b => b.innerText.trim() === txt);
  if (btn) btn.click();
}, 'Archive');
await page.waitForTimeout(1500);
```

**Critical**: use `innerText.trim()` not `textContent.trim()`. Ember button templates often include hidden `<span>` elements with whitespace, making `textContent` something like `"Archive\n      \n    Archive"`. `innerText` strips those.

## Clicking bulk-select checkboxes

Table row checkboxes are `input.peer.sr-only` (screen-reader only, not pointer-interactive). Their `<label>` intercepts pointer events. Click the label:

```javascript
await page.evaluate((targets) => {
  for (const row of document.querySelectorAll('table tbody tr')) {
    if (targets.some(t => row.textContent.includes(t))) {
      row.querySelector('label')?.click();
    }
  }
}, ['C++', 'Cobol']);
await page.waitForTimeout(600);
```

## Clicking the floating action bar

The action bar floats at the bottom of the viewport (y > ~780px). Locate its buttons by position:

```javascript
async function clickBar(txt) {
  await page.evaluate((txt) => {
    for (const btn of document.querySelectorAll('button')) {
      const r = btn.getBoundingClientRect();
      if (r.y > 780 && btn.innerText.trim() === txt) { btn.click(); return; }
    }
  }, txt);
  await page.waitForTimeout(1200);
}
```

## Custom dropdowns (power-select / Ember select)

When a modal uses a custom component (not a native `<select>`), click the trigger button then select an option:

```javascript
// 1. Open the dropdown
await page.evaluate(() => {
  const trigger = [...document.querySelectorAll('button')]
    .find(b => b.innerText.trim() === 'Select destination');
  trigger?.click();
});
await page.waitForTimeout(500);

// 2. Click the option in the dropdown list
await page.evaluate((option) => {
  const opt = [...document.querySelectorAll('[role="option"], li')]
    .find(el => el.innerText.trim() === option);
  opt?.click();
}, 'Leadership');
await page.waitForTimeout(500);
```

## Finding the CDP port

```bash
lsof -nP -iTCP -sTCP:LISTEN | grep -i chrom
# Look for the DevTools port (usually 9222 or 52249 for MCP Playwright)
```

## Trimming dead space in modal screenshots

Modals are centered in the full viewport. At 1440px wide, a ~500px modal sits at viewport center (~720px), leaving ~470px of blank space on the right. To eliminate this dead space, **clip to ~1000px width from x=0** — this includes the left sidebar (~295px) plus content up to just past the modal's right edge, cutting ~440px from the right.

```javascript
// ❌ Too wide — 470px dead space on right:
const CONTENT = { x: 295, y: 52, width: 1145, height: 848 }; // 2290×1696 output

// ✅ Tight modal clip — includes sidebar, removes right dead space:
const MODAL   = { x: 0, y: 52, width: 1000, height: 848 };   // 2000×1696 output
const MODAL_W = { x: 0, y: 52, width: 1100, height: 848 };   // 2200×1696 — for wider modals (e.g. two columns)
```

**Why not narrow the viewport?** Teamtailor's sidebar collapses to full-width below ~1100px, breaking the layout. The Teamtailor sidebar is position-fixed and does not shrink; attempting viewports below ~1200px causes it to fill the screen. Stick to 1440px and clip.

**When the right filter panel is open**, it appears at the right edge of the content area. Detect its x-position and clip to that edge to avoid including it:

```javascript
const panelX = await page.evaluate(() => {
  const panel = document.querySelector('[class*="filter"], aside');
  return panel ? Math.round(panel.getBoundingClientRect().x) : null;
});
const clip = { x: 295, y: 52, width: (panelX || 1440) - 295, height: 848 };
```

**For table/list views (no modal)**, the filter panel being closed gives a cleaner look. Test if closing the filter panel persists the filter state by checking whether target rows are still visible after close — in Ember apps, closing the panel sometimes resets filters, so always verify:

```javascript
// After clicking Filters (close), verify rows still visible
const rows = await page.evaluate(() =>
  [...document.querySelectorAll('table tbody tr')].map(r => r.cells[0]?.innerText?.trim()).filter(Boolean)
);
if (!rows.some(r => r?.includes('ExpectedItem'))) {
  // Closing reset the filter — reopen the panel
  await page.click('button:has-text("Filters")');
}
```

## Output size targets

| Resolution | File size | Notes |
|-----------|-----------|-------|
| 2880×1696 | 200–300KB | Full viewport, good quality |
| 2290×1696 | 150–200KB | Content-only (no sidebar) |
| 2000×1696 | 150–200KB | Modal clip (sidebar + modal, no right dead space) |
| 2200×1696 | 200–250KB | Wide modal clip |

If files are smaller than ~80KB, the screenshot is likely 1× — check that `scale: 1` is being used with the CDP method, not Playwright's built-in `page.screenshot()`.
