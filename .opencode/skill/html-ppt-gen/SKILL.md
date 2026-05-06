---
name: html-ppt-gen
description: "Generate professional multi-page HTML presentations (PPT). Creates slide decks with cover, TOC, section dividers, content pages, and summary slides. Supports export to PDF/PPTX. TRIGGERS: PPT, 演示文稿, presentation, HTML slides, 幻灯片, slide deck, 汇报, 报告."
---

# HTML Presentation Generator

## Overview

You are an expert at generating complete multi-page HTML presentations. Each slide is a standalone HTML file rendered at 960×540px. You handle the full pipeline: research → color/font selection → outline planning → slide-by-slide generation (with image generation and visual verification) → final deployment. All slides are static HTML suitable for browser viewing and PPTX export.

## Workflow

Follow these steps in order for every presentation:

### Step 1 — Research (if needed)

If you lack domain knowledge about the user's topic, perform deep research first:
- Search the web for key facts, data, and context
- Validate information from multiple sources
- Organize findings to inform slide content

### Step 2 — Configure Design System

**2.1 Choose Audience**

Identify target audience to adjust design parameters:

| Audience | Characteristics | Design Impact |
|----------|----------------|---------------|
| **Executives** | Strategic, time-limited | Minimal density, large headlines, 3-5 key points |
| **Experts/Professionals** | Technical depth needed | Dense layouts, detailed data, technical language |
| **Beginners/Learners** | Educational focus | Warm mood, larger body text, step-by-step structure |
| **General** | Broad appeal | Balanced density, accessible language |

**2.2 Choose Style Dimensions**

Define visual personality using 4 independent dimensions (read `references/design-styles.md` for details):

| Dimension | Options | Quick Guide |
|-----------|---------|-------------|
| **Texture** | clean, grid, organic, paper | clean=coporate, grid=technical, organic=friendly |
| **Mood** | professional, warm, cool, vibrant, dark, neutral | professional=finance, warm=education, cool=tech |
| **Typography** | geometric, humanist, editorial, technical | geometric=modern, humanist=friendly, editorial=bold |
| **Density** | minimal, balanced, dense | minimal=executives, balanced=general, dense=technical |

**OR use presets**: corporate, technical, creative, education, executive, startup, healthcare, finance, lifestyle

**Auto-selection based on industry**:
- Tech/SaaS → technical or corporate preset
- Finance → finance or corporate preset
- Healthcare → healthcare preset
- Education → education preset
- Creative/Brand → creative or lifestyle preset

**2.3 Choose Color Palette**

Select from **references/color-palettes.md** based on mood and industry. The font is fixed:

> **⚠️ MANDATORY FONT**: All presentations use `Times New Roman` for all text.
> `font-family: 'Times New Roman', serif;`

### Step 3 — Plan the Outline

Using the **Slide Page Types** section below, create a complete slide outline:
1. Classify every slide as exactly one of the 5 page types
2. For content pages, assign a content subtype
3. Ensure variety in layouts across slides
4. Typical structure: Cover → TOC → [Section Divider → Content Pages...] → Summary

### Step 4 — Generate Slides

Generate each slide as an individual HTML file. Process up to 5 slides concurrently (not more).

For **each slide**, follow the page-type-specific workflow below. Every slide must:
1. Be saved as `slides/slide-01.html`, `slides/slide-02.html`, etc. (zero-padded two digits)
2. Store any generated images in `slides/imgs/`
3. Use the exact 960×540 `.slide-content` dimensions
4. Use `Times New Roman` font for all text
5. **Check anti-patterns** — Review `references/anti-patterns.md` for industry-specific and slide-type-specific patterns to avoid
6. After writing HTML, verify layout using `bun scripts/verify_layout.ts --html slides/slide-XX.html --type <type>` — check for structure correctness, constraint compliance, and type-specific requirements. Fix any issues before moving on.

**Image generation**: Use `bun scripts/generate_image.ts --prompt "..." --output slides/imgs/cover.png --ar 16:9` for cover and content slides.

**Before generating each slide**: Read the corresponding HTML implementation rules in `references/html-implementation.md` and SVG guidelines in `references/svg-guidelines.md`.

**Critical anti-patterns to avoid** (see `references/anti-patterns.md` for complete list):
- ❌ Accent lines under titles — Use whitespace or background color instead
- ❌ More than 6 bullet points — Split into multiple slides
- ❌ Emojis as icons — Use SVG (Heroicons/Lucide)
- ❌ Gradients — Solid colors only
- ❌ Animations — Static slides only
- ❌ Centered body text — Left-align paragraphs and lists
- ❌ Bézier curves/arcs in SVG — Use M/L/H/V/Z only

### Step 5 — Deploy

Use `bun scripts/deploy_presentation.ts --slides ./slides --output ./dist` to merge all slides and deploy the final presentation.

**Before deployment**: Run through `references/pre-delivery-checklist.md` to validate all slides meet quality standards.

---

## Slide Page Types

Classify **every slide** as exactly one of these 5 types. This prevents layout drift and keeps the deck consistent.

### Type 1: Cover Page

**Use for**: Opening slide, tone setting.

**Content elements**:
- Main Title (72–120px, bold, commanding — the visual anchor)
- Subtitle (28–40px, clearly secondary)
- Supporting text / presenter / date (18–24px, subtle)
- Meta info (14–18px)
- Background image or strong visual motif

**Font size hierarchy**:

| Element | Size | Notes |
|---------|------|-------|
| Main Title | 72–120px | Bold, 3–5× base |
| Subtitle | 28–40px | 1.5–2× base |
| Supporting Text | 18–24px | Base |
| Meta Info | 14–18px | 0.7–1× base |

**Layout options**:

1. **Asymmetric Left-Right** — Text on one side, image on the other
2. **Center-Aligned** — Content centered over background image

**Image generation**: **MANDATORY**. You MUST call `GenerateImage` to create at least one image for the cover. Do NOT proceed to HTML until you have a valid image path.

**Workflow**:
1. Analyze topic, audience, purpose
2. Generate image (MANDATORY) — wait for file path
3. Choose layout
4. Write HTML (embed actual image path, never a placeholder)
5. Screenshot + verify

**No page number badge on cover page.**

---

### Type 2: Table of Contents

**Use for**: Navigation, expectation setting (3–5 sections).

**Content elements**:
- Page title ("Table of Contents" / "Agenda" / "Overview")
- Section numbers (01, 02… or I, II…)
- Section titles
- Optional one-line descriptions
- **Page number badge (MANDATORY)** — see `references/html-implementation.md` Appendix G

**Font size hierarchy**:

| Element | Size |
|---------|------|
| Page Title | 36–44px |
| Section Number | 28–36px |
| Section Title | 20–28px |
| Description | 14–16px |

**Layout options**:

1. **Numbered Vertical List** — Clean left-aligned structure
2. **Two-Column Grid** — 2×N grid with numbers + titles
3. **Sidebar Navigation** — Colored sidebar with section markers
4. **Card-Based** — Section cards in a row/grid

**Image generation**: OPTIONAL — most TOC slides work best with clean typography + SVG decorations.

**Workflow**:
1. Analyze section list and count
2. Choose layout (3 sections → vertical; 4–6 → grid/compact; 7+ → multi-column)
3. Plan visual hierarchy
4. Generate image (optional)
5. Write HTML with page number badge
6. Screenshot + verify

---

### Type 3: Section Divider

**Use for**: Clear transitions between major parts.

**Content elements**:
- Section number (72–120px, bold, accent color — the dominant element)
- Section title (36–48px, bold, primary color)
- Optional intro text (16–20px, light, muted)
- SVG accent shapes (bars, lines, geometric blocks)
- **Page number badge (MANDATORY)** — see `references/html-implementation.md` Appendix G

**Layout options**:

1. **Bold Center** — Number + title centered
2. **Left-Aligned with Accent Block** — Colored bar on left
3. **Split Background** — Two color zones
4. **Full-Bleed Background with Overlay** — Strong bg color, semi-transparent number

**Design decisions**: Corporate → accent block; Creative → full-bleed; Minimal → bold center. Divider style must be consistent across all dividers in one deck.

**Image generation**: OPTIONAL — most dividers work best with bold typography + solid colors + SVG accents.

**Workflow**:
1. Analyze section number, title, intro
2. Choose layout
3. Generate image (optional)
4. Write HTML with page number badge
5. Screenshot + verify

---

### Type 4: Content Page

**Use for**: The core information slides. Each content page belongs to exactly ONE subtype.

**Content subtypes**:

#### 4a. Text
- Bullets, quotes, short paragraphs
- Must include icons or SVG shapes — never plain text only

#### 4b. Mixed Media
- Two-column: image on one side, text on the other

#### 4c. Data Visualization
- SVG chart (bar/progress/ring) + 1–3 key takeaways + data source

#### 4d. Comparison
- Side-by-side columns/cards (A vs B, pros/cons)

#### 4e. Timeline / Process
- Steps with arrows, numbered connectors

#### 4f. Image Showcase
- Hero image as primary element, text supporting

**Font size hierarchy**:

| Element | Size | Notes |
|---------|------|-------|
| Slide Title | 36–44px | Bold, top of slide |
| Section Header | 20–24px | Bold, sub-sections |
| Body Text | 14–16px | Regular weight, LEFT-ALIGNED |
| Captions / Source | 10–12px | Muted color |
| Stat Callout | 60–72px | Large bold numbers |

**Content elements (all content pages)**:
1. Slide Title — always required, top of slide
2. Body Content — based on subtype
3. Visual Element — image, chart, icon, or SVG shape — ALWAYS required
4. Source / Caption — include when showing data
5. **Page number badge (MANDATORY)** — see `references/html-implementation.md` Appendix G

**Key principles**:
- Left-align body text — never center paragraphs or bullet lists
- Title must be 36pt+ for contrast with 14–16pt body
- 0.5″ minimum margins, 0.3–0.5″ between content blocks
- Each content slide should use a different layout from the previous one

**Image generation**: **MANDATORY**. Call `GenerateImage` for every content page:
- Mixed Media / Image Showcase → hero image
- Text / Data / Comparison / Timeline → supporting illustration or thematic element

**Workflow**:
1. Analyze content, determine subtype
2. Generate image (MANDATORY) — wait for file path
3. Choose layout variant for the subtype
4. Write HTML with page number badge
5. Screenshot + verify (layout matches subtype, no overlaps, badge present)

---

### Type 5: Summary / Closing Page

**Use for**: Wrap-up, action items, thank-you.

**Content elements**:
- Closing title (48–72px, bold)
- Takeaway points (18–24px, scannable)
- Call to action / next steps
- Contact info (14–16px, muted)
- **Page number badge (MANDATORY)** — see `references/html-implementation.md` Appendix G

**Layout options**:

1. **Key Takeaways** — 3–5 points with icons/check marks
2. **CTA / Next Steps** — Action items + contact info
3. **Thank You / Contact** — Centered thank-you + contact details
4. **Split Recap** — Left: takeaways; Right: CTA/contact

**Image generation**: OPTIONAL — most summary slides work best with clean typography + SVG accents.

**Workflow**:
1. Analyze closing content type
2. Choose layout
3. Generate image (optional)
4. Write HTML with page number badge
5. Screenshot + verify

---

## Design Style System

Choose ONE design style for the entire presentation. Read `references/design-styles.md` for complete specifications.

| Style | Radius | Spacing | Best For |
|-------|--------|---------|----------|
| **Sharp & Compact** | 4–6px | 4–12px | Data-heavy dashboards, IDEs |
| **Soft & Balanced** | 6–12px | 8–16px | Enterprise SaaS, management panels |
| **Rounded & Spacious** | 16–24px | 16–32px | Consumer apps, marketing pages |
| **Pill & Airy** | 32px–full | 20–48px | Landing pages, brand showcases |

**Quick rule**: Corporate/enterprise → Sharp or Soft; Consumer/brand → Rounded or Pill.

---

## HTML Implementation & SVG Guidelines

**CRITICAL**: Before writing ANY HTML, read these reference files:

- **`references/html-implementation.md`** — Appendix A-G (responsive scaling, CSS rules, color palette rules, SVG constraints, HTML2PPTX validation, page number badge)
- **`references/svg-guidelines.md`** — SVG usage patterns, supported elements, common pitfalls

**Key constraints**:
- ✅ Inline CSS only (except scaling snippet)
- ✅ Solid colors only (no gradients)
- ✅ Static slides only (no animations)
- ✅ SVG for decorative shapes (NOT images)
- ⚠️ SVG paths MUST use only M/L/H/V/Z commands (no Bézier curves, no arcs)
- ⚠️ Pie charts MUST use `GenerateImage` (SVG pie charts will fail in PPTX)
- ⚠️ Page number badge required on all slides except cover

---

## Common Mistakes to Avoid

- **Don't repeat the same layout** — vary columns, cards, and callouts across slides
- **Don't center body text** — left-align paragraphs and lists; center only titles
- **Don't skimp on size contrast** — titles need 36pt+ to stand out from 14–16pt body
- **Don't default to blue** — pick colors reflecting the specific topic
- **Don't mix spacing randomly** — choose 0.3″ or 0.5″ gaps and use consistently
- **Don't style one slide and leave the rest plain** — commit fully or keep it simple throughout
- **Don't create text-only slides** — add images, icons, charts, or visual elements
- **Don't forget text box padding** — when aligning shapes with text edges, set `margin: 0` or offset
- **Don't use low-contrast elements** — icons AND text need strong contrast against background
- **NEVER use accent lines under titles** — hallmark of AI-generated slides; use whitespace or background color instead
- **Don't use gradients** — solid colors only
- **Don't use animations** — static slides only
- **Don't overlay text on SVG with absolute positioning** — text will be lost in PPTX
- **Don't use CSS for decorative shapes** — use SVG for crispness under scaling
- **Don't forget the page number badge** — required on all slides except cover
- **Don't use Bézier curves or arcs in SVG paths** — PPTX converter will skip them

---

## File & Output Conventions

| Item | Convention |
|------|-----------|
| Slide files | `slides/slide-01.html`, `slides/slide-02.html`, … (zero-padded) |
| Image files | `slides/imgs/` directory |
| Slide dimensions | 960×540 px (`.slide-content`) |
| Font | `Times New Roman` for all text (Chinese and English) |
| CSS | Inline only (except scaling snippet in `references/html-implementation.md`) |
| Colors | From chosen palette only; no gradients |
| Animations | None — static slides only |
| Page badge | All slides except cover; bottom-right corner |
| Final deployment | Use `deploy_html_presentation` tool |

---

## Tools Reference

**IMPORTANT**: This skill includes automated tool scripts located in `scripts/` directory. Read `scripts/README.md` for detailed usage instructions.

### Quick Reference

| Tool Script | Purpose | Command |
|-------------|---------|---------|
| **Image Generation** | Create images for slides | `bun scripts/generate_image.ts --prompt "..." --output path.png` |
| **Screenshot** | Capture HTML slide as PNG | `bun scripts/screenshot_html.ts --html slide.html --output screenshot.png` |
| **Layout Verification** | Verify slide structure | `bun scripts/verify_layout.ts --html slide.html --type cover` |
| **Deployment** | Merge slides into deployable package | `bun scripts/deploy_presentation.ts --slides ./slides --output ./dist` |

### When to Use Each Tool

| Step | Tool | Usage |
|------|------|-------|
| Image generation | `generate_image.ts` | MANDATORY for cover + content pages; optional for TOC/divider/summary |
| HTML writing | Manual | Create HTML files following page type specifications |
| Layout verification | `verify_layout.ts` | After writing each slide — verify structure, constraints, requirements |
| Screenshot (optional) | `screenshot_html.ts` | For visual review or documentation |
| Final deployment | `deploy_presentation.ts` | Step 5 — merge all slides into deployable presentation |

### Prerequisites

```bash
# Install dependencies
npm install
# or: bun install

# Install Playwright browsers (for screenshot tool)
npx playwright install chromium
```

### Environment Variables

Image generation requires API keys (see `scripts/README.md` for details):

```bash
export GOOGLE_API_KEY="your-key"        # Default provider
export OPENAI_API_KEY="your-key"        # Alternative
export DASHSCOPE_API_KEY="your-key"     # 阿里云
export REPLICATE_API_TOKEN="your-token" # Alternative
```

---

## Reference Files

Read these as needed during the workflow:

### Design & Style
- **`references/design-styles.md`** — Style dimension system (Texture, Mood, Typography, Density) + presets
- **`references/color-palettes.md`** — Complete color palette library (18 palettes + Agent Design System)

### Quality Assurance
- **`references/anti-patterns.md`** — Industry-specific and slide-type anti-patterns (what NOT to do)
- **`references/pre-delivery-checklist.md`** — Validation checklist for each slide type

### Technical Implementation
- **`references/html-implementation.md`** — HTML implementation rules (Appendix A-G)
- **`references/svg-guidelines.md`** — SVG usage patterns and constraints

### Tools & Troubleshooting
- **`scripts/README.md`** — Tool usage guide and troubleshooting