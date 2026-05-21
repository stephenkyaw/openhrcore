# OpenHRCore Frontend Design Concept

This document defines the approved UI direction for OpenHRCore. Use it when changing existing pages or creating new frontend features.

## Product Feel

OpenHRCore is an open source HRMS for daily HR operations. The interface should feel practical, trustworthy, and comfortable for repeated use.

The design should not feel like a marketing site, portfolio, or decorative SaaS landing page. It should feel like focused admin software.

## Core Principles

- Prioritize daily workflows: search, review, approve, update, compare, and audit.
- Keep layouts calm and predictable.
- Use neutral surfaces and borders more than shadows.
- Use color sparingly for state, status, and primary actions.
- Keep counts visible, but inline and contextual instead of large dashboard cards.
- Make tables, filters, forms, and side navigation first-class UI.
- Preserve feature behavior and UX; visual redesign should not change workflows.

## Layout System

Use the shared `PageShell` for primary pages.

Page headers should contain:

- Eyebrow: module path or date.
- Title: clear operational page name.
- Description: one concise line explaining the page’s purpose.
- Inline stats: compact text stats below the description.
- Actions: right-aligned page actions.

Do not use separate count cards, summary strips, or right-side metric rails unless the page has a specific analytical reason.

Preferred page structure:

```txt
Topbar
Sidebar
Page header with inline stats
Main work area
```

## Sidebar

The sidebar is functional navigation.

- Expanded width: comfortable enough for labels and counters.
- Collapsed width: icon-only navigation.
- Hamburger in topbar controls show/hide.
- Selected menu state: soft accent background plus left active rail.
- Avoid raised/card-like active states.
- Use native title tooltips for collapsed icons.

## Visual Style

- Background: very light neutral.
- Content panels: white/card surface.
- Borders: subtle and consistent.
- Shadows: minimal, only for overlays and menus.
- Radius: 6-8px.
- Accent: dependable blue.
- Typography: readable, not tiny; tables should be comfortable for daily work.

## Counts And Metrics

Counts should be inline and contextual.

Good:

```txt
24 headcount | 3 approvals | 1 on leave | 4 probation
```

Avoid:

- Four large KPI cards at the top of every page.
- Fully colored metric cards.
- Decorative icons that make the page noisy.

## Tables And Lists

Tables are the main interaction surface for HRMS data.

- Comfortable row height.
- Clear header row.
- Subtle hover state.
- Primary identifying information should be visually stronger.
- Secondary metadata should be muted.
- Filters should sit directly above the table.

## Components

Shared components should follow this concept:

- `Button`: use only four visible variants for new UI: `primary`, `secondary`, `outline`, and `ghost`; use `danger` only for destructive actions. Use `md` for page actions, `sm` for compact row/card actions, and icon sizes only for icon-only table or toolbar actions.
- `TextLink`: use for quiet inline navigation or low-emphasis text actions instead of hand-written hover-only buttons.
- `Input` / `Select` / `Textarea`: 36px control height, bordered card surface, same focus ring, and no custom per-form heights unless the layout requires it.
- `FormField` / `FormGrid` / `FormHeader` / `FormFooter`: use these primitives for all dialogs and sheets so labels, required marks, hints, spacing, and footer actions stay consistent.
- `Card`: flat bordered surface by default.
- `PageShell`: standard page header and inline stats.
- `PageHero`: legacy-compatible wrapper that should visually match `PageShell`.
- `Tabs`: flat underline navigation only. Do not wrap tabs in cards, do not use filled selected pills, and keep count badges small and inline.
- `SideNav`: only for true secondary navigation. It should use a quiet active rail, not a card-like selected state.
- `Table`: comfortable spacing and neutral hover.
- `Dialog` / `Sheet`: use shadow only for overlays.

## Applying To New Pages

When updating another page:

1. Use `PageShell` or the updated `PageHero`.
2. Put counts into inline `stats`.
3. Put primary workflows into the main content area.
4. Keep secondary panels quiet.
5. Do not invent a new page header layout unless the workflow requires it.
6. Use the shared `Tabs` component for module tabs, detail tabs, settings tabs, and subpage navigation.
