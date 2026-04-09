# Shopro 'Layman Professional' Design System

This document defines the core visual and structural principles of the "Layman Professional" design language used across the Shopro Restaurant Management Platform. All future UI development must strictly adhere to these rules to maintain a consistent, efficient, and professional SaaS experience.

## 1. Typography (The Inter Font System)
We have moved away from oversized/stylized fonts (Syne, DM Sans) in favor of **Inter**, which provides maximum readability and a crisp SaaS feel.

- **Global Font**: `Inter`, sans-serif.
- **Headings (H1-H6)**:
  - **Weight**: Default to `font-semibold` or `font-bold`.
  - **Style**: NEVER use italics or `font-black` (900) for standard page headers.
  - **Case**: Use Title Case, not ALL CAPS for primary headers.
  - **Tracking**: Standard or `tracking-tight` (-0.01em). Remove `tracking-tighter`.
- **Body Context**:
  - `text-sm` (14px) for most data-heavy interfaces.
  - `text-base` (16px) for instructional or marketing content.

## 2. Layout & Constrainment
To ensure professional balance on large-screen terminals and desktops, all "Hub" and "Editor" screens must be constrained.

- **Primary Container**: `max-w-5xl mx-auto`.
- **Vertical Spacing**: Use `max-h-[90vh]` and vertical centering (`flex items-center justify-center`) for standalone wizard or modal-like editors.
- **Grids**: Standardize on `gap-4` or `gap-6`. Avoid oversized padding (p-12+) unless specifically for a hero landing.

## 3. Component Aesthetics
Avoid the "High-Fidelity" look where every card is a dramatic event.

- **Cards**:
  - Border: `border-border/40`.
  - Background: `bg-surface` or `bg-white/50` (glassmorphism should be subtle, not opaque).
  - Radius: Standardize on `rounded-xl` (buttons/small cards) and `rounded-3xl` (large layout cards). Avoid `rounded-[40px]`.
  - Hover: Subtle `scale-[1.01]` or just a border/shadow change. No dramatic `rotate-3` or `scale-110` by default.
- **Buttons**:
  - Standard height: `h-10` or `h-12`. Avoid `h-14` or `h-16` unless it's a primary CTA on a landing page.
  - Style: Solid backgrounds with subtle shadows. No bold-italic text inside buttons.
- **Icons**:
  - Standard size: `size-5` (20px) or `size-4` (16px) for secondary metadata.

## 4. Nomenclature & Tone
- Use plain, descriptive English.
- Avoid "Flamboyant" culinary terms like "The Manifest", "Culinary Intelligence Hub", or "Molecular Breakdown".
- Favor "Inventory Master", "Recipe Editor", and "Ingredient List".

## 5. Replaying the Style
When building a new UI (e.g., a new "Onboarding" or "Reporting" screen):
1. Use `Inter` font.
2. Wrap in `max-w-5xl mx-auto`.
3. Use `font-bold` (not black) for titles.
4. Keep interactions crisp and subtle.
