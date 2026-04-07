# UI Layout Skill Guide (System-Wide)

## 1. Purpose
This document is the source of truth for UI layout decisions across the system.

Primary goal:
- Reduce visual heaviness.
- Improve vertical breathing room.
- Standardize hierarchy between page title, content, and actions.
- Give AI agents decision-complete layout rules.

Mandatory rules:
- Reuse existing theme tokens and primitives.
- Do not introduce parallel visual language.
- Do not add new UI framework.

---

## 2. Scope and Sources

### Scope
- Applies to all dashboard and admin screens.
- Applies to forms, wizards, listings, summary blocks, and action bars.

### Internal source of truth
- `src/theme/theme.css`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/layout/PageContainer.tsx`

### External references used
- Atlassian Design spacing foundation: https://atlassian.design/foundations/spacing/
- Fluent 2 design tokens and foundations: https://fluent2.microsoft.design/get-started/design
- W3C WCAG 2.2 target size minimum: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Android accessibility guidance: https://developer.android.com/guide/topics/ui/accessibility/apps

---

## 3. Current UI Diagnosis
Observed pain points that this guideline fixes:
- Too many nested containers with borders (card-inside-card overuse).
- Vertical spacing too tight from titles to content.
- Action bars too close to body content.
- Competing visual blocks with equal border weight and no spacing hierarchy.

Non-compliant examples:
- Step result inside an extra bordered card when already inside a step card.
- Timeline card + section card + inner result card all bordered with equal weight.

---

## 4. Layout Foundation (8px rhythm)

Use an 8px base grid with 4px sub-steps.

### Spacing scale
- `4px`: micro adjustments only (`mt-1`, `gap-1`).
- `8px`: tight relation inside a micro group (`space-y-2`).
- `12px`: short stack inside compact block (`space-y-3`).
- `16px`: default internal separation (`gap-4`, `space-y-4`).
- `24px`: standard section spacing (`space-y-6`, card body groups).
- `32px`: large separation between independent sections.

### Page and section rules
- Root page stack: `space-y-6` minimum.
- Main section-to-section spacing: `24px` minimum.
- Header block to first content block: `24px`.
- Content block to action block: `24px` minimum.
- If action block is sticky or isolated, add divider and `pt-6`.

### Card rules
Base primitive already provides:
- Header padding: `p-6`
- Content padding: `p-6 pt-0`

Mandatory card composition:
- Card header title to subtitle: `6px` to `8px` visual distance.
- Header to first content group: inherited from `CardContent` with no extra negative spacing.
- Inner groups inside `CardContent`: default `space-y-6`.
- Do not create inner bordered card unless semantics require independent container behavior.

---

## 5. Typography and Hierarchy
Use only existing typography classes/tokens.

### Allowed classes
- `typo-page-title`
- `typo-page-subtitle`
- `typo-section-title`
- `typo-section-subtitle`
- `typo-card-title`
- `typo-card-subtitle`
- `typo-body`
- `typo-caption`
- `typo-label`

### Hierarchy rules
- Page title appears once per view.
- Subtitle must be visually lighter than title.
- Section/card titles must not compete with page title.
- Caption and helper text use muted foreground only.

### Weight and readability limits
- Avoid custom font weights outside tokenized typography.
- Keep body text readable: comfortable line height, avoid dense stacked paragraphs.
- Avoid long dense lines in explanatory text; break into short statements.

---

## 6. Components and Comfortable Density

### Button sizing (existing system)
From `button.tsx`:
- `sm`: `h-9`
- `default`: `h-10`
- `lg`: `h-11`

Usage rules:
- Toolbar/secondary actions: `sm` or `default`.
- Standard form and wizard actions: `default`.
- Primary call-to-action in high-importance flows: `lg` optional.
- Keep primary and secondary actions same row height whenever possible.

### Interaction target minimum
- Minimum pointer target: `24x24 CSS px` (WCAG 2.2 SC 2.5.8).
- Recommended touch target for key controls: `44-48px` effective area.

### Content width and readability
- Use `PageContainer` max width from system (`max-w-[100rem]`).
- In dense forms, prefer 1-2 columns only.
- Summary metrics in groups of 2-4 cards; avoid overcrowding.

### Control spacing
- Label to input: `6-8px`.
- Input to helper/error text: `6-8px`.
- Field group to next field group: `16-24px`.

---

## 7. Composition Rules (Anti-Weight)

Mandatory:
- Maximum 1 bordered card layer for main content.
- If already inside step card, result block must be plain (no extra bordered shell) unless there is functional separation.
- Action bar must not touch body content: keep `24px` distance or divider + `pt-6`.
- Timeline and content must not compete: timeline card uses softer visual weight than main content card.

Forbidden by default:
- Card inside card inside card for static information.
- Multiple equal-weight bordered wrappers for one semantic block.
- Buttons attached directly to content without spacing buffer.

Decision rule for extra container:
- Add inner container only if it changes behavior (scroll region, independent state grouping, collapsible region, or distinct status context).

---

## 8. Wizards and Step Flows

### Required blueprint
Each step must have:
1. Step title (what this step is).
2. Short step guidance (why/what to provide).
3. Sequential fields or actions.
4. Feedback area (validation/progress/result).
5. Action footer (Back/Next/Confirm) with clear separation.

### Spacing blueprint
- Step title to step guidance: `8-12px`.
- Guidance to first field group: `24px`.
- Between field groups: `16-24px`.
- Last content block to footer actions: `24px` minimum.

### Timeline status model
States:
- `pending`
- `current`
- `done`
- `success`
- `error`

Visual behavior:
- Full success run: all steps green.
- Failure in a step: failed step red with `X` icon.
- Current step highlighted and readable in both light/dark mode.

### Responsive behavior
- `<1420px`: timeline in horizontal mode, height auto.
- `>=1420px`: timeline may use fixed height if required by the page pattern.
- No nested scroll containers unless explicitly required by behavior.
- Default scroll owner is the page.

---

## 9. Accessibility and Interaction

Mandatory:
- Visible focus state on all interactive controls.
- Clear contrast between text and background using semantic tokens.
- Safe spacing between destructive and primary actions.
- Status color is not the only cue; pair with icon/text.

Form feedback rules:
- Errors close to the field or group they affect.
- Success/info states use existing semantic classes (`state-success-*`, `state-info-*`, etc.).
- Keep messages concise and action-oriented.

---

## 10. Acceptance Checklist (for PR and AI output)
A change is accepted only if all checks pass.

### Layout checks
- No unnecessary nested card shells.
- Header, content, and actions have clear vertical rhythm.
- Action area has at least 24px separation from content.
- No internal scroll introduced unless explicitly needed.

### Consistency checks
- Only semantic tokens used.
- Typography classes from system used correctly.
- Button sizes follow context rules (`h-9`, `h-10`, `h-11`).

### Wizard checks
- Step content follows blueprint.
- Timeline state reflects runtime result (success and error).
- Horizontal and vertical timeline remain legible.

### Accessibility checks
- Minimum target size respected.
- Focus state visible.
- Status communicated by icon/text in addition to color.

---

## 11. Contract for AI Agents (Skill Instructions)
Use this section as operational instructions for code agents.

### Before coding
- Read this file and `docs/llm-style-guide.md`.
- Inspect `theme.css`, `button.tsx`, `card.tsx`, and affected page/component.
- Identify where visual heaviness is caused by spacing or nesting.

### While coding
- Reuse primitives first.
- Apply 8px rhythm decisions explicitly.
- Remove non-semantic wrappers.
- Keep one clear action zone with breathing room.

### Before finishing
- Run static checks/lint if available.
- Validate responsive behavior `<1420px` and `>=1420px`.
- Confirm no accidental nested scroll regions.
- Confirm timeline and status behavior if wizard flow is touched.

### Blocking conditions (must fix)
- New parallel visual style not based on tokens.
- Extra card nesting without behavior purpose.
- Actions visually glued to content.
- Missing focus visibility or insufficient target sizing.

### Do / Do not
Do:
- Use semantic classes and existing primitives.
- Prefer spacing adjustments over adding wrappers.
- Keep hierarchy clear and predictable.

Do not:
- Hardcode colors in page-level classes.
- Stack bordered containers for static content.
- Create custom button/input variants when system variants already solve it.

---

## 12. Quick Layout Spec (copy/paste for implementation)
Use this as default unless a screen has a justified exception.

- Page root: `space-y-6`.
- Major sections: `24px` apart.
- Card internals: `CardHeader` + `CardContent space-y-6`.
- Field block: `space-y-1.5` + helper text + input.
- Footer actions: separate block with `pt-6` or own card and clear breathing room.
- Wizard result inside step: plain block, no extra bordered card by default.
- Timeline statuses: pending/current/done/success/error with icon feedback.

---

## 13. Change Control
If a new screen cannot follow this guide, document the exception in the PR with:
- reason,
- affected component/screen,
- user impact,
- fallback considered.

No undocumented visual exception is allowed.
