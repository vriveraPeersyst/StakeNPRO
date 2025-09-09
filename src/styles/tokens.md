# Design Tokens → Tailwind Mapping

This file maps the design tokens from the spec to Tailwind CSS utilities.

## Colors

### Primary Palette
- `primary #5F8AFA` → `text-primary`, `bg-primary`, `border-primary`
- `teal #17D9D4` → `text-teal`, `bg-teal`, `border-teal`

### Neutral/Muted (nm) Palette
- `nm.bgTop #F6F6F6` → `bg-nm-bgTop`
- `white #FFFFFF` → `bg-white`
- `nm.text #3F4246` → `text-nm-text`
- `nm.muted #999999` → `text-nm-muted`
- `nm.disabled #DBDBDB` → `text-nm-disabled`, `bg-nm-disabled`
- `nm.border #E5E5E5` → `border-nm-border`
- `nm.chip #F6F6F6` → `bg-nm-chip`
- `nm.cta #E5ECFE` → `bg-nm-cta`
- `nm.banner #27282B` → `bg-nm-banner`
- `nm.warn #FF7966` → `text-nm-warn`, `bg-nm-warn`

## Border Radius
- `12px` → `rounded-2xl` (navbar)
- `24px` → `rounded-3xl` (card)
- `100px` → `rounded-pill` (pills/buttons)

## Shadows
- `0 4px 16px rgba(48,50,54,0.12)` → `shadow-nm`

## Typography

### Font Families
- Primary: `font-sans` → "SF Pro", ui-sans-serif, system-ui, sans-serif
- Monospace: `font-mono` → "SF Mono", ui-monospace, etc.

### Font Sizes & Line Heights (size/line)
- `36/48 semibold (510)` → `text-4xl leading-12 font-semibold`
- `18/28 semibold` → `text-lg leading-7 font-semibold`
- `16/24 regular & semibold` → `text-base leading-6 font-normal|font-semibold`
- `14/20 mono semibold` → `text-sm leading-5 font-mono font-semibold`
- `12/16 mono semibold` → `text-xs leading-4 font-mono font-semibold`

### Letter Spacing
- `-0.01em` → `tracking-tight`

## Layout Constraints

### Max Widths
- Canvas: `1280px` → `max-w-canvas`
- Content column: `760px` → `max-w-content`

### Heights
- Canvas: `1080px` → `h-canvas`

## Background Gradients
- Header gradient → `bg-nm-header`
- Logo gradient → `bg-nm-logo-grad`

## Component Heights
- Navbar: `56px` → `h-14`
- Tab row: `80px` → `h-20`
- Input: `72px` → `h-18`
- Action button: `52px` → `h-13`
- Banner: `56px` → `h-14`
