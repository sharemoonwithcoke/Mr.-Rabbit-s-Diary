# MindClassify — Web UI kit

A clickable reconstruction of the three core routes of the live web app
(`frontend/` in `sharemoonwithcoke/Mental-Health-Categorised-Diary`).

## Run

Open `index.html` — no build step. React 18 + Babel are loaded via CDN.

## What's recreated

| File | Source it mirrors |
|---|---|
| `App.jsx` | `frontend/src/App.jsx` (router replaced by a simple `useState` route) |
| `Navbar.jsx` | the navbar inside `App.jsx` |
| `JournalInput.jsx` | `frontend/src/components/JournalInput.jsx` |
| `ResultCard.jsx` | `frontend/src/components/ResultCard.jsx` (Recharts radial gauge swapped for a numeric one — saves the dependency) |
| `CompanionCard.jsx` | `frontend/src/components/CompanionCard.jsx` |
| `EntryCard.jsx` | `frontend/src/components/EntryCard.jsx` |
| `MoodChart.jsx` | `frontend/src/components/MoodChart.jsx` (Recharts stacked area swapped for a hand-rolled CSS stacked-bar) |
| `Chat.jsx` | `frontend/src/pages/Chat.jsx` |
| `data.js` | `mobile/constants/index.ts` + `backend/src/controllers/companionController.js` (system-prompt-style fallback replies) |

## What's faked

- The **NLP model** is a keyword heuristic (`window.fakeClassify` in `data.js`) — the same shape the live model service uses in demo mode.
- The **Claude companion** is a per-label fallback string (`window.FALLBACK_REPLIES`). Each reply follows the system prompt's structure: acknowledge → reflect → window-of-hope, with the 988 lifeline always appearing in the Suicidal reply.
- **Persistence** lives in React state. Entries do not survive a refresh; the seed list in `data.js` is what you'll see on first load.

## What's been intentionally cut

- No router (`react-router-dom`) — simple route switching keeps the bundle CDN-only.
- No `Recharts` — the radial gauge is a number, the area chart is a hand-rolled stacked-bar. Visually adequate, far less code.
- No backend / no Anthropic / no MongoDB.
- Mobile twin not built here; this kit covers web only. See the original `mobile/` folder for parity reference.

## How to extend

1. Reach for the design tokens in `../../colors_and_type.css` and the component CSS in `tokens.css` before reaching for inline styles.
2. The seven-class taxonomy lives in `data.js → CLASS_CONFIG`. To add a class, add it there + add tokens to `colors_and_type.css`.
3. Companion replies follow a strict structure (see `backend/src/controllers/companionController.js` in the source repo). If you generate new ones, never name a diagnosis and never break the 988 rule for Suicidal entries.
