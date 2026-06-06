---
name: mindclassify-design
description: Use this skill to generate well-branded interfaces and assets for MindClassify, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.

## Layout of this skill

- `README.md` — start here. Brand context, content fundamentals, visual foundations, iconography.
- `colors_and_type.css` — every design token (colors, type scale, spacing, radii, shadows) as CSS variables. Link it into every artifact you build.
- `preview/` — atomized cards demonstrating each token / component. Useful as a visual quick-reference.
- `ui_kits/web/` — a clickable React reconstruction of the live MindClassify web app. The recipe for every component lives here.
- `assets/` — logos and shared imagery (reserved; CDN-loaded Google Fonts cover type for now).

## House rules — the absolute non-negotiables

1. **Never name a diagnosis** in product copy (companion replies, UI strings, marketing). The system prompt in `backend/src/controllers/companionController.js` forbids this.
2. **Suicidal-class outputs always end with the 988 lifeline disclosure.** "And if the weight ever becomes too heavy to carry alone, please reach out to the 988 Suicide & Crisis Lifeline — call or text 988." Carry this rule into anything you generate.
3. **The diary voice is italic serif (Lora), always.** The UI voice is sans (Plus Jakarta). Don't blur them.
4. **No emoji in product chrome.** Earlier versions of the codebase used emoji for the seven mood classes; we have replaced those with stroke SVG marks (see `preview/brand-mood-icons.html`). Use those marks or extend that family — don't reach back for emoji.
5. **No bluish-purple gradients, no glassmorphism, no left-border-accent cards, no clinical neutrals.** Warm cream + paper + warm-amber shadows.
6. **No filler content.** This is a journaling product. Empty states get tender copy, not stock illustrations or marketing fluff.

## Sources

Build context — the live codebase, if you have access:
- <https://github.com/sharemoonwithcoke/Mental-Health-Categorised-Diary>
- <https://github.com/sharemoonwithcoke/MindClassify>
