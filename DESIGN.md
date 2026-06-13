---
name: AMG Academy
description: Clinical premium dental education and event product for AMG Medical Group.
colors:
  clinical-bg: "#050505"
  aqua-wash: "#0B0B0B"
  white-surface: "#111111"
  surface-raised: "#1B1B1B"
  surface-muted: "#242424"
  teal-primary: "#D4AF37"
  teal-primary-hover: "#F1CF67"
  gold-accent: "#C58A18"
  purple-accent: "#0B3A53"
  ink-primary: "#FFFFFF"
  ink-secondary: "#D1D5DB"
  ink-muted: "#8F949D"
  border-default: "#2B2B2B"
  border-strong: "#3B3B3B"
  success: "#169B62"
  warning: "#C58A18"
  error: "#E24B5F"
  info: "#2676C9"
typography:
  display:
    fontFamily: "Montserrat"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: "38px"
    letterSpacing: "0"
  headline:
    fontFamily: "Montserrat"
    fontSize: "23px"
    fontWeight: 700
    lineHeight: "32px"
    letterSpacing: "0"
  title:
    fontFamily: "Montserrat"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: "28px"
    letterSpacing: "0"
  body:
    fontFamily: "Montserrat"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0"
  label:
    fontFamily: "Montserrat"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
    letterSpacing: "0"
  caption:
    fontFamily: "Montserrat"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0"
rounded:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "24px"
  pill: "999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  xxl: "32px"
  xxxl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.teal-primary}"
    textColor: "{colors.white-surface}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.white-surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
    height: "52px"
  button-ghost:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.teal-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
    height: "52px"
  input-default:
    backgroundColor: "{colors.white-surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
    height: "54px"
  card-surface:
    backgroundColor: "{colors.white-surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "20px"
  badge-status:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

# Design System: AMG Academy

## 1. Overview

**Creative North Star: "The Clinical Event Passport"**

AMG Academy should feel like the trusted digital passport for a dentist's professional learning life: polished enough for a medical devices company, clear enough for event-day pressure, and energetic enough to support workshops, congresses, courses, tickets, and certificates. The system is product-first. It uses familiar mobile patterns, restrained color, legible hierarchy, and consistent components so users can register, enroll, pay, scan, learn, and recover from errors without decoding the interface.

The visual language is premium black clinical by default: black app background, graphite working surfaces, white text, AMG gold action color, and a restrained deep-blue secondary accent only where it carries meaning. The product explicitly rejects generic SaaS dashboards, decorative glassmorphism, over-rounded controls, vague form errors, childish learning-app styling, and flashy visuals that weaken medical trust.

**Key Characteristics:**
- Premium black surfaces with gold action color and AMG brand restraint.
- One-font product typography using Montserrat across headings, labels, inputs, and buttons.
- Pill actions and badges paired with moderately rounded cards and inputs.
- Status-first language for payment, tickets, certificates, scanning, and access.
- Mobile-first spacing with safe keyboard behavior and clear required-field marks.

## 2. Colors

The palette is clinical, dark, and restrained: a black environment, graphite task surfaces, white text, and AMG gold as the scarce primary action signal.

### Primary
- **AMG Gold**: Used for primary actions, current selection, scanner confidence, active states, and focus cues. It should remain rare enough that tapping it feels obvious.
- **AMG Gold Hover**: Used only for pressed or hover-like feedback where the platform supports it.

### Secondary
- **Clinical Gold**: Used for premium AMG emphasis, waiting states, payment caution, or limited brand moments. It must not become a general decoration color.
- **Instructional Purple**: Reserved for secondary learning/community accents when a third semantic color is needed.

### Neutral
- **Clinical Background**: The main app background. It keeps the product premium and focused.
- **Graphite Wash**: Header bands, contextual regions, and subtle screen depth.
- **Graphite Surface**: Cards, forms, list rows, modals, and any task surface that needs clarity.
- **Ink Primary**: Main white text, form labels, headings, and critical values.
- **Ink Secondary**: Supporting text and secondary metadata.
- **Ink Muted**: Captions, helper text, placeholders, and low-emphasis metadata. Verify contrast before using it on tinted backgrounds.
- **Default Border**: Form fields, cards, dividers, and quiet structure.

### Named Rules

**The Gold Means Action Rule.** AMG Gold is for action, selection, focus, and confirmed status. Do not spend it on decoration.

**The Premium Black Rule.** Black is the main environment, but form surfaces must stay readable with graphite contrast, clear borders, and white text.

**The Medical Contrast Rule.** Body text and placeholders must remain comfortably readable. If a muted label feels elegant but soft, darken it.

## 3. Typography

**Display Font:** Montserrat  
**Body Font:** Montserrat  
**Label/Mono Font:** Montserrat

**Character:** One precise sans family carries the full product. Montserrat gives AMG Academy a polished medical-training voice without decorative pairing or display drama.

### Hierarchy
- **Display** (700, 30px, 38px): Screen titles, auth headings, and major dashboard headers. Use sparingly.
- **Headline** (700, 23px, 32px): Section headers, modal titles, and important card titles.
- **Title** (700, 19px, 28px): Compact panel headings, row titles, and component-level emphasis.
- **Body** (400, 16px, 24px): Descriptions, instructions, empty states, and readable screen copy. Keep prose around 65-75 characters per line when the viewport allows.
- **Label** (600, 14px, 20px): Form labels, button chrome, metadata labels, and concise row labels.
- **Caption** (500, 12px, 16px): Helper text, timestamps, secondary metadata, and compact status support.

### Named Rules

**The One Family Rule.** Do not add display fonts, script fonts, or decorative type. The product earns trust by making Montserrat work well.

**The No Fluid Type Rule.** Product UI uses fixed mobile type sizes from the token scale. Do not use viewport-scaled headings inside app screens.

## 4. Elevation

Depth is a hybrid of tonal layering and soft native shadow. White cards sit on clinical backgrounds with a fine border and restrained shadow. Elevation should clarify grouping, not create decorative floating glass.

### Shadow Vocabulary
- **Card Shadow** (`shadowColor: #1D3950; shadowOffset: 0 12; shadowOpacity: 0.09; shadowRadius: 22; elevation: 4`): Standard card and form container elevation.
- **Soft Shadow** (`shadowColor: #1D3950; shadowOffset: 0 6; shadowOpacity: 0.08; shadowRadius: 16; elevation: 3`): Lightweight rows or subtle active surfaces.
- **Gold Glow** (`shadowColor: gold-primary; shadowOffset: 0 10; shadowOpacity: 0.18; shadowRadius: 28; elevation: 7`): Primary buttons only. Use sparingly.

### Named Rules

**The Border Or Shadow Discipline.** Cards may use a fine border plus a very restrained shadow because mobile depth needs touch affordance. Do not intensify both.

**The No Decorative Glass Rule.** Do not use blur or glassmorphism as a default surface treatment.

## 5. Components

### Buttons

Buttons are pill-shaped, direct, and task-oriented.

- **Shape:** Full pill radius (`999px`) with a minimum height of `52px` for primary mobile actions.
- **Primary:** AMG Gold background, black text, bold Montserrat, `20px` horizontal padding, and the gold glow shadow.
- **Hover / Focus:** Pressed states reduce opacity slightly and scale to `0.99`; focus should use gold focus color and remain accessible.
- **Secondary:** Graphite surface, strong border, white text. Use for back, alternate, or lower-risk actions.
- **Ghost:** Raised graphite surface, default border, gold text. Use for low-emphasis navigation and secondary links.
- **Danger:** Soft red tint with red border and text. Use for destructive account/session actions only.

### Chips

Chips are compact status or metadata capsules.

- **Style:** Pill radius, `30px` minimum height, bold `12px` label, and a semantic foreground/background pair.
- **State:** Status chips must use domain-specific labels from backend state maps. Do not invent eligibility or payment language on the client.

### Cards / Containers

Cards should feel like clean medical product panels, not decorative tiles.

- **Corner Style:** Moderately rounded (`18px`) for cards and form panels.
- **Background:** White surface in light mode; slate elevated surface in dark mode.
- **Shadow Strategy:** Use the card shadow for major panels and soft shadow for smaller grouped surfaces.
- **Border:** Default border is required for structure, especially on graphite surfaces.
- **Internal Padding:** Standard card padding is `20px`; dense rows may use `12px-16px`.

### Inputs / Fields

Inputs are large, readable, and built for mobile keyboards.

- **Style:** `54px` minimum height, `18px` radius, graphite surface, default border, white text, `20px` horizontal padding.
- **Focus:** Focus border should shift to AMG Gold. Required fields use a red asterisk in the label, not hidden validation.
- **Error / Disabled:** Error fields use red border and a plain-language message. Disabled fields keep the same geometry with muted surface and text.
- **Phone Field:** Country code and phone number stay on one row. Country code has a fixed `128px` width; phone input flexes.

### Navigation

Navigation should prioritize repeated mobile use.

- Bottom tabs and route headers should use the same icon family and gold active color.
- Active states must be clear without using saturated color on every inactive item.
- Back actions use secondary buttons in detail screens and should not compete with primary task actions.

### Signature Component

**Scanner / Ticket / Certificate Status Surfaces:** These surfaces must communicate backend-confirmed truth. Use status badges, clear result titles, and direct next actions. Avoid decorative celebration until the state is successfully validated.

## 6. Do's and Don'ts

### Do:

- **Do** keep AMG Gold scarce and meaningful: primary actions, selected state, focus, and validated success cues.
- **Do** use the premium black palette as the default experience, with readable graphite form surfaces.
- **Do** mark required form fields with a visible asterisk and keep optional professional metadata visually optional.
- **Do** write error messages that name the fix, especially for login, Google profile completion, payment, scanner, and certificate states.
- **Do** preserve backend authority in UI copy: payment, eligibility, QR, course access, and certificates must read as server-confirmed.
- **Do** maintain `44px` minimum touch targets and `54px` input height on mobile forms.

### Don't:

- **Don't** use heavy near-black interfaces that make forms and event flows feel gloomy or hard to read.
- **Don't** make the product look like a generic SaaS dashboard.
- **Don't** use decorative glassmorphism, blur panels, or glossy cards as a default visual system.
- **Don't** over-round cards, sections, or inputs beyond the token scale. Cards and inputs stop at `18px`; only actions and badges may be full pill.
- **Don't** ship vague errors like "Something went wrong" when a form, session, or API state can be explained.
- **Don't** use childish learning-app styling, cluttered promotional layouts, or flashy event visuals that make AMG feel less medical or less trustworthy.
- **Don't** invent status language on the client. Use backend-owned status values and shared domain maps.
