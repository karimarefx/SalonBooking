---
name: Modern Elegance
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4e4639'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#7f7667'
  outline-variant: '#d1c5b4'
  surface-tint: '#775a19'
  primary: '#775a19'
  on-primary: '#ffffff'
  primary-container: '#c5a059'
  on-primary-container: '#4e3700'
  inverse-primary: '#e9c176'
  secondary: '#645d5b'
  on-secondary: '#ffffff'
  secondary-container: '#ebe0de'
  on-secondary-container: '#6a6361'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#a4a5a5'
  on-tertiary-container: '#393b3b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#e9c176'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4201'
  secondary-fixed: '#ebe0de'
  secondary-fixed-dim: '#cec4c3'
  on-secondary-fixed: '#1f1a1a'
  on-secondary-fixed-variant: '#4c4544'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
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
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
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
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is anchored in "Modern Elegance," a philosophy that balances the tactile luxury of a high-end spa with the effortless efficiency of modern technology. The target audience is women seeking a premium, stress-free booking experience for beauty and wellness services. 

The visual direction utilizes **Minimalism** with a touch of **Soft Glamour**. It prioritizes heavy white space to evoke a sense of "air" and "calm," mirroring the serene environments of the salons it represents. Every interaction should feel intentional and sophisticated, avoiding clutter in favor of high-quality imagery and refined typography. The emotional response is one of aspiration, trust, and tranquility.

## Colors

The palette is curated to feel both organic and premium. 

- **Primary (#C5A059):** A muted, premium gold used exclusively for primary calls-to-action, active states, and subtle accents to denote high value.
- **Secondary (#FDF2F0):** A soft blush used for large surface areas, subtle background shifts, and to soften the overall UI.
- **Neutral (#2D2D2D):** A deep charcoal used for text and iconography to ensure high legibility and a grounded, professional feel.
- **Background (#FFFFFF):** Pure white serves as the foundation of the design, providing the necessary "breathing room" for a sophisticated aesthetic.

## Typography

This design system employs a classic high-contrast pairing. **Playfair Display** is used for headlines to convey grace and editorial authority. It should be used with slightly tighter letter-spacing for large displays. 

**Inter** handles all functional and body text. Its neutral, systematic nature ensures that information—such as service lists, pricing, and time slots—remains highly legible and accessible. Use uppercase styling for `label-lg` to create a sophisticated, "magazine-style" hierarchy for section headers or small metadata.

## Layout & Spacing

The design system follows a **Fixed Grid** model for desktop and a **Fluid Grid** for mobile devices. 

- **Desktop:** A 12-column grid centered within a 1200px container. Large "stack" spacing (48px+) is encouraged between major sections to maintain the airy, premium feel.
- **Mobile:** A 4-column fluid grid with 20px side margins. 
- **Rhythm:** All spacing is based on an 8px baseline. Use wider gutters (24px) to ensure that even dense information layouts feel uncrowded. Content reflow should prioritize vertical stacking for service cards and booking flows.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**. 

- **Surfaces:** Use the secondary blush color (#FDF2F0) as a "Layer 1" background to distinguish sections from the main white background. 
- **Shadows:** Avoid harsh, black shadows. Instead, use "Soft Glow" shadows—low-opacity (8-12%), highly diffused (20px+ blur), with a slight tint of the primary gold or neutral charcoal. These should be reserved for interactive elements like floating cards or open modals.
- **Outlines:** For input fields and secondary buttons, use low-contrast 1px borders in a lightened version of the neutral charcoal to maintain a clean look without the "heaviness" of a shadow.

## Shapes

The shape language is consistently **Rounded**, reflecting the softness and approachability of the wellness industry. 

- **Standard Elements:** Buttons, input fields, and small cards use a 0.5rem (8px) radius.
- **Large Containers:** Content cards and imagery containers use `rounded-lg` (1rem / 16px) to create a gentle, framing effect.
- **Imagery:** Photos of salon environments should always feature slightly rounded corners to avoid the sharpness of industrial design.

## Components

- **Buttons:** Primary buttons use a solid Gold (#C5A059) fill with white text. Secondary buttons are outlined or use a subtle blush background. All buttons should have a minimum height of 48px to feel substantial and accessible.
- **Cards:** Service and professional cards should use `rounded-lg` corners, a white background, and a "Soft Glow" shadow on hover. Imagery within cards should take up the top half, bleeding to the edges.
- **Input Fields:** Minimalist design with a 1px bottom border or a very light gray perimeter. Focus states should transition the border to Gold.
- **Chips:** Used for categories (e.g., "Massage," "Facial"). These should be pill-shaped with a blush background and charcoal text.
- **Iconography:** Use "Light" or "Thin" weight line icons with 2px strokes. Icons should be charcoal and never overly complex.
- **Booking Progress:** A slim, elegant progress bar using the Gold accent to guide users through the appointment scheduling flow.