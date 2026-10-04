# Demo Video — Recording Guide (4:00–5:00, hard cap 6:00)

Judges' required coverage (this plan hits all five): **1 Project name /
problem statement · 2 Problem–solution · 3 Technology stack · 4 High-level
diagram · 5 Live demo.** Language: English or Urdu — full read-aloud
scripts are in [`TRANSCRIPT-EN.md`](TRANSCRIPT-EN.md) and
[`TRANSCRIPT-UR.md`](TRANSCRIPT-UR.md); the deck is
[`cognitive-fitness-slides.pptx`](cognitive-fitness-slides.pptx)
(13 slides, speaker notes pre-written, diagram on slide 8).

## Before you record

1. **Pick the build to record.** Best: the **production URL after PR #3 is
   merged** (`https://cognitive-fitness-blond.vercel.app`). Alternative:
   the Vercel **preview for PR #3** (open the PR → "Vercel" check → Details
   → visit deployment). Fallback that always works: local —
   `cd cognitive-fitness && npm ci && npm run build && npm start`
   (or `npm run dev`) and record `http://localhost:3000`.
2. **Pre-flight the demo once, fully**, in the order of the scene list.
   If a step stutters, cut it rather than re-take everything.
3. **Clean the stage:** browser zoom 100%, only one tab open plus the
   preferences panel closed; hide bookmarks bar (F11/Cmd+Ctrl+F helps);
   dark system notifications off (DND / focus mode); mic near, quiet room.
4. **Recording setup:** 1920×1080, 30 fps, screen-only capture at first.
   OBS (free) or Loom/QuickTime/Zoom local record. Record **system audio
   off, mic on**; narration can be overlaid later — that is the resilient
   order: (a) record the click-through silently, (b) record voice separately
   reading the transcript in one take per scene, (c) align in any editor
   (Clipchamp/iMovie/CapCut are all fine).
5. **Puter AI step is optional on camera.** It needs a real Puter sign-in
   popup. If you have a Puter account, demo one chat turn; if not, open the
   coach, show the three modes and the consent UI, and say the flow is
   live-testable — never stage a failure on camera.

## Scene list & timing (target 4:50)

| # | Time | On screen (actions) | Narration covers |
|---|------|---------------------|------------------|
| 1 | 0:00–0:25 | Title card (slide 1), then home page hero | Project name + one-line problem |
| 2 | 0:25–1:05 | Slow scroll of `/evidence` or a concept page's Boundary block | Why the problem is real (overclaiming, fragmentation, overload) |
| 3 | 1:05–1:45 | Home → one journey card → `/journeys` index | Solution pillars + the every-page contract |
| 4 | 1:45–2:20 | Slide 7 (stack table) | Next.js 16, React 19, TS, Vitest, Vercel, Puter.js |
| 5 | 2:20–2:50 | Slide 8 diagram (point at arrows) | Browser ⇄ CDN, localStorage, opt-in AI path, CI gate |
| 6 | 2:50–3:15 | **Demo:** `/journeys` → open *Start here* → walk one step → take-away | Guided path, no account |
| 7 | 3:15–3:35 | **Demo:** `/search` → type `spac` (typo) → open a result | Graceful search, zero requests |
| 8 | 3:35–3:55 | **Demo:** preferences panel → toggle serif + reading guide → show instant change | 7 reading settings, pre-paint, device-local |
| 9 | 3:55–4:10 | **Demo:** `/progress` | Opt-in local insight, no pooled score |
| 10 | 4:10–4:35 | **Demo:** `/coach` → mode chooser; (optional) Puter one-turn chat | User-pays AI, consent per message, kill switch |
| 11 | 4:35–4:50 | `/privacy` scroll, then closing card (slide 13) | Privacy posture + thanks |

Keep talking over cuts — the judges' cap is 6:00; land at 4:30–5:00.
If you are running long, merge scenes 9 into 10 in one breath.

## Demo click-paths (rehearse these exactly)

- Journey step: `/journeys` → **Start here** → click step 2 link → back
  button → point at the *caution* line on the step.
- Search: click the header **Search** → type `spac` → result *Spacing effect*
  appears (typo tolerance) → open it → show the "Where this leads" panel.
- Preferences: header **Reading settings** (or gear) → toggle *Serif* →
  toggle *Reading guide* (shows a moving ruler) → Escape closes, focus
  returns.
- Coach: `/coach` → note default *"This device only (no AI)"* → open mode
  chooser → show *Puter user-pays* row + consent checkbox (do not enable
  unless demoing the sign-in).

## Hard rules from the brief

- 4–5 minutes (max 6). Cover the five key points — the table above maps
  them 1:1.
- Clear, professional, engaging, visual: use the deck's diagram slides for
  cuts, zoom the editor to 125–150% on click moments, captions on
  (burned-in or auto) — judges watch muted more often than you think.
- No background music under narration. No unlisted "AI unlimited/free"
  claims: say **"each visitor uses their own Puter allowance — free monthly,
  then they pay; we hold no keys."**

## Export & submit

- 1080p MP4, H.264 + AAC, ≤ 25 fps interleave fine; keep under ~150 MB
  (target 60–120 MB for 5 min at reasonable bitrate: CRF 20–23 in HandBrake
  or OBS "High quality").
- Name: `CognitiveFitness-Demo.mp4`. Watch it once end-to-end on a phone
  before submitting (that is how many judges will).
- Keep raw scene clips + slide deck in the submission repo zip in case the
  platform re-encodes badly.

## Fallbacks

- Site down mid-take → switch to local `npm start` build (identical pages).
- Mic noise → re-record only that scene's audio; video untouched.
- Puter popup blocked → show the mode chooser + consent UI, mention the
  popup requires a real user click (that is the product behaving correctly).
- Running over 6:00 → cut scene 2 to 15 s (the point is made visually).
