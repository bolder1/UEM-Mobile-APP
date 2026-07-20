# PRODUCT — UEM Companion

**Register.** Enterprise security / endpoint management (UEM). Device-side companion, not the admin console.
**Platform.** Mobile only (iOS + Android via Expo). Every decision is a phone decision.

## The one-line truth

> UEM Companion is the **honest broker** between an employee and their IT department.

An employee puts *work* on their *personal* phone. That is a leap of faith — the fear is "my company is watching me," and the friction is "IT makes everything a helpdesk ticket." The app's entire job is to make that leap feel safe by doing two things relentlessly:

1. **Show, don't claim.** At every turn, surface *exactly what the company can and can't see*. Transparency is the product, not a settings page.
2. **Let people self-serve.** Everything work-related on the device — access, apps, certificates, help — handled in one calm place, without calling IT.

It never *sells* security. It *shows* you that you're in control.

## Primary user — "Priya"

- **Who.** Priya Sharma, an engineer at Xecurify. Non-technical about MDM; technical about her own privacy. BYOD — it's *her* phone.
- **Frequency.** Opens the app in bursts: during enrollment (once, anxious), then ~2–3×/week for a specific job (install a required app, fix the tunnel, grab a policy PDF, answer IT).
- **State of mind.** Mildly suspicious, time-poor, wants in-and-out. Not exploring — *accomplishing*. Every screen must respect that she came to do one thing.

## What success looks like

- She can answer "what can my employer see right now?" in **one tap, from anywhere**.
- She completes the top jobs (connect tunnel, install app/cert, find a file, reach IT) **without a helpdesk ticket**.
- Nothing on screen reads like marketing. If a sentence could appear in a brochure, it's wrong.

## Product principles

1. **Transparency is a first-class surface**, not a line in About. "Can see / Can never see" is reachable from the home and every privacy-adjacent action.
2. **Every state-changing action is audit-visible.** Success states say *"Logged · {time} · {who}"* and link to Activity. Security software that changes state silently is broken.
3. **Provenance on every credential.** Certificates and keys always show *source + issued/expires*. A key without provenance is a UX failure.
4. **Self-serve over ticket.** Design the "do it yourself" path first; "contact IT" is the fallback, never the default.
5. **Read paths are read-only.** Viewing a device/cert/file never offers a destructive action inline. Removal is a deliberate, confirmed transition.
6. **Calm under stress.** Enrollment, a dropped tunnel, a pending cert — these are the anxious moments. Slow down, explain, never alarm.

## Stake tiers (this app)

| Action | Tier | Friction |
|---|---|---|
| View anything, mark notification read, search/filter | Low | none |
| Install app / cert, connect tunnel, sync, ack broadcast | Low–Medium | inline, optimistic, audit line on success |
| Accept an IT remote-assist screen share | **High** | explicit consent sheet — it's someone seeing your screen |
| Remove device from management (unenroll) | **Critical** | type-to-confirm + spell out consequences |

## Anti-goals

- Not an app store. No ratings, no "editor's picks," no discovery. It's a *company catalog IT curates*.
- Not a marketing site. No hero taglines, no exclamation marks, no "seamless/effortless/powerful."
- Not a fleet console. This is one person's one device, not 10,000 endpoints.
