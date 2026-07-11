# AI Prompt Library

This document defines approved prompt patterns for generating Certisphere brand-supporting text, imagery briefs, presentation outlines, document drafts, and review assistance.

AI output must always be reviewed by a human before publication, customer use, or implementation. AI must never be represented as making final compliance, certification, approval, controlled-information, or management-system decisions.

## Prompt Governance

All brand-related AI usage must follow:

- [Brand Governance](BRAND_GOVERNANCE.md)
- [Brand Strategy](BRAND_STRATEGY.md)
- [Brand Voice](BRAND_VOICE.md)
- [Visual Identity](VISUAL_IDENTITY.md)
- [Brand Review Checklist](BRAND_REVIEW_CHECKLIST.md)
- [Product Principles](../../product/PRODUCT_PRINCIPLES.md)

Prompts must not request unsupported compliance claims, fictional customer evidence, fabricated certifications, or unapproved product capabilities.

## Standard Brand Context

Use this context block when requesting Certisphere brand-aware outputs:

```text
Certisphere is an AI-powered Integrated Management System SaaS platform.
Tagline: Build, manage and certify your management systems in one platform.
The brand is professional, assured, precise, practical, evidence-led and commercially credible.
Certisphere helps organisations build, manage and certify ISO management systems by connecting controlled information, workflows, evidence, audit trails, risks, training, suppliers and management review.
AI provides suggestions for human review and approval. AI must not be described as making final compliance, approval or certification decisions.
Use UK English.
Avoid unsupported certification, security, legal, regulatory or customer outcome claims.
```

## Product Copy Prompt

Use for short product UI, onboarding, navigation, or empty-state copy.

```text
Using the Certisphere brand context, write concise product copy for:

Context:
[Describe the screen, workflow or component.]

Audience:
[Quality manager, auditor, consultant, administrator, executive, or end user.]

Requirements:
- Use clear UK English.
- Keep the tone professional, practical and assured.
- Avoid marketing exaggeration.
- Do not imply that AI makes final decisions.
- Do not introduce product capabilities not described in the context.
- Provide 3 options and recommend one.
```

## Marketing Copy Prompt

Use for website sections, campaign copy, sales assets, and commercial narratives.

```text
Using the Certisphere brand context, draft marketing copy for:

Asset:
[Website page, landing section, sales email, product one-pager, event description.]

Audience:
[Target persona and buying context.]

Primary message:
[What the asset must communicate.]

Constraints:
- Use evidence-led language.
- Avoid unsupported certification, compliance, security or ROI claims.
- Make the value proposition specific to management-system work.
- Keep AI positioning human-governed.
- Include a short headline, supporting paragraph and optional call to action.
```

## Document and Report Prompt

Use for governed templates, internal reports, audit reports, and management review content.

```text
Using the Certisphere brand context, draft a structured document section for:

Document type:
[Report, policy, procedure, checklist, management review pack, audit summary.]

Purpose:
[Purpose of the section.]

Inputs:
[Known facts, evidence, decisions or source material.]

Requirements:
- Use professional UK English.
- Separate facts, decisions, evidence and recommendations.
- Do not fabricate evidence.
- Do not overstate certification readiness.
- Preserve traceability to source material.
- Include headings suitable for a governed document.
```

## Presentation Prompt

Use for sales, investor, training, or internal decks.

```text
Using the Certisphere brand context, create a presentation outline for:

Presentation type:
[Sales, investor, training, onboarding, internal governance.]

Audience:
[Audience and decision role.]

Outcome:
[What the presentation must achieve.]

Requirements:
- Follow the Certisphere brand voice.
- Keep slides focused and visually structured.
- Include suggested slide titles and speaker intent.
- Avoid unsupported claims.
- Identify where evidence, screenshots, diagrams or customer proof would be required.
```

## Visual Brief Prompt

Use for briefing designers or image-generation tools. Generated imagery must still pass brand review.

```text
Using the Certisphere visual identity, create a visual brief for:

Asset:
[Website hero, illustration, document cover, presentation cover, report graphic.]

Purpose:
[Purpose and audience.]

Visual requirements:
- Professional SaaS visual style.
- Management-system, audit, evidence, workflow, governance or certification-readiness context.
- Use Midnight Navy, Corporate Navy, Azure Blue, Bright Sky Blue, Pure White and Soft Grey.
- Avoid generic stock imagery, unrelated technology imagery and decorative palettes.
- Do not show fictional customer logos, badges, certificates or regulatory approvals.
- Maintain accessibility and clear hierarchy.
```

## Brand Review Prompt

Use to assist reviewers. AI review does not replace human approval.

```text
Review the following asset against the Certisphere brand documentation:

Asset:
[Paste or summarise the asset.]

Review against:
- Brand Strategy
- Brand Voice
- Visual Identity
- Colour System
- Logo Usage
- UI Branding where relevant
- Brand Review Checklist

Return:
- Strengths
- Issues
- Required corrections
- Unsupported claims
- Accessibility risks
- Approval recommendation for human reviewer
```

## Prohibited Prompt Requests

Do not ask AI to:

- Create fake customer quotes, audit evidence, certifications, badges, accreditations, or compliance proof.
- Claim that Certisphere guarantees certification.
- Claim that AI approves controlled information or makes compliance decisions.
- Generate competitor disparagement.
- Create brand assets using third-party marks without permission.
- Produce confidential customer content without approval.
- Bypass accessibility, legal, security, or product governance review.

## Output Review Requirements

Before AI output is used, the reviewer must confirm:

- The output matches Certisphere brand voice.
- Claims are evidence-led and supportable.
- AI governance is respected.
- UK English is used where required.
- No confidential or unlicensed material is included.
- The output passes [Brand Review Checklist](BRAND_REVIEW_CHECKLIST.md) when customer-facing or publication-ready.

