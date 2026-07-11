# Brand Governance

This document defines how the Certisphere brand is governed, reviewed, approved, and protected across product, marketing, sales, support, partner, investor, training, documentation, video, and certification-facing material.

Brand governance applies to every internal and external asset that uses the Certisphere name, logo, visual identity, product screenshots, commercial claims, management-system terminology, or AI-generated creative output.

## Governance Objectives

- Protect Certisphere as a commercial SaaS brand.
- Maintain a consistent customer experience across product and communication channels.
- Prevent unsupported compliance, certification, security, and AI claims.
- Ensure brand assets remain accurate, accessible, and legally usable.
- Keep design decisions traceable to governed documentation.
- Support future ISO 9001, ISO 14001, ISO 45001, ISO 27001, and integrated management-system positioning.

## Source of Truth

The governed source of truth for the Certisphere brand is this folder:

- [Brand Guidelines](BRAND_GUIDELINES.md)
- [Brand Strategy](BRAND_STRATEGY.md)
- [Brand Voice](BRAND_VOICE.md)
- [Visual Identity](VISUAL_IDENTITY.md)
- [Colour System](COLOUR_SYSTEM.md)
- [Typography](TYPOGRAPHY.md)
- [Logo Usage](LOGO_USAGE.md)
- [Design Tokens](DESIGN_TOKENS.md)
- [AI Prompt Library](AI_PROMPT_LIBRARY.md)
- [Brand Review Checklist](BRAND_REVIEW_CHECKLIST.md)
- [Brand Portal](BRAND_PORTAL.md)
- [Brand Assets](BRAND_ASSETS.md)

Application implementation must continue to use the central product brand configuration in the codebase. This documentation governs the brand intent, usage rules, review process, and asset lifecycle.

## Decision Rights

| Decision Area | Accountable Owner | Required Review |
| --- | --- | --- |
| Brand strategy and positioning | Product Owner | Commercial and engineering governance review |
| Logo and visual identity | Product Owner | Brand review using [Brand Review Checklist](BRAND_REVIEW_CHECKLIST.md) |
| Product UI brand application | Lead Software Engineer | Product and accessibility review |
| Marketing and website assets | Product Owner | Brand and legal claim review |
| Sales and investor collateral | Product Owner | Commercial claim review |
| Certification-facing documents | Product Owner | Compliance and evidence review |
| AI-generated brand assets | Product Owner | Human review before publication |
| Design token changes | Lead Software Engineer | Accessibility and implementation review |

## Change Control

Brand governance changes must be made through version-controlled repository changes.

Every material change must include:

- Reason for change.
- Documents or assets affected.
- Review owner.
- Impact on product, website, reports, templates, or commercial assets.
- Confirmation that links and references remain valid.

Changes that affect application behaviour, API behaviour, database schema, or generated documents must be handled through the normal engineering release process and must not be hidden inside brand documentation updates.

## Brand Asset Lifecycle

Brand assets follow this lifecycle:

1. Created or sourced.
2. Stored in the correct folder under `docs/brand/assets`.
3. Reviewed against [Brand Review Checklist](BRAND_REVIEW_CHECKLIST.md).
4. Approved for internal use, external use, or implementation use.
5. Version controlled.
6. Retired or superseded when replaced.

Unreviewed assets must not be used in customer-facing, investor-facing, certification-facing, or production product contexts.

## Review Gates

A brand review is required before:

- Publishing website or marketing pages.
- Releasing product screenshots externally.
- Sending sales decks or investor decks.
- Publishing reports, white papers, or customer templates.
- Releasing certification-facing reports or certificates.
- Adding or changing primary brand tokens.
- Adding AI-generated brand imagery, prompts, voice scripts, or motion assets.
- Updating logos, icons, colour palettes, or typography rules.

The review must use [Brand Review Checklist](BRAND_REVIEW_CHECKLIST.md).

## Claim Governance

Certisphere must not make unsupported claims.

The following claims require explicit evidence or approved wording:

- Certification readiness claims.
- Audit, compliance, or regulatory claims.
- Security and data protection claims.
- AI accuracy or automation claims.
- Customer outcome claims.
- Performance, uptime, or scalability claims.

AI must never be described as making final compliance, approval, certification, or controlled-information decisions. Certisphere AI positioning must remain consistent with the governed principle that AI provides suggestions for human review and approval.

## Accessibility Governance

Brand assets must support WCAG 2.2 AA expectations where they are used digitally.

Reviewers must check:

- Text contrast.
- Logo contrast.
- Focus-visible design where applicable.
- Motion sensitivity.
- Captions for video.
- Meaningful alt text for digital images.
- Legible typography in documents and presentations.

## Asset Storage Rules

Assets must be organised under [Brand Assets](BRAND_ASSETS.md):

- `docs/brand/assets/logos`
- `docs/brand/assets/icons`
- `docs/brand/assets/illustrations`
- `docs/brand/assets/presentations`
- `docs/brand/assets/templates`
- `docs/brand/assets/videos`
- `docs/brand/assets/colours`

File names should be descriptive, lowercase, and hyphenated where practical. Duplicate unmanaged copies must not be introduced.

## Audit Trail

The repository history is the audit trail for governed brand changes. Pull requests or commits that update brand assets should include:

- Asset purpose.
- Review outcome.
- Reviewer.
- Approved use cases.
- Any conditions or restrictions.

## Non-compliance

Brand assets that do not comply with this governance document must be corrected, withdrawn, or explicitly superseded. Material non-compliance in customer-facing or certification-facing material must be treated as a release risk.

