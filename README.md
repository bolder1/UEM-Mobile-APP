# UEM Companion — Mobile App

The device-side agent app for miniOrange UEM: the thing that lives on an enrolled
employee's phone, not the admin dashboard. Built from the Claude Design prototype
(`UEM Companion.dc.html`) as **Companion mode** — the self-service home for
BYOD/COPE knowledge workers. Frontline/kiosk mode is a later phase.

## Stack

- **Expo (React Native) + TypeScript** — one codebase, iOS + Android + tablet, instant
  preview via Expo Go while native modules (VPN tunnel, MDM enrollment, Accessibility)
  are still stubbed.
- **React Navigation** — native-stack for the onboarding→enroll→pending→permissions
  flow and full-screen overlays (VPN, Cast, Certs, Privacy, Chat thread); bottom-tabs
  for the main app (Home, Chat, Files, Apps, More).
- **Zustand** — single app store for enrollment state, permissions, VPN/cert/app-install
  simulations, chat, files, cast.
- **lucide-react-native** — the icon family used throughout the prototype.
- **@expo-google-fonts** (Sora for display, Inter for body) — matches the design's type system.

## Running it

```bash
npm install
npm start
```

Then either:
- Scan the QR code with **Expo Go** (iOS/Android) to run on your own phone or tablet, or
- Press `a` / `i` in the terminal for an Android/iOS emulator, or
- Press `w` for a browser smoke-test (not the target platform, but useful for quick iteration).

## What's real vs. stubbed

Everything you can tap is functionally wired — VPN connect/disconnect with live
throughput stats, app install progress, certificate install, chat with simulated
replies, screen cast connect/live, sync, light/dark/system theme, self-unenroll with
type-to-confirm. What's **simulated** rather than real, because it requires native/
privileged plumbing not in scope for this pass:

- The WireGuard tunnel itself (`src/state/store.ts` → `toggleVpn`) — swap in a native
  VPN module behind the same store action.
- MDM enrollment / work-profile creation (`submitForm`, the permissions screen) — wire
  to Android Device Owner / iOS MDM profile install behind the same actions.
- Screen cast / remote assist — wire to the AccessibilityService-backed native module.

The store's action layer is the seam: screens only ever call store actions, so native
modules can replace the `setTimeout`/`setInterval` simulations without touching any UI code.

## Project layout

```
src/
  theme/        design tokens (colors, type) ported 1:1 from the .dc.html CSS variables
  state/        zustand store — all app state and simulated device-agent actions
  navigation/   root stack + bottom tabs + custom tab bar
  components/   shared UI kit (Button, Card, BottomSheet, animations, ...)
  screens/
    onboarding/ onboarding carousel → enrollment form → approval pending → permissions
    app/        Home, Chat (list/thread), Files, Apps, More
    overlays/   VPN, Screen cast, Certificates, Privacy
  data/         mock catalog/chat/file/cert data
```

## Not yet built

Frontline/kiosk mode (full-screen launcher, approved-app grid, hidden exit), SSO
catalog depth, and the native modules listed above.
