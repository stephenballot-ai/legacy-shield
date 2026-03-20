# Design System Specification: The Digital Sentinel

## 1. Overview & Creative North Star
The core objective of this design system is to transform a digital estate service into a high-end, editorial experience that radiates authoritative security. We move beyond "blue software" into the realm of a **"Digital Sentinel"**—a Creative North Star that balances the weight of a traditional Swiss bank vault with the ethereal lightness of modern cloud architecture.

To achieve a premium, custom feel, this system abandons the rigid, boxed-in layouts of typical SaaS templates. Instead, we utilize **intentional asymmetry**, high-contrast typographic scales, and **tonal layering**. The experience should feel bespoke and curated, using "breathing room" (generous whitespace) as a luxury asset rather than a void to be filled.

---

## 2. Colors: Tonal Architecture
The palette is built on deep, institutional navies and sophisticated neutrals, accented by a vibrant secondary gold that signals action and value.

### The "No-Line" Rule
To ensure a premium feel, **1px solid borders are strictly prohibited for sectioning or containment.** Boundaries must be defined through background color shifts or subtle tonal transitions. For example, a section using `surface-container-low` should sit directly against a `surface` background to create a clean, modern edge without the visual noise of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine paper or frosted glass.
*   **Base:** `surface` (#f8f9ff)
*   **Elevated Containers:** Use `surface-container-lowest` (#ffffff) for primary content cards to create a soft, natural lift against the background.
*   **Nested Importance:** Use `surface-container-high` (#dfe9fa) for internal sub-sections (like code blocks or secondary metadata) to provide a "recessed" look within a primary card.

### Signature Textures & Glassmorphism
*   **The Gradient Rule:** CTAs and Hero backgrounds must utilize subtle gradients transitioning from `primary` (#000f39) to `primary_container` (#16254f). This prevents the "flat" look of entry-level UI.
*   **Glassmorphism:** For floating elements like sticky navigation or tooltips, use `surface_container_lowest` at 80% opacity with a `backdrop-blur` of 12px-16px. This integrates the element into the layout while maintaining legibility.

---

## 3. Typography: Editorial Authority
We utilize **Inter** as our primary typeface, leaning into its clean, geometric proportions to convey modern reliability.

*   **Display Scales (`display-lg` to `display-sm`):** Reserved for high-impact hero statements. Use `primary` or `on_background` colors. Tighten letter-spacing by -2% for a high-fashion editorial look.
*   **Headline Scales:** Use these to introduce sections. The contrast between a `headline-lg` (2rem) and `body-lg` (1rem) should be stark to establish clear visual hierarchy.
*   **Monospace Integration:** Utilize `ui-monospace` (token: `tertiary`) sparingly for "Trust Markers" like transaction IDs, encryption keys, or technical stats. This signals precision and security.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often a sign of unrefined design. This system favors **Tonal Layering** for hierarchy.

*   **The Layering Principle:** Depth is achieved by "stacking" surface tiers. Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#eef4ff) section. The color difference alone provides the necessary separation.
*   **Ambient Shadows:** When a "floating" effect is mandatory (e.g., a primary Pricing Card), use extra-diffused shadows:
    *   **Blur:** 40px - 60px
    *   **Opacity:** 4% - 6%
    *   **Color:** Use a tinted version of `on_surface` (deep navy) rather than neutral grey to mimic natural, ambient light.
*   **The Ghost Border Fallback:** If accessibility requires a border, use the `outline_variant` token at **15% opacity**. Never use a 100% opaque stroke.

---

## 5. Components: Bespoke Elements

### Hero Sections
*   **Layout:** Use asymmetrical grids. Place the `display-lg` headline off-center with a large `spacing-20` margin to create a sense of high-end editorial design.
*   **Background:** Use a deep `primary` to `primary_container` gradient with a subtle noise texture (2% opacity) to add "soul."

### Buttons
*   **Primary:** Background: `secondary_container` (#fdbb12) | Text: `on_secondary_container` (#6c4d00). Use `rounded-md` (0.375rem). The gold accent should feel like a "gold standard" seal of quality.
*   **Secondary:** Ghost style. No background. `outline` border at 20% opacity. Text: `primary`.

### Cards & Feature Grids
*   **Rule:** Forbid divider lines. 
*   **Styling:** Use `surface-container-lowest` with a `rounded-xl` (0.75rem) corner radius. Use `spacing-8` for internal padding to ensure the content "breathes."
*   **Grouping:** Separate card clusters using `spacing-16` or background shifts (e.g., moving from a `surface` section to a `surface-container-low` section).

### Trust Markers
*   Use `label-md` typography in `on_surface_variant`. 
*   Icons should be thin-stroke (1.5pt) and use the `surface_tint` color to feel integrated rather than loud.

### Input Fields
*   **Background:** `surface_container_low`. 
*   **Border:** None (use the "No-Line" rule). Instead, use a subtle `outline` on focus.
*   **Feedback:** Error states use `error` (#ba1a1a) text but the background should shift to `error_container` at 10% opacity for a soft, premium alert.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use white space as a structural element. If a section feels crowded, double the spacing token (e.g., from `spacing-10` to `spacing-20`).
*   **DO** use high-contrast type. Pair a very large headline with a small, well-leaded body paragraph.
*   **DO** use "Ghost Borders" at 10-20% opacity for interactive elements like input fields or toggle switches.

### Don't:
*   **DON'T** use 1px solid black or dark grey borders to separate sections. Use color blocks instead.
*   **DON'T** use default "Drop Shadows" from design software. Always tint the shadow color with the brand's navy (`primary`) and use high blur values.
*   **DON'T** use centered layouts for everything. Use left-aligned or asymmetrical compositions to create visual interest and a custom feel.
*   **DON'T** use more than one CTA in the `secondary_container` (Gold) per view. It is a high-value signal; overusing it devalues the brand.