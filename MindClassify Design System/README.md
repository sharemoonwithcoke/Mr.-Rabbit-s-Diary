# MindClassify Design System

A warm, fluffy, and cozy design system for **MindClassify** — a mental-health journaling app that classifies diary entries into seven emotional states using an NLP model, then writes a poetic reply back to the user via Claude.

> The diary that writes back. Not a clinical dashboard — a soft, paper-cream notebook a user can trust with their most private thoughts.

---

## Source materials

This system is reverse-engineered from the live codebase. If you have access, browse them for deeper context:

- **App + ML monorepo** — <https://github.com/sharemoonwithcoke/Mental-Health-Categorised-Diary>
  - `frontend/` — React 18 + TailwindCSS web app (Journal, History, Chat)
  - `mobile/` — React Native (Expo) twin of the web app
  - `backend/` — Express + MongoDB + Anthropic SDK (the "diary companion" Claude prompt lives here)
  - `model_service/` — Python / PyTorch / HuggingFace classifier (MentalBERT)
- **Standalone NLP repo** — <https://github.com/sharemoonwithcoke/MindClassify>

If you're building real product features you should open the repos above; the heart of the brand voice lives in `backend/src/controllers/companionController.js` (the system prompt for the diary companion) and `frontend/src/components/CompanionCard.jsx`.

---

## What this system covers

| Surface | Status |
|---|---|
| Web app (React) | ✅ Recreated in `ui_kits/web/` |
| Mobile app (React Native) | ✅ Visual reference in `ui_kits/mobile/` |
| Marketing / slides | Not provided; not built |
| Email | Not provided; not built |

The system covers two real products (web + mobile) and the shared visual + content rules they both follow.

---

## Products

### 1. MindClassify Web (`localhost:3000`)
React 18 + TailwindCSS, three routes:
- **Journal** (`/`) — write entry → ML classifies → Claude writes back
- **History** (`/history`) — list of past entries + stacked-area mood-trend chart
- **Chat** (`/chat`) — open-ended conversation with the diary companion

### 2. MindClassify Mobile (Expo)
Same three surfaces ported to React Native: Home + History tabs, plus the companion card.

Both products share the **seven-class taxonomy** of emotional states:

| ID | Class | Soft icon | Original colour | Cozy reskin |
|----|-------|---|---|---|
| 0 | Normal | 😊 | `#4CAF50` | sage `#5B8C6A` |
| 1 | Depression | 💙 | `#2196F3` | cornflower `#6B8FB5` |
| 2 | Suicidal | 🆘 | `#F44336` | terracotta `#C75440` |
| 3 | Anxiety | 😰 | `#FF9800` | amber `#D17A1E` |
| 4 | Stress | 😤 | `#9C27B0` | plum `#9A6F95` |
| 5 | Bipolar | 🔄 | `#00BCD4` | teal `#4E9499` |
| 6 | Personality Disorder | 🌀 | `#795548` | mocha `#8B6D4F` |

The cozy reskin is what the visual layer of this design system uses everywhere — softer, dustier, more "watercolor swatches in a journal". The raw values are kept as `--color-<name>-raw` for parity with what's currently shipping.

---

## Content fundamentals

> If colours and type are the body, copy is the soul. MindClassify has one of the clearest voices in the codebase — preserve it.

### Voice
The brand has **two voices**, and they're explicitly separated in the product:

**1. The UI voice — quiet, second-person, helpful.**
Used in labels, buttons, hints, history metadata. Direct, no jargon, no marketing.

> - "How are you feeling today?"
> - "Write freely — your diary will listen, and write back."
> - "Your entry will be classified into one of 7 mental health categories."
> - "A private space to explore your thoughts — Claude listens and replies."
> - "Type a message… (Enter to send, Shift+Enter for new line)"

**2. The diary voice — poetic, italic, first-person-of-the-diary-itself.**
Used in the CompanionCard, in chat replies. Always italic serif. The system prompt (from `backend/src/controllers/companionController.js`) is the source of truth:

> "You are the living voice of someone's most private diary. When someone writes in you, you write back. … You are optimistic, not blindly, but with the quiet certainty that light exists inside even the hardest moments. You speak in images and gentle metaphor, but you never sacrifice warmth for cleverness. … Never name a diagnosis. Never sound like a chatbot, an AI, or a therapist."

Three-step structure for every diary reply: **acknowledge → reflect → open a window to hope**. Max 3–4 sentences. For suicidal entries, the final sentence is **always** the 988 lifeline disclosure — this is a non-negotiable rule baked into the prompt.

### Casing & punctuation
- **Sentence case** everywhere — never Title Case in buttons or section titles. "New chat", not "New Chat". "Analyse & Save", not "Analyze & save".
- **British spelling** is used in the codebase (`analyse`, `behaviour`, `colour`, `customise`). Keep it consistent.
- **Em-dashes and ellipses are welcome** — they slow the reader down. "Write freely… describe your thoughts, feelings, or anything on your mind."
- **Numbers in copy** — write small numbers ("one of 7") with the digit when it's a count, the word when it's prose. The codebase uses both.
- **Time format** — `en-GB`: `25 May 2026 · 14:32`.

### "I" vs "you"
- The UI addresses the user as **you**.
- The diary companion writes in **first person** as the diary itself, but never says "I am Claude" or "as an AI".
- The user never sees the word "Claude" in product copy — internally it's the model, externally it's "your diary companion".

### Emoji
- **Used deliberately** as classification icons (😊 💙 🆘 😰 😤 🔄 🌀) and as the brand wordmark glyph (🧠 in the navbar, 🪶 quill for the companion).
- **Not used decoratively** in body copy or marketing copy.
- The 🪶 quill is the diary companion's signature — wherever Claude speaks, the quill goes.
- 🆘 is the only "loud" icon and is reserved for the Suicidal class. Don't downgrade it.

### Safety language
This is a mental-health product. The system explicitly:
- **Never** says "you have depression / anxiety" — diagnoses are forbidden in the companion prompt.
- **Always** includes the 988 Suicide & Crisis Lifeline when the Suicidal class is triggered.
- **Always** ends product surfaces with a disclaimer: "Not a substitute for professional mental health support."
- The word "support" beats "help" in disclaimers; "reach out" beats "contact".

### Vibe in one line
*A soft-spoken friend who happens to be a poet, handing you a cup of tea and your own notebook.*

---

## Visual foundations

### Colour vibe
Warm, dusty, paper-like. Pure white and pure grey are **banned**; backgrounds are cream (`#FBF6EC`), text is warm brown-black (`#3C2E22`), neutrals are warm beige/mocha rather than cool grey. Shadows are tinted with an amber-warm RGB (`146 100 64`), never neutral black — this is the single biggest thing that makes the UI feel cozy.

The 7 classification colours are the only saturated hues in the palette and they appear **only inside class chips / badges / progress bars** — never as page chrome.

### Type
- **UI sans:** Plus Jakarta Sans (400/500/600/700/800). Rounded terminals, friendly without being cartoonish. ⚠️ *Substituted* for the codebase's Inter — see [font caveat](#font-caveat) below.
- **Diary serif:** Lora (regular + italic). Bookish, warm. Used for: h1/h2, the diary companion's voice, chat bubbles from the assistant, the "— written for you" sign-off. Used **italic** whenever the diary speaks.
- **Handwritten accent:** Caveat. Used sparingly — date stamps, sign-offs, the very occasional pull-quote. Never for body copy.
- **Mono:** system mono only, for code examples in docs/`.env`-style hints.

Base size is 15px (not the web default 16px) — gives the dense journal UIs more breathing room.

### Spacing
4-pt grid. Card interior padding is generous (24px / `--sp-6`); chips are tight (12px horizontal); section spacing between cards is `--sp-6` to `--sp-8`. Lists never crowd — the History view uses `--sp-4` between EntryCards minimum.

### Backgrounds
- Pages: solid cream `#FBF6EC`.
- Cards: solid paper `#FFFCF6`.
- The **only gradient** in the whole system is the companion card's `linear-gradient(135deg, #fdfaf4 0%, #fdf6e3 100%)` — and the chat thread's `linear-gradient(180deg, #fdfaf4 0%, #f9fafb 100%)`. Both are extremely subtle. **No other gradients. No bluish-purple gradients. Ever.**
- No background images, no patterns, no textures (yet — a subtle paper-grain SVG would be on-brand if you add one later).

### Borders & cards
- Hairline `1px solid var(--color-line)` (`#EFE3CE`).
- A card = `bg-paper + border-line + radius-md (14px) + shadow-sm`. That's the recipe.
- Classification-class cards bump the border up to that class's `-line` colour for visual coding.
- The diary companion card uses `border-color: var(--color-diary-line)` (`#FDE68A`) — warmer amber — which is what makes it visually distinct from a normal card.

### Corner radii — generous & fluffy
- Buttons: **10–12px** (`--r-sm`)
- Inputs: **12px** (`--r-sm` to `--r-md`)
- Chips/badges: **999px** (full pill)
- Cards: **14–18px** (`--r-md` to `--r-lg`)
- Chat bubbles: **16px round** with the speaker's near corner cropped to 4px ("rounded-bl-sm"/"rounded-br-sm")
- Sheets / hero / mood-chart panel: **24px**

Nothing in the system has a 0–4px radius. If it looks pointy, it's wrong.

### Shadows
Warm-amber RGB base, never neutral black:
- `--shadow-sm` on resting cards
- `--shadow-md` on hovered cards (the EntryCard upgrades shadow on hover)
- `--shadow-lg` on modals / sheets / focused inputs
- `--shadow-cozy` reserved for hero / featured surfaces

No inset shadows on inputs (Tailwind's default ring is used instead). No drop-shadow on text. No "left-border accent" cards — banned visual trope.

### Animation
- Default transitions: **`color`, `background-color`, `border-color`, `box-shadow`, `transform`** on 150–220ms with `ease-out`.
- **No bounces**, no spring, no scale-up-then-down. The brand is *calm*.
- The only animated thing in the codebase is: the chat typing indicator (3 dots, `animate-bounce` with 0/150/300ms stagger — amber dots, not grey), the companion-card skeleton (gentle pulse), and a 500ms width transition on probability bars when results render. Mimic these; don't invent new motion.
- Page transitions: instant. Route changes are crossfades at most.

### Hover & press states
- **Hover** — slightly darker bg for buttons (`honey-hover`), slightly stronger shadow for cards, slightly darker ink for links.
- **Press / active** — **never shrink-and-bounce**. The codebase uses `disabled:opacity-50` and that's it. If you add an active state, it should be: `opacity: 0.85` or one tone darker, no `scale()`.
- **Focus** — `ring-2 ring-honey/40` (was `ring-indigo-500`) plus removal of the default border colour. Always visible — accessibility-first.

### Transparency & blur
- Almost never used. The only translucent surface in the codebase is the companion-card loading skeleton (`bg-amber-50/60` and `bg-amber-200/70` shimmer bars) and the chat thread's translucent gradient.
- **No backdrop-blur**, no glassmorphism. The brand is paper, not glass.

### Layout rules
- Centered single-column at `max-w-4xl` (≈896px) for all main views.
- Sticky top navbar (`sticky top-0`), no sidebars, no drawers. The web app is intentionally one narrow column — a journal page, not a dashboard.
- Mobile uses the standard Expo Router tab bar at the bottom.
- Generous breathing room at the top of every page: `py-8` for the main container.

### Imagery
- **No photography in the live app.** It's a journaling product — imagery would feel intrusive.
- If you add imagery later (marketing site, splash screens), use **warm-toned**, slightly-faded, hand-drawn or watercolour illustrations. Avoid stock photos. Avoid people's faces (privacy implications for mental-health context). Plants, paper, soft objects, weather, abstract warm shapes.
- Never AI-generated emotion illustrations of crying/laughing characters — too literal.

### Iconography vibe
See the next section. Short version: the codebase ships emoji-as-icons and that is intentional and on-brand.

---

## Iconography

The codebase is **emoji-first** for product icons. This is a deliberate brand choice — emoji are warmer and more universally legible than line-icon systems, and they fit the "diary, not dashboard" vibe.

| Use | Icon | Source |
|---|---|---|
| Brand wordmark | 🧠 | `frontend/src/App.jsx` navbar |
| Diary companion | 🪶 (quill) | `CompanionCard.jsx`, `Chat.jsx` |
| Normal | 😊 | `mobile/constants/index.ts` |
| Depression | 💙 | same |
| **Suicidal** | 🆘 | same — *never* substitute, this is the only loud icon |
| Anxiety | 😰 | same |
| Stress | 😤 | same |
| Bipolar | 🔄 | same |
| Personality Disorder | 🌀 | same |
| Empty / draft | 📝 | `EntryCard.jsx` fallback |

### Rules for adding new icons
1. **First preference: extend the emoji set.** If a feature genuinely needs a new icon (e.g. "settings"), check whether a single, widely-supported, non-skin-toned emoji exists before reaching for a line set.
2. **Second preference: Lucide icons** (1.5px stroke, rounded line-caps). Lucide's stroke style matches the rounded/cozy direction better than Heroicons (which is sharper). Use via the CDN: `<script src="https://unpkg.com/lucide@latest"></script>` or import per-icon in React.
3. **Never hand-draw SVG icons.** If the line-icon you need isn't in Lucide, ask for a real asset before improvising.
4. **No icon fonts** (Font Awesome, Material Icons). They're noisy and inconsistent with the rest of the system.
5. **The 🪶 quill is sacred** — it is the visual signature of the diary companion and should appear wherever the companion speaks (cards, chat bubbles, loading states).
6. **Inline SVG check icons** are used in confirmation toasts (Home.jsx success message — `<svg>` checkmark with `fillRule="evenodd"`). These can stay as inline SVG.

### Substitution flag
- Lucide is not in the codebase yet. We've documented it as the recommended addition. The shipped product currently has zero line-icons — every icon is either an emoji or an inline-SVG one-off.

---

## Font caveat

The codebase declares `font-family: 'Inter', sans-serif` in `frontend/src/index.css`. This design system substitutes **Plus Jakarta Sans** instead because:
1. The internal style brief asked for "fluffy and cozy" — Inter's neo-grotesque geometry reads cooler/more clinical.
2. Plus Jakarta has more open counters and softer terminals, which pair better with the warm cream palette and the Lora serif used for the diary voice.

**If you'd prefer to keep Inter for parity with what's shipped:** swap the `@import` URL and `--font-sans` value in `colors_and_type.css`. Nothing else needs to change.

The codebase does not currently load a serif at all — the existing CompanionCard relies on the browser's `font-serif` fallback. We've added Lora explicitly so the diary voice has a consistent, intentional shape across web/mobile/marketing. **Ask the user if a different serif is preferred** — Lora is our pick, but Source Serif, Crimson, or EB Garamond would all work in this slot.

---

## Index — what's in this folder

```
.
├── README.md                       ← you are here
├── SKILL.md                        ← Claude / Agent skill descriptor
├── colors_and_type.css             ← all design tokens (CSS vars)
├── assets/                         ← logos, illustrations, raw icons
├── fonts/                          ← (Google Fonts is CDN-loaded; folder reserved for future TTFs)
├── preview/                        ← cards that populate the Design System tab
│   ├── colors-*.html                 (palette swatches, mood classes)
│   ├── type-*.html                   (display, body, eyebrow, diary voice)
│   ├── spacing-*.html                (radii, shadows, spacing)
│   ├── components-*.html             (buttons, inputs, chips, cards)
│   └── brand-*.html                  (logo, mood icons, companion mark)
└── ui_kits/
    └── web/                        ← React reconstruction of MindClassify Web
        ├── README.md
        ├── index.html              ← interactive prototype of all 3 routes
        ├── tokens.css
        ├── App.jsx
        ├── Navbar.jsx
        ├── JournalInput.jsx
        ├── ResultCard.jsx
        ├── CompanionCard.jsx
        ├── EntryCard.jsx
        ├── HistoryList.jsx
        ├── MoodChart.jsx
        └── Chat.jsx
```

---

## Working with this system

1. Open `ui_kits/web/index.html` to see a live, click-through version of the actual MindClassify app.
2. Open the **Design System tab** in this project for atomized swatches/specimens.
3. When building new surfaces, lift values from `colors_and_type.css` only — never invent new colour codes or radii. If you need a token that doesn't exist, add it to the CSS file first.
4. When writing copy, re-read the **Content fundamentals** section above before drafting. The voice is specific; protect it.

---

## Disclaimer (carry this forward in all outputs)

MindClassify is a research prototype. It is **not** a clinical diagnostic tool and must not be used as a substitute for professional mental health advice. If you or someone you know is in crisis, please contact a qualified mental health professional or call the **988 Suicide & Crisis Lifeline** (call or text 988).
