# DESIGN — UEM Companion

The interaction + voice system every screen must obey. Anchored on [PRODUCT.md](PRODUCT.md).

## Voice & tone — kill the "AI buzz"

The app should read like it was written by a security engineer who respects your time, not a marketing team. The single biggest quality lever in this pass.

**Banned (this is the "AI buzz"):**
- Adjective-forward brochure lines: "Your secure workspace key", "One calm app for everything…", "Powerful, seamless, effortless".
- Exclamation marks. "Awesome!", "You're all set!", "Oops!".
- Reassurance theatre — floating badges like "Policy compliant ✓" / "Work data sealed" that decorate rather than inform.
- Feature-naming as poetry. Say what it is: "Secure tunnel", not "Your gateway to productivity".
- Empty states that sell: "Get started by installing your first app!"

**Write like this instead:**
- **Say the thing.** "2 certificates need installing." "Tunnel off — tap to connect." "No files match 'budget'."
- **Lead with the user's stake.** Not "Location permission" → "Location — used only for office check-in. Off by default."
- **Numbers over adjectives.** "4 of 4 policy checks passed", not "Fully protected".
- **Plain verbs on buttons.** Install · Update · Connect · Install cert · Remove · Contact IT.

**Before → After (use as the rewrite yardstick):**
| Before (buzz) | After (product) |
|---|---|
| "Your secure workspace key" | "Your work, sealed off from personal." |
| "One calm app for everything work on this device — enrolled, compliant and under your control." | "Enroll once. Then connect, install what IT requires, and see exactly what your company can and can't see." |
| "Secure Access — Off" | "Secure tunnel · Off" |
| "Device meets company policy · 4 of 4 checks" | keep — it's already numeric and honest |

## Copy laws for state-changing actions

- **Success = audit line.** Every install/connect/sync success shows `Logged · {relative time} · {actor}` and taps through to Activity. Actor is "you" or "IT (Ravi Kumar)".
- **Non-revealing errors.** Auth/permission failures never say which factor failed. Fallback: *"This couldn't be completed. Check with your IT admin."*
- **Partial success shows as partial.** Never round 3-of-5 up to done.

## Interaction system

- **Search** is a real `TextInput` (`SearchField`) wherever a list can exceed ~8 rows: Apps, Files, Chat, Certificates, Notifications, Activity. Never a decorative box. Debounce-free, case-insensitive, matches name + secondary text. Clear button when non-empty.
- **Filter** = a horizontal `FilterChips` row directly under search. Single-select, includes an "All". Chips carry counts where cheap ("Updates · 1").
- **Sort** where order is meaningful (Files, Apps): a small control in the list header (Name / Recent / Size).
- **Every list designs six states:** loading (row skeletons, never a centered spinner) · loaded · empty-first-time · empty-filtered ("No X match '{query}'" + Clear) · partial · error.
- **Actions are optimistic + reversible where safe**, and always resolve visibly (progress → done → audit line → toast). No silent taps.

## States — required per surface

Empty (first-time) · Empty (filtered) · Loading (skeleton) · Loaded · In-progress/partial · Error · Permission-denied (if role-scoped).

## Visual system (already built — do not fight it)

- **Tokens:** `src/theme/colors.ts`. Two brands (Classic Orange default, DLP Blue) × light/dark via `getColorScheme`. Never hardcode a hex; always `colors.*`.
- **Type:** `AppText` variants in `components/Text.tsx`. **Surfaces:** `Card`. **Rows:** `ListRow`. **Chips:** `Chip`. **Status:** `StatusDot` — every status is dot **+** label, never color alone.
- **Icons:** lucide-react-native only. One family. `strokeWidth` 2–2.4.
- **Touch targets ≥ 44×44.** Comfortable density (this is a phone in a hand, not a dense console).
- **Monogram** (`assets/Monogram.svg` → `logo-mark.png`) is the one brand mark: app icon, splash, favicon, onboarding, in-app header.

## Anti-patterns — zero tolerance (from the family playbook)

Cream backgrounds · generic 3-card hero · side-stripe card borders · status by color alone · red destructive buttons by default · marketing empty states · "Awesome!"/"Oops!"/exclamations · tooltips explaining a search icon · mixed icon families · modals for multi-step work.

## New shared primitives (this pass)

`SearchField` · `FilterChips` · `EmptyState` · `Skeleton` · `Toast` (global action feedback) · `AuditLine` (`Logged · time · who`). Built in `src/components/`, themed, used everywhere so the app feels like one system.
