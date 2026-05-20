# OpenHRCore Admin Web

React admin portal for OpenHRCore. It is a Vite + Tailwind single-page app backed by local seed data, so it can run without a backend.

## Features

- Dashboard metrics, activity, payroll hints, leave summaries, and AI shortcuts.
- Employee directory, lifecycle actions, org chart, and company structure.
- Attendance, leave, payroll, recruitment, admin, and profile workspaces.
- Local command palette and HR assistant powered by deterministic intent handlers.
- Theme, density, accent, and agent-placement tweaks stored in local UI state.

## Run

```bash
npm install
npm run dev
```

The dev server defaults to http://localhost:5173.

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`:

```bash
npm.cmd run dev
```

## Check

```bash
npm run build
```

`npm run check` also runs the production build.

## Structure

```text
src/
  App.jsx                 Shell, auth gate, theme tweaks, command palette
  Router.jsx              Feature routing by local view state
  components/             Shared UI, forms, layout, tweak controls
  config/theme.js         Accent and tweak defaults
  data/                   Seed data and React Context store
  features/               Admin, agent, attendance, company, dashboard, etc.
  lib/                    Shared date, lookup, and class-name helpers
  styles/globals.css      Tailwind base and design tokens
```

## Notes

- The app mutates local in-memory seed data for demo workflows.
- `@/*` resolves to `src/*`.
- `uploads/openhrcore-feature-spec.pdf` is kept as a product reference.
