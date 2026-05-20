# OpenHRCore ESS Mobile

React Native employee self-service app for OpenHRCore, built with Expo SDK 54 and local demo data.

## Features

- Login gate with demo employee session.
- Home dashboard with quick actions, attendance, leave, pay, task, and notification summaries.
- Leave requests, history, approvals, balances, and inline calendar selection.
- Attendance clock-in/out, WFH flag, correction requests, overtime requests, and charts.
- Payslips, YTD summary, expense claims, and salary advances.
- Profile details, documents, notifications, onboarding tasks, team, and local AI assistant.

The app uses `EssProvider` as the only state boundary so backend API calls can replace seed data later without rewriting screens.

## Run

```bash
npm install
npm run start
```

Then open the app with Expo Go, Android emulator, iOS simulator, or the web target.

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`:

```bash
npm.cmd run start
```

## Check

```bash
npm run lint
npm run export:web
```

`npm run check` runs both commands.

## Demo Login

Use `saki@mercury.co`. The password can be left empty.

## Structure

```text
App.js                   Root shell, login gate, header, tab bar
src/components/          Reusable UI, forms, and chart primitives
src/data/seed.js         Local HR demo data
src/hooks/useClock.js    Live clock hook
src/screens/             Home, leave, attendance, pay, profile, chat
src/store/EssStore.js    Context state, actions, and derived selectors
src/theme.js             Colors, spacing, radius, and shadows
src/utils/dates.js       Date, money, and calendar helpers
```
