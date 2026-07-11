# Design Tokens

This document defines the governed brand token model for Certisphere. Design tokens translate the Certisphere visual identity into repeatable implementation values for product UI, website, reports, presentation templates, and generated documents.

These tokens are governance-level definitions. Product code must consume brand values through the approved application design-system configuration rather than duplicating values in unrelated modules.

## Token Principles

- Tokens must express brand intent, not incidental styling.
- Tokens must support accessibility by default.
- Tokens must be stable enough for production SaaS implementation.
- Tokens must map clearly to [Colour System](COLOUR_SYSTEM.md), [Typography](TYPOGRAPHY.md), [UI Branding](UI_BRANDING.md), and [Logo Usage](LOGO_USAGE.md).
- Tokens must not introduce unofficial palettes, fonts, spacing systems, or product states.

## Colour Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `brand.colour.midnightNavy` | `#0B2345` | Headings, dark surfaces, authority moments. |
| `brand.colour.corporateNavy` | `#143D73` | Navigation, footers, secondary dark surfaces, outlines. |
| `brand.colour.azureBlue` | `#0078D4` | Primary actions, links, icons, active states. |
| `brand.colour.brightSkyBlue` | `#29A9FF` | Highlights, chart emphasis, progress indicators. |
| `brand.colour.white` | `#FFFFFF` | Main backgrounds and document surfaces. |
| `brand.colour.softGrey` | `#F5F7FA` | Secondary panels, form surfaces, quiet backgrounds. |
| `brand.colour.error` | `#C53030` | Error state only. |
| `brand.colour.warning` | `#D69E2E` | Warning state only. |
| `brand.colour.success` | `#2F855A` | Success state only. |

Semantic colours must not become dominant brand colours.

## Surface Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `brand.surface.default` | `#FFFFFF` | Primary application and document background. |
| `brand.surface.subtle` | `#F5F7FA` | Secondary sections, panels, forms. |
| `brand.surface.inverse` | `#0B2345` | Dark branded surfaces. |
| `brand.surface.navigation` | `#143D73` | Product navigation and commercial footer usage. |
| `brand.surface.focus` | `#0078D4` | Focus and interactive emphasis when contrast is sufficient. |

## Text Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `brand.text.primary` | `#0B2345` | Primary text on light surfaces. |
| `brand.text.secondary` | `#143D73` | Secondary headings, metadata, supporting text. |
| `brand.text.inverse` | `#FFFFFF` | Text on dark branded surfaces. |
| `brand.text.link` | `#0078D4` | Links and navigational actions. |
| `brand.text.error` | `#C53030` | Error copy only. |

## Typography Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `brand.font.family.primary` | `Aptos, Segoe UI, Arial, sans-serif` | Product UI, documents, presentations, website. |
| `brand.font.weight.regular` | `400` | Body copy. |
| `brand.font.weight.medium` | `500` | Labels and supporting emphasis. |
| `brand.font.weight.semibold` | `600` | Section headings and controls. |
| `brand.font.weight.bold` | `700` | Major headings and strong emphasis. |
| `brand.font.letterSpacing.default` | `0` | Standard text. |

Letter spacing must remain `0` unless a specific brand asset has been approved for display-only usage.

## Radius Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `brand.radius.none` | `0` | Tables, dividers, document elements. |
| `brand.radius.small` | `4px` | Inputs, compact controls. |
| `brand.radius.medium` | `8px` | Cards, modals, repeated UI items. |

Operational SaaS UI should use restrained radius. Large rounded decorative containers are not part of the Certisphere brand system.

## Spacing Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `brand.space.1` | `4px` | Fine alignment. |
| `brand.space.2` | `8px` | Compact gaps. |
| `brand.space.3` | `12px` | Form spacing. |
| `brand.space.4` | `16px` | Standard content spacing. |
| `brand.space.6` | `24px` | Section spacing. |
| `brand.space.8` | `32px` | Page-level spacing. |
| `brand.space.12` | `48px` | Marketing and presentation sections. |

Spacing must support dense but organised operational workflows.

## Border Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `brand.border.subtle` | `#D8DEE8` | Dividers, table rules, input borders. |
| `brand.border.strong` | `#143D73` | Branded outlines where appropriate. |
| `brand.border.focus` | `#0078D4` | Keyboard focus and active states. |

## Shadow Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `brand.shadow.none` | `none` | Default operational UI. |
| `brand.shadow.subtle` | `0 1px 2px rgba(11, 35, 69, 0.12)` | Modals and elevated operational surfaces. |
| `brand.shadow.overlay` | `0 12px 30px rgba(11, 35, 69, 0.18)` | Dialogs and overlays. |

Shadows should be used sparingly. Brand quality should come from structure, hierarchy, contrast, and typography rather than decorative depth.

## Motion Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `brand.motion.duration.fast` | `120ms` | Focus and hover transitions. |
| `brand.motion.duration.standard` | `180ms` | Menus, disclosure, operational feedback. |
| `brand.motion.easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Accessible product motion. |

Motion must not interfere with operational use and must respect reduced-motion preferences.

## Logo Variant Tokens

| Token | Purpose |
| --- | --- |
| `brand.logo.default` | Primary full-colour Certisphere logo. |
| `brand.logo.light` | Logo for dark surfaces. |
| `brand.logo.dark` | Logo for light or neutral surfaces. |
| `brand.logo.icon` | Favicon, app icon, compact identity use. |

Logo use must comply with [Logo Usage](LOGO_USAGE.md).

## Token Change Requirements

Changing a design token requires:

- Brand governance review.
- Accessibility review.
- Product implementation impact assessment.
- Documentation update.
- Repository change history.

Breaking token changes must be handled through the release process because they can affect product UI, exports, templates, and customer-facing documentation.

