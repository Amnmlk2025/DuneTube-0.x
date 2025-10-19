# STEP 02 - Studio delta analysis

## Observed issues
- `frontend/src/layouts/StudioLayout.tsx:24` accesses `window` during render, breaking SSR/hydration; needs lazy media-query detection.
- `frontend/src/layouts/StudioLayout.tsx:48` hides the sidebar on desktop until the toggle runs; we should default the nav open for lg breakpoints and trap focus when modal-style on mobile.
- `frontend/src/pages/studio/StudioCourses.tsx:105` still shows mojibake characters from legacy exports (e.g. "Search???", menu arrows); clean up copy and use icon components.
- `frontend/src/pages/studio/CourseEditor.tsx:28` mutates local storage while rendering (`createDraftLike` call) and navigates synchronously, causing double renders; should move into `useEffect` with loading guard.
- `frontend/src/pages/studio/CourseEditor.tsx:74` updates storage on every `setField` keystroke; add debounced persistence and optimistic state to avoid lag.
- `_studioStore` (`frontend/src/pages/studio/_studioStore.ts:1`) remains a localStorage mock with TODO comments; document migration path to backend endpoints to avoid drift once DRF exists.
- All Studio subpages (e.g. `frontend/src/pages/studio/StudioLessons.tsx:4`) render placeholder copy without empty-state components or CTAs; plan to share EmptyState component in Step 04.

## Proposed Step 03 (fix batch) scope
- Harden layout: SSR guards for window usage, deterministic sidebar default, keyboard/ARIA polish.
- Sanitize strings and replace mojibake placeholders with accessible English copy and icons.
- Refactor course editor init flow (handle `id === "0"` creation with effect + spinner) and avoid eager persistence during render.
- Add basic null checks around `getCourse` consumption with toast + redirect when missing.

## Proposed Step 04 (enhancement batch) scope
- Introduce reusable `StudioEmptyState` and badge components (proposal-only) for placeholder tabs.
- Suggest lightweight skeleton loaders for course grid and editor panels.
- Outline API adapter layer to replace `_studioStore` once backend lands, keeping proposals isolated until backend ready.

## Open questions
- Confirm whether Teacher Studio should persist drafts locally when offline once backend is live.
- Need product decision on default tab order and duplication workflow (should duplication prompt rename?).
