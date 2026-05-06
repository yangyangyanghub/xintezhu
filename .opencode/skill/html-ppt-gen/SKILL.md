---
name: html-ppt-gen
description: "Generate professional HTML presentations with template-driven authoring, 36 CSS themes, presenter mode, and PPTX export. TRIGGERS: PPT, 演示文稿, presentation, HTML slides, 幻灯片, slide deck, 汇报, 报告, keynote, 演讲稿, 分享稿, 逐字稿, tech sharing, 小红书图文."
---

# HTML Presentation Generator

## Overview

You are an expert at generating multi-page HTML presentations. Each slide is a standalone HTML file rendered at **960×540px**. You handle the full pipeline: research → design system → choose starting point (36 themes + 15 deck templates + 31 layouts) → plan outline → template-driven slide generation (with image generation + verification) → deployment.

**Core principle**: **Never author from scratch**. Always start from the closest template, then replace content.

## Workflow

### Step 1 — Research (if needed)

If you lack domain knowledge, search for key facts, data, and context. Validate from multiple sources.

### Step 2 — Choose Your Starting Point

**Before writing any slide, know three things**: content/audience, style/theme, and starting point.

**2.1 Pick a Theme (36 CSS themes, one `<link>` switches entire style)**

| Tone | Recommended Themes |
|------|-------------------|
| Business / investor | `pitch-deck-vc`, `corporate-clean`, `swiss-grid` |
| Tech sharing / engineering | `tokyo-night`, `dracula`, `catppuccin-mocha`, `terminal-green`, `blueprint` |
| 小红书图文 | `xiaohongshu-white`, `soft-pastel`, `rainbow-gradient`, `magazine-bold` |
| Academic / report | `academic-paper`, `editorial-serif`, `minimal-white` |
| Edgy / cyber / launch | `cyberpunk-neon`, `vaporwave`, `y2k-chrome`, `neo-brutalism` |
| Education / warm | `soft-pastel`, `catppuccin-latte`, `gruvbox-dark` |

Full 36 themes: `minimal-white`, `editorial-serif`, `soft-pastel`, `sharp-mono`, `arctic-cool`, `sunset-warm`, `catppuccin-latte`, `catppuccin-mocha`, `dracula`, `tokyo-night`, `nord`, `solarized-light`, `gruvbox-dark`, `rose-pine`, `neo-brutalism`, `glassmorphism`, `bauhaus`, `swiss-grid`, `terminal-green`, `xiaohongshu-white`, `rainbow-gradient`, `aurora`, `blueprint`, `memphis-pop`, `cyberpunk-neon`, `y2k-chrome`, `retro-tv`, `japanese-minimal`, `vaporwave`, `midcentury`, `corporate-clean`, `academic-paper`, `news-broadcast`, `pitch-deck-vc`, `magazine-bold`, `engineering-whiteprint`

Load `references/themes.md` for complete descriptions via `read_skill_file`.

**2.2 Pick a Full-Deck Template (15 available)**

If the content matches, copy from `templates/full-decks/<name>/`:
- **Pitch**: `pitch-deck`
- **Product Launch**: `product-launch`
- **Tech Sharing**: `tech-sharing`
- **Weekly Report**: `weekly-report`
- **小红书 3:4 竖版**: `xhs-post` (9 pages, 3:4 ratio)
- **Course Module**: `course-module`
- **演讲者模式**: `presenter-mode-reveal` (built-in 逐字稿 examples)
- Plus 8 real-world extractions: `xhs-white-editorial`, `graphify-dark-graph`, `knowledge-arch-blueprint`, `hermes-cyber-terminal`, `obsidian-claude-gradient`, `testing-safety-alert`, `xhs-pastel-card`, `dir-key-nav-minimal`

Load `references/full-decks.md` via `read_skill_file` for details.

**2.3 Pick Single-Page Layouts (31 available)**

Load `references/layouts.md` via `read_skill_file` to find the closest layout, then copy and replace content.

**2.4 Configure Design System — 4 Dimensions**

If not using a CSS theme, define visual personality:

| Dimension | Options | Quick Guide |
|-----------|---------|-------------|
| **Texture** | clean, grid, organic, paper | clean=corporate, grid=technical, organic=friendly |
| **Mood** | professional, warm, cool, vibrant, dark, neutral | professional=finance, warm=education, cool=tech |
| **Typography** | geometric, humanist, editorial, technical | geometric=modern, humanist=friendly, editorial=bold |
| **Density** | minimal, balanced, dense | minimal=executives, balanced=general, dense=technical |

Load `references/design-styles.md` via `read_skill_file` for complete specs.

**2.5 Choose Color Palette**

Select from **18 Chinese color palettes** in `references/color-palettes.md` (read via `read_skill_file`). Key palettes:

| # | 名称 | 适用场景 |
|---|------|----------|
| 1 | 现代与健康 | 医疗健康、心理咨询、护肤 |
| 2 | 商务与权威 | 年度汇报、金融分析、政务 |
| 7 | 活力与科技 | 创业路演、体育赛事 |
| 9 | 科技与夜景 | 科技发布、高端汽车 |
| 15 | 纯净科技蓝 | 云计算/AI、洁净能源 |
| 18 | 铂金白金 | Agent 产品、金融科技 |

**2.6 Font — Noto Sans SC + Noto Serif SC**

> **MANDATORY DEFAULT FONT**: Chinese body → `Noto Sans SC`, Chinese titles → `Noto Serif SC`. English fallback → `Times New Roman`.
> ```css
> font-family: 'Noto Sans SC', 'Noto Serif SC', 'Times New Roman', serif;
> ```
> For PPTX export, see [HTML Implementation Rules] section for font compatibility notes.

### Step 3 — Plan the Outline

Using the **Slide Page Types** section below, create a complete outline:
1. Classify every slide as exactly one of the 5 page types
2. For content pages, assign a content subtype
3. Ensure layout variety across slides
4. Typical structure: Cover → TOC → [Section Divider → Content Pages...] → Summary

### Step 4 — Generate Slides

Generate up to 5 slides concurrently. For **each slide**:
1. Save as `slides/slide-01.html`, `slides/slide-02.html`, etc. (zero-padded)
2. Store images in `slides/imgs/`
3. Use exact 960×540 `.slide-content` dimensions
4. Use **Noto Sans SC** (body) + **Noto Serif SC** (titles) as default font
5. **🎤 If presenter mode requested** (演讲/分享/讲稿/逐字稿): use `presenter-mode-reveal` template, write 150-300 words 逐字稿 in `<aside class="notes">` per slide. See Step 4b.
6. **Generate images** — cover + content pages MANDATORY (see below)
7. Verify: `bun scripts/verify_layout.ts --html slides/slide-XX.html --type <type>`
8. Fix any issues before moving on

**Image generation**: `bun scripts/generate_image.ts --prompt "..." --output slides/imgs/cover.png --ar 16:9`
- Cover pages: **MANDATORY** hero image
- Content pages: **MANDATORY** supporting illustration or chart
- TOC/Divider/Summary: optional

**Before writing HTML**: Read `references/html-implementation.md` and `references/svg-guidelines.md` via `read_skill_file`.

**4a. Template-Driven Authoring (NOT from scratch)**

Copy the closest `<section class="slide">...</section>` block from `templates/single-page/*.html`, then replace content. Never author slides from zero.

**4b. 🎤 Presenter Mode (演讲者模式)**

Trigger words: **演讲 / 分享 / 讲稿 / 逐字稿 / presenter / 演讲者视图**.

When triggered:
- Use `presenter-mode-reveal` full-deck template
- Write **150-300 words** of 逐字稿 per slide in `<aside class="notes">`
- Rules: ① 口语化（"因此"→"所以"） ② 关键词加粗 ③ 过渡句独立成段
- Press **S** opens popup with 4 magnetic cards: CURRENT / NEXT / SCRIPT / TIMER
- Cards are draggable + resizable, positions persist to `localStorage`

**4c. Keyboard Navigation (built-in via `runtime.js`)**

Every deck MUST include `<script src="../assets/runtime.js"></script>`:

| Key | Action |
|-----|--------|
| `←` `→` `Space` | Navigate slides |
| `F` | Fullscreen |
| `T` | Cycle themes |
| `A` | Cycle animations |
| `S` | Open presenter mode (演讲者模式) |
| `O` | Overview grid |
| `N` | Quick notes drawer |
| `#/N` | Deep-link to slide N |

**4d. Animations (optional)**

- **27 CSS animations**: `data-anim="fade-up"` on any element (catalog: `references/animations.md`)
- **20 Canvas FX**: `data-fx="particle-burst"` for particles/graph/fireworks (catalog: `references/animations.md`)
- All animations are **opt-in** — static by default

### Step 5 — Deploy

Run `bun scripts/deploy_presentation.ts --slides ./slides --output ./dist`.

Before deployment: validate all slides via `references/pre-delivery-checklist.md`.

---

## Slide Page Types

Classify **every slide** as exactly one of these 5 types.

### Type 1: Cover Page

**Use for**: Opening slide, tone setting.

**Elements**: Main Title (72–120px bold), Subtitle (28–40px), Supporting text / presenter / date (18–24px), Background image or visual motif.

**Layouts**: Asymmetric Left-Right, Center-Aligned
**Image**: **MANDATORY**
**No page number badge**.

### Type 2: Table of Contents

**Use for**: Navigation, 3–5 sections.

**Elements**: Page title, Section numbers (01, 02…), Section titles, Optional descriptions, **Page number badge (MANDATORY)**.

**Layouts**: Numbered Vertical List, Two-Column Grid, Sidebar Navigation, Card-Based
**Image**: Optional

### Type 3: Section Divider

**Use for**: Clear transitions between major parts.

**Elements**: Section number (72–120px accent color), Section title (36–48px), Optional intro text, **Page number badge (MANDATORY)**.

**Layouts**: Bold Center, Left-Aligned Accent Block, Split Background, Full-Bleed with Overlay
**Image**: Optional

### Type 4: Content Page

**Use for**: Core information slides. Pick ONE subtype:

| Subtype | Description |
|---------|-------------|
| **4a. Text** | Bullets, quotes — requires icons/SVG, never plain text only |
| **4b. Mixed Media** | Two-column: image + text |
| **4c. Data Viz** | SVG chart + 1–3 takeaways + data source |
| **4d. Comparison** | Side-by-side columns (A vs B) |
| **4e. Timeline/Process** | Steps with arrows, numbered connectors |
| **4f. Image Showcase** | Hero image dominant, text supporting |

**Elements**: Slide Title (36–44px), Body content (14–16px LEFT-ALIGNED), Visual Element (always required), **Page number badge (MANDATORY)**.

**Image**: **MANDATORY** for all content pages.

### Type 5: Summary / Closing Page

**Use for**: Wrap-up, action items, thank-you.

**Elements**: Closing title (48–72px), Takeaway points (18–24px), Call to action, Contact info, **Page number badge (MANDATORY)**.

**Layouts**: Key Takeaways, CTA/Next Steps, Thank You/Contact, Split Recap
**Image**: Optional

---

## Theme System

**One theme = entire deck look.** Switch via one `<link>` tag. Press `T` to cycle at runtime.

All 36 themes are listed in Step 2.1. Load `references/themes.md` via `read_skill_file` for when-to-use guidance per theme.

---

## Presenter Mode (🎤 演讲者模式)

Press **S** opens a new window with 4 draggable/resizable magnetic cards:
- 🔵 **CURRENT** — iframe preview of current slide
- 🟣 **NEXT** — iframe preview of next slide
- 🟠 **SPEAKER SCRIPT** — large-font 逐字稿 (scrollable)
- 🟢 **TIMER** — elapsed time + slide counter + prev/next/reset

Previews use `<iframe src="?preview=N">` — same CSS/fonts as audience view, pixel-perfect.

**逐字稿 rules**: 150-300 words/slide, 口语化, keywords bold. NEVER put presenter-only text on the slide — use `<aside class="notes">` (hidden from audience, visible in presenter).

All 15 full-deck templates support presenter mode. `presenter-mode-reveal` has built-in examples.

---

## Keyboard Shortcuts

| Key | Audience | Presenter Window |
|-----|----------|-----------------|
| `←` `→` `Space` | Navigate | Navigate (syncs) |
| `F` | Fullscreen | — |
| `T` | Cycle themes | — |
| `A` | Cycle animations | — |
| `S` | Open presenter | — |
| `O` | Overview grid | — |
| `N` | Notes drawer | — |
| `R` | — | Reset timer |
| `Esc` | Close overlays | Close popup |

---

## HTML Implementation Rules

**MUST read** `references/html-implementation.md` and `references/svg-guidelines.md` via `read_skill_file` before writing any HTML.

**Critical constraints**:
- ✅ Inline CSS only (except responsive scaling snippet in Appendix A)
- ✅ Solid colors only (no gradients)
- ✅ SVG for decorative shapes only
- ⚠️ SVG paths: **M/L/H/V/Z commands ONLY** — no Bézier curves, no arcs (PPTX converter will skip them)
- ⚠️ **NO absolute-positioned text over SVG** — text lost in PPTX export
- ⚠️ Pie charts: use `GenerateImage`, not SVG (SVG pie fails in PPTX)
- ⚠️ Page number badge: required on ALL slides except cover
- ⚠️ **Font for PPTX export**: If PPTX export is needed, prefer `Times New Roman` / `Arial` over Noto fonts — Windows PPTX converter may not have CJK fonts installed. Embed note: "如需 PPTX 导出，建议在 HTML 中临时切换为 Times New Roman 以避免中文缺字"

---

## Anti-Patterns (Top 10)

1. ❌ Accent lines under titles — use whitespace or background color
2. ❌ More than 6 bullet points — split into multiple slides
3. ❌ Emojis as icons — use SVG (Heroicons/Lucide)
4. ❌ Gradients or animations when PPTX export needed — solid + static only
5. ❌ Centered body text — left-align paragraphs and lists
6. ❌ Bézier curves/arcs in SVG paths — M/L/H/V/Z only
7. ❌ Text-only slides — always add images/icons/charts
8. ❌ Low-contrast elements — ensure strong contrast against background
9. ❌ Repeating same layout — vary columns, cards, callouts
10. ❌ Presenter notes visible on slide — use `<aside class="notes">`, not visible `<p>`

---

## Tools Reference

| Tool Script | Purpose | Command |
|-------------|---------|---------|
| Image Generation | Create slide images | `bun scripts/generate_image.ts --prompt "..." --output path.png` |
| Screenshot | Capture slide as PNG | `bun scripts/screenshot_html.ts --html slide.html --output out.png` |
| Layout Verify | Check slide structure | `bun scripts/verify_layout.ts --html slide.html --type cover` |
| Deploy | Merge slides | `bun scripts/deploy_presentation.ts --slides ./slides --output ./dist` |

Full usage: read `scripts/README.md` via `read_skill_file`.

### Prerequisites
```bash
npm install  # or: bun install
npx playwright install chromium  # for screenshot tool
```

---

## Reference Files

Read these via `read_skill_file` as needed:

### Design & Style
- `references/design-styles.md` — 4-dimension design system + presets
- `references/color-palettes.md` — 18 Chinese color palettes + Agent Design System
- `references/themes.md` — all 36 CSS themes with when-to-use guide **(new)**

### Quality Assurance
- `references/anti-patterns.md` — industry/slide-type anti-patterns
- `references/pre-delivery-checklist.md` — validation checklist

### Technical
- `references/html-implementation.md` — Appendix A-G (scaling, CSS, colors, SVG, PPTX, badges)
- `references/svg-guidelines.md` — SVG usage patterns and constraints

### Open-Source Templates **(new)**
- `references/full-decks.md` — 15 full-deck template catalog
- `references/layouts.md` — 31 single-page layout catalog
- `references/animations.md` — 27 CSS + 20 Canvas FX animations
- `references/presenter-mode.md` — 演讲者模式 + 逐字稿 authoring guide
- `references/authoring-guide.md` — complete workflow walkthrough

### Tools
- `scripts/README.md` — tool usage guide and troubleshooting
