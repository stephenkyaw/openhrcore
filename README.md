# OpenHRCore

OpenHRCore is an open-source HRMS prototype with an admin web portal and an employee self-service mobile app. Both apps run from local seed data and do not require a backend.

| App | Path | Stack | Purpose |
| --- | --- | --- | --- |
| Admin Web | `frontend/` | React 18, Vite, Tailwind CSS | HR operations portal for employees, attendance, leave, payroll, recruitment, company setup, admin, and AI assistant workflows |
| ESS Mobile | `mobile/` | React Native, Expo SDK 54 | Employee self-service app for leave, time, payslips, documents, profile, team, and AI assistant workflows |

## Quick Start

Run the admin web app:

```bash
cd frontend
npm install
npm run dev
```

Run the mobile app:

```bash
cd mobile
npm install
npm run start
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`, for example `npm.cmd run dev`.

## Validation

Frontend:

```bash
cd frontend
npm run build
```

Mobile:

```bash
cd mobile
npm run lint
npm run export:web
```

The mobile `npm run check` script runs lint and web export.

## Demo Access

- Admin web starts authenticated by default. Sign-out shows the login screen with `anya@mercury.co` prefilled.
- Mobile demo login uses `saki@mercury.co`; leave the password empty.

## Project Structure

```text
frontend/
  src/
    components/       Shared UI, layout, forms, and tweak controls
    config/           Design tokens and theme defaults
    data/             Seed data and web app store
    features/         HRMS feature workspaces
    lib/              Date, lookup, and class-name helpers
    styles/           Tailwind and global design-token CSS

mobile/
  App.js              Expo root shell, login gate, header, tab bar
  src/
    components/       UI, form, and chart primitives
    data/             ESS seed data
    hooks/            Shared hooks
    screens/          Mobile feature screens
    store/            ESS Context store and actions
    utils/            Date, calendar, and money helpers
```

## Current Scope

- Local mock data only.
- In-memory state only; refresh resets demo changes.
- No production authentication, backend API, database, or push notifications yet.
- AI assistant behavior is deterministic and local unless replaced by a backend service.

## Roadmap

- REST API backend with PostgreSQL.
- Real authentication and authorization.
- Backend integration for both frontend and mobile apps.
- Push notifications for approvals, payslips, and document expiry.
- Multi-tenant company/entity support.
- CI checks for frontend build and mobile lint/export.

## License

MIT
