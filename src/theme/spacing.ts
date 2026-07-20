// Spacing — one 4px grid, and the relationships that pick values off it.
//
// Two rules, in order:
//
//   1. Every gap is `space[n]`, where n is a count of 4px steps. Screens never
//      write a raw number.
//   2. WHICH n you use is decided by the relationship between the two things,
//      not by eye. Proximity is the only cue a phone has for "these belong
//      together", so the gap grows as the relationship weakens — and it grows
//      monotonically, or the grouping reads backwards:
//
//        title -> its own caption            4    same object, one voice
//        icon -> its label                   12   one row, two parts
//        label -> the block it labels        8    a label is part of its block
//        row -> row in a group               0    hairline separates them
//        card -> card in a group             12   siblings
//        block -> block within a section     16   related, distinct
//        section -> unrelated section        24   a real break
//
// If a gap "needs" a value that isn't on the grid, the layout is wrong — not
// the grid. Before this file the app had 36 distinct spacing values, 56% of
// them off any grid (including 1.6, 2.5, 3.5, 4.5 and 10.5), which is why the
// same relationship rendered at 12, 13, 14, 15 or 16 depending on the file.

const UNIT = 4;

export const space = {
  0: 0,
  1: UNIT, //  4
  2: UNIT * 2, //  8
  3: UNIT * 3, // 12
  4: UNIT * 4, // 16
  5: UNIT * 5, // 20
  6: UNIT * 6, // 24
  7: UNIT * 7, // 28
  8: UNIT * 8, // 32
  10: UNIT * 10, // 40
  12: UNIT * 12, // 48
  14: UNIT * 14, // 56
  16: UNIT * 16, // 64
} as const;

export const layout = {
  // One gutter for the whole app. Was 16 (ChatThread), 20 (most), 22/24/26
  // (Cast, internally inconsistent), 24 (onboarding), 32 (Unenrolled).
  gutter: space[5], // 20

  // Vertical page rhythm. Both are ON TOP of the safe-area inset — never
  // instead of it. `screenBottom` is the resting gap above the home indicator.
  screenTop: space[3], // 12
  screenBottom: space[6], // 24

  // Relationship ladder — see the table above.
  captionGap: space[1], // 4
  labelGap: space[2], // 8
  cardGap: space[3], // 12
  blockGap: space[4], // 16
  sectionGap: space[6], // 24

  // Containers.
  cardPad: space[4], // 16
  sheetPad: space[5], // 20

  // List rows. One row geometry app-wide (was 15 hand-rolled variants across
  // 6 vertical and 5 horizontal paddings).
  rowPadV: space[3], // 12
  rowPadH: space[4], // 16
  rowGap: space[3], // 12

  // Forms.
  fieldGap: space[4], // 16
} as const;

// Touch — WCAG 2.5.5 AA and the iOS HIG both floor at 44.
// 44 and 36 are both on the grid (11 and 9 steps).
export const touch = {
  min: 44,
  // A control may LOOK smaller than 44, but it must never FEEL smaller.
  // Pair a sub-44 box with the matching slop: box + 2*slop >= 44.
  slopFor: (renderedSize: number) => Math.max(0, Math.ceil((touch.min - renderedSize) / 2)),
} as const;

// Fixed control geometry. `sm` is deliberately 36 for visual density and is
// always paired with hitSlop 4 (36 + 2*4 = 44) so the target still clears.
export const control = {
  height: { sm: 36, md: 44, lg: 52 },
  tile: 40, // IconTile / row leading icon. Was 42 — off grid, in 11 copies.
  avatar: 44,
  icon: { sm: 14, md: 16, lg: 20 },
} as const;
