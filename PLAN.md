# Homepage Expansion Plan

Personal site at `~/Dev/homepage`, expanded from the existing `ddd-presentation` repo so the design language and tooling carry over. Static HTML/CSS only — no build step, deployable as a GitHub Pages site.

## Goals

- Single landing page that introduces Nicklas without looking like a CV or job pitch.
- Easy to grow: each presentation and blog post is its own folder with a stable URL.
- Reuse the Teamtailor-flavored design tokens already in `styles.css`.
- DDD presentation keeps working unchanged at `/presentations/ddd/`.

## Final structure

```
homepage/
├── index.html                         # Landing + side menu + bio + posts list
├── styles.css                         # Site-wide tokens (lifted from ddd-presentation)
├── site.css                           # Landing/page styles (new, complements styles.css)
├── prism-theme.css                    # Kept for code blocks in posts
├── keyboard.js                        # Used by presentations only
├── assets/
│   └── profile-photo-cropped-3.jpeg   # Already present
├── presentations/
│   └── ddd/                           # Existing slide deck, unchanged
│       ├── index.html
│       ├── styles.css
│       ├── prism-theme.css
│       └── keyboard.js
├── blog/
│   ├── working-with-time-zones-in-rails/
│   │   └── index.html                 # Local render of time-zone-article README
│   └── building-basecamp-project-stacks-with-hotwire/
│       └── index.html                 # Short summary + canonical link to 37signals
└── PLAN.md                            # This file
```

## Page: landing (`index.html`)

Two-column layout, reusing the dark theme from the slides:

- **Left rail (sticky side menu)** — site name "Nicklas Ramhöj Holtryd" + sections:
  - About (anchor)
  - Presentations
    - Domain-Driven Design in Practice → `/presentations/ddd/`
  - Writing
    - Working with Time Zones in Rails → `/blog/working-with-time-zones-in-rails/`
    - Building Basecamp Project Stacks with Hotwire → `/blog/building-basecamp-project-stacks-with-hotwire/`
  - Contact (mailto + GitHub link)
- **Main column**:
  - **Hero**: name, one-line role, profile photo.
  - **About** (short, no CV vibe): the user-supplied line — *"Technology has no intrinsic value. Value is created when it enriches people's lives. It's been my passion for more than 19 years to build software that does just that."* — plus 1–2 sentences sketching what he cares about (clear code, product thinking, Rails + Hotwire). Deliberately **does not** list employers, titles, or accomplishments. No "available for hire" / "open to work" framing.
  - **Presentations** card list (currently one card → DDD).
  - **Writing** card list (two posts).
  - **Contact** footer: email + GitHub.

The bio is intentionally short. CV/cover-letter content from `~/Desktop` is **not** transcribed — only the philosophy line is used.

## Page: DDD presentation (`/presentations/ddd/`)

Move existing files into the subfolder verbatim. The presentation already self-contains everything it needs (`index.html`, `styles.css`, `prism-theme.css`, `keyboard.js`, profile photo). The only change is adding a small "← Back to homepage" link on the title slide so visitors who land directly on the deck can find their way back.

## Page: time-zone post (`/blog/working-with-time-zones-in-rails/`)

The source README in `~/Dev/time-zone-article/README.md` is Nicklas's own writing — safe to render in full locally. Convert markdown to HTML with the slides' styling:

- Reuse `--tt-*` tokens for typography and dark background.
- Use the Prism theme already in the repo for the Ruby code blocks.
- Header: title, publish date (2012-03-20), last-updated note (2016-06-22).
- Footer: link back to the landing page and to the canonical GitHub repo.

## Page: Hotwire post (`/blog/building-basecamp-project-stacks-with-hotwire/`)

The article is published at `dev.37signals.com` and is owned by 37signals. Even though Nicklas wrote it, we **do not** reproduce the full text locally. Instead the page is a thin landing page:

- Title: "Building Basecamp Project Stacks with Hotwire"
- Byline: "Originally published on the 37signals dev blog, November 7, 2023"
- A 3–5 sentence summary in Nicklas's own framing (what the piece is about, what was interesting about the implementation). No verbatim paragraphs from the original.
- Big primary CTA: **"Read the full article on dev.37signals.com →"** linking to https://dev.37signals.com/building-basecamp-project-stacks-with-hotwire/
- Back-to-homepage link.

This satisfies "we have a local copy" in the sense that there is a local landing page for the post, while keeping the canonical reading experience at 37signals — the user's stated preference.

## Styling strategy

- Keep `styles.css` as the design-token + base layer (root variables, body, typography). Lift it up to the homepage root.
- Add `site.css` for landing-page-specific layout: side menu, hero grid, card lists, post body. The deck under `/presentations/ddd/` keeps its own copy of `styles.css` so it remains self-contained and editable in isolation.
- Posts use a centered, readable-width article layout (~70ch) over the dark theme. Inline code uses Prism colors already defined.

## Implementation phases (parallelizable)

1. **Skeleton + structure** — create folders, move DDD assets, copy shared assets, write `site.css` shell.
2. **Landing page** — write `index.html` with side menu, hero, about, lists, footer.
3. **Time-zone post** — convert README to HTML with site styling, wire up navigation.
4. **Hotwire post** — write summary page with canonical link.
5. **Polish** — add "back to homepage" affordance to DDD title slide, double-check links, verify in browser.

Phases 2, 3, 4 are independent and can run in parallel after phase 1.
