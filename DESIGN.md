---
name: Next.js Template
description: A self-hosted, agent-friendly Next.js full-stack management template
colors:
  primary: "#e5e7eb"
  primary-hover: "#f9fafb"
  neutral-surface: "#0b0f15"
  neutral-surface-soft: "#111827"
  neutral-border: "#374151"
  neutral-subtle: "#9ca3af"
  neutral-text: "#e5e7eb"
  neutral-text-soft: "#9ca3af"
  neutral-black: "#020617"
  neutral-white: "#f9fafb"
  success-bg: "#052e16"
  success-border: "#166534"
  success-text: "#86efac"
  warning-bg: "#422006"
  warning-text: "#fcd34d"
  warning-border: "#d97706"
  error-bg: "#450a0a"
  error-text: "#fca5a5"
  error-border: "#991b1b"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
  xxl: "1.5rem"
  x3: "1.75rem"
  x4: "2rem"
  x6: "1.5rem"
  x8: "2rem"
  x12: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-black}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.neutral-surface-soft}"
    textColor: "{colors.neutral-black}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  button-primary-disabled:
    backgroundColor: "{colors.neutral-surface-soft}"
    textColor: "{colors.neutral-subtle}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  input:
    backgroundColor: "{colors.neutral-surface-soft}"
    textColor: "{colors.neutral-text}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  select:
    backgroundColor: "{colors.neutral-surface-soft}"
    textColor: "{colors.neutral-text}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  textarea:
    backgroundColor: "{colors.neutral-surface-soft}"
    textColor: "{colors.neutral-text}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  card:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "1rem"
---

# Design System: Next.js Template

## 1. Overview

This system is a dark-mode management foundation with a black, white, and gray palette. It stays focused on readability, workflow speed, and low visual friction.

Its north star is **The Quiet Control Console** in monochrome. The interface should feel precise and calm: fast to scan, quick to act, and comfortable for prolonged back-office operations.

This system explicitly rejects high-chroma branding, glossy gradients, and colorful decorative depth. It avoids marketing-style hero treatment and keeps the UI anchored on contrast, spacing, and control hierarchy.

## 2. Colors

The palette is monochrome-first and dark: near-black surfaces, warm whites for text, and gray as the operational accent band.

### Primary
- **Primary Gray** (#e5e7eb): links, actions, and text-on-dark affordances.
- **Primary Gray Hover** (#f9fafb): hover emphasis for primary controls and links.

### Neutral
- **Void** (#020617): the deepest background layer.
- **Canvas** (#0b0f15): main panel and page background.
- **Surface** (#111827): elevated surfaces and cards.
- **Border** (#374151): separators and input outlines.
- **Ink** (#e5e7eb): primary readable text.
- **Ink Soft** (#9ca3af): supporting labels and metadata.

### Feedback
- **Success** (#86efac): positive states, with dark green surfaces (`#052e16`) and border (`#166534`).
- **Warning** (#fcd34d): caution states on amber-brown support background (`#422006`) and border (`#d97706`).
- **Error** (#fca5a5): validation states on dark red surface (`#450a0a`) and border (`#991b1b`).

### Named Rules

**The One Contrast Rule.** Keep the palette to black, white, and gray for core UI surfaces; use color only for status meaning.

## 3. Typography

**Body Font:** system-ui stack (same as layout default) with system fallbacks.
**Display/Headline Font:** same family, with weight and size scaling for hierarchy.

Hierarchy is compact and readable, with a 65–75 character line strategy for dense admin text.

### Display
- **Bold** (700), 2rem, 1.2: used for top-level landing and route headings.

### Headline
- **Bold** (700), 1.75rem, 1.2: use for primary page titles.

### Title
- **Bold** (700), 1.125rem, 1.4: section headings.

### Body
- **Regular** (400), 1rem, 1.5: forms, tables, metadata, copy.

### Label
- **Medium** (500), 0.875rem, 1.4: field labels and compact control captions.

### Named Rules

**The Density Rule.** Prefer strong contrast and compact spacing over decorative font expression.

## 4. Elevation

Depth is conveyed through border contrast and background hierarchy, with no heavy shadow dependency.

### Shadow Vocabulary
- **No baseline shadows in default UI.** Use tonal and border separation as the primary depth language.

### Named Rules

**The Flat-By-Default Rule.** Keep all core views flat and neutral, only adding emphasis through color state and motion.

## 5. Components

### Buttons
- **Shape:** rounded-md (`6px`) in current usage.
- **Primary:** dark surface fill (`#111827`) with light gray label.
- **Primary Hover / Active:** lighter surface (`#0b0f15`) with high-contrast text for active cues.
- **Secondary / Ghost:** border-free link style with gray text for non-primary actions.
- **Focus:** border/outline state uses high-contrast gray edges.

### Forms
- **Style:** full-width controls with `rounded-md`, `1px` neutral border, and `0.75rem` horizontal, `0.5rem` vertical padding.
- **Focus:** border and glow are subtle, with clear visual state and no blur-heavy effects.
- **Input types:** input, select, and textarea share one baseline style to keep data entry predictable.
- **Error / disabled:** muted red surfaces and red status text.

### Inputs
- **Validation tone:** red error surfaces for validation and helper messaging.
- **Behavior:** clear placeholder and label hierarchy, consistent left-aligned control alignment.

### Navigation
- **Style:** top app bar with border-bottom and subdued link tones on dark background.
- **States:** hover transitions to lighter gray and stronger contrast.

### Cards / Containers
- **Shape:** rounded-lg for section containers and list rows.
- **Backgrounds:** dark surface tokens with gentle tonal bands.
- **Padding:** `1rem` as default panel rhythm, with `1.5rem` outer page spacing where needed.
- **Border:** explicit border lines for separation.

### Feedback Blocks
- **Toasts / Banners / Alerts:** status surfaces use semantic colors while preserving monochrome dominance.

### Empty & Loading
- **Empty:** dashed, low-contrast container on dark surface.
- **Loading:** subtle neutral text status.

## 6. Do's and Don'ts

### Do
- **Do** keep core surfaces monochrome: black, white, and gray families.
- **Do** keep contrast high and avoid low-luminance-on-low-luminance text combinations.
- **Do** keep control shapes and spacing consistent across views.
- **Do** use status colors only for functional meaning and keep them minimal.

### Don't
- **Don't** introduce saturated accent colors as default UI tones.
- **Don't** use card-heavy decoration or excessive border layering.
- **Don't** add gradient text or glassmorphism as a baseline style.
- **Don't** use heavy shadow layers to create hierarchy.
- **Don't** rely on side-strip border accents as primary hierarchy markers.
