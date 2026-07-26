---
name: Cyber-Modular Gaming Interface
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#cfc2d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#988d9f'
  outline-variant: '#4d4354'
  surface-tint: '#ddb7ff'
  primary: '#ddb7ff'
  on-primary: '#490080'
  primary-container: '#b76dff'
  on-primary-container: '#400071'
  inverse-primary: '#842bd2'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#009eb9'
  on-tertiary-container: '#002f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#ddb7ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6900b3'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  surface-card: '#1E293B'
  status-no-key: '#22C55E'
  status-key-required: '#F59E0B'
  status-verified: '#3B82F6'
  status-script-hub: '#A855F7'
typography:
  headline-xl:
    fontFamily: Lexend
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-desktop: 2rem
  margin-mobile: 1rem
  unit: 4px
---

## Brand & Style

This design system is built for a high-performance gaming community and script repository. The brand personality is **technical, energetic, and authoritative**, designed to resonate with power users and developers within the gaming ecosystem. 

The visual style is a fusion of **Corporate Modern** and **Neon-Infused Glassmorphism**. It prioritizes extreme legibility and modularity while maintaining the "gamer" aesthetic through the use of vibrant accents and subtle depth effects. The interface should feel like a premium command center—structured and professional, yet undeniably rooted in gaming culture. High contrast is maintained across all surfaces to ensure accessibility during long gaming sessions in low-light environments.

## Colors

The palette is anchored in deep, "ink" tones to reduce eye strain and provide a canvas for vibrant UI elements.

- **Primary & Accents:** Neon Purple (#A855F7) is the lead brand color, used for the most significant actions. Electric Blue and Cyan serve as supporting accents for navigation and data visualization.
- **Backgrounds:** The foundation uses Deep Charcoal (#0F172A) for the primary background, with Navy (#1E293B) utilized for elevated surface containers and cards.
- **Status Indicators (Indonesian Context):** 
    - **No Key:** Hijau (#22C55E) indicating free access.
    - **Key Required:** Oranye (#F59E0B) for restricted/premium content.
    - **Verified:** Biru (#3B82F6) for trusted developers.
    - **Script Hub:** Ungu (#A855F7) for proprietary hub scripts.

## Typography

This design system utilizes a dual-font strategy. **Lexend** is used for headings to provide a modern, technical, and slightly wide geometric feel that commands attention. **Inter** is used for all body text and UI labels due to its exceptional legibility and neutral tone.

Typography scales are optimized for high-density information. Labels and metadata (like script versions or categories) should use the `label-md` style with uppercase casing to distinguish them clearly from descriptive body text.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid grid**. While the main content container is capped at 1280px for optimal readability on ultra-wide monitors, inner components reflow using a 12-column system.

- **Grid:** Use 1.5rem (24px) gutters between columns.
- **Rhythm:** All spacing (padding, margins) must be increments of the 4px base unit. 
- **Responsive Behavior:** 
    - **Desktop:** 12 columns, 32px margins.
    - **Tablet:** 8 columns, 24px margins.
    - **Mobile:** 4 columns, 16px margins. Cards should transition from multi-column grids to a single-column stack on screens below 640px.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphism**, avoiding traditional heavy shadows in favor of light-based depth indicators.

1. **Base:** The primary background (#0F172A).
2. **Surface:** Elevated cards and panels use #1E293B.
3. **Glass Overlay:** Modals and navigation bars use a semi-transparent version of the surface color (opacity 0.7) with a `20px` backdrop blur.
4. **Glow:** Active elements (like the primary button or a selected script card) feature a subtle outer glow using the primary color at 20% opacity, simulating a "lit" hardware effect.
5. **Borders:** Surfaces should use a thin 1px border (#334155) to define edges against the dark background.

## Shapes

The design system uses a **Rounded** (0.5rem / 8px) base language, scaling up to **1rem (16px)** for large containers and cards to create a modern, friendly-yet-tech feel. 

Buttons and input fields should strictly adhere to the `rounded-lg` (16px) specification to match the glassmorphic card containers. Tags and Chips may use full pill-rounding for distinct visual categorization.

## Components

### Buttons (Tombol)
- **Primary:** Gradient background from #A855F7 to #3B82F6. White text. Subtle 8px purple glow on hover.
- **Secondary:** Transparent background with a 1px border of #3B82F6. Text in Electric Blue.
- **Ghost:** No border or background. Used for low-priority actions like "Batal" (Cancel).

### Script Cards (Kartu Skrip)
Cards feature a header with the script title (Lexend), a metadata row (Status Badge + Game Version), and a footer for action buttons. Use the Surface color (#1E293B) with a 1px border.

### Badges (Lencana Status)
Small, semi-transparent backgrounds with high-contrast text.
- **Tanpa Key (No Key):** Background Hijau (20% opacity), Text Hijau.
- **Butuh Key (Key Required):** Background Oranye (20% opacity), Text Oranye.
- **Terverifikasi (Verified):** Background Biru (20% opacity), Text Biru.

### Input Fields (Kolom Input)
Darker background (#0F172A) with a subtle 1px border. On focus, the border color changes to Cyan (#06B6D4) with a match-color outer glow. Placeholder text should be low-contrast gray.

### Navigation (Navigasi)
Top-fixed bar with backdrop blur (Glassmorphism). Links use `label-md` typography. The active state is indicated by a 2px Cyan bottom-border and a subtle vertical gradient.