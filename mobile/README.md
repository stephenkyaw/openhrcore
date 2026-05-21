# OpenHRCore ESS Mobile

Employee Self-Service mobile app for OpenHRCore. Built with **React Native**, **Expo SDK 54**, and **TypeScript**. Runs on iOS, Android, and web from a single codebase.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18 or 20 LTS | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Bundled with Node |
| Expo Go (phone) | Latest | [iOS](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| Android Studio | Latest | For Android emulator |
| Xcode 15+ | Mac only | For iOS simulator |

No global Expo CLI install is required — `npx expo` works out of the box.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
```

The terminal shows a QR code and a menu:

```
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web browser
```

Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS) to open on a real device.

---

## Running on Each Platform

### Physical device (iOS or Android)

1. Install **Expo Go** from the App Store / Google Play
2. Run `npm start`
3. Scan the QR code — the app opens in Expo Go

> Make sure your phone and computer are on the **same Wi-Fi network**.

### Android emulator

```bash
# Open an AVD from Android Studio first, then:
npm run android
```

Or press **`a`** in the running dev server terminal.

### iOS simulator (Mac only)

```bash
npm run ios
```

Or press **`i`** in the running dev server terminal. Requires Xcode 15+ installed.

### Web browser

```bash
npm run web
```

Or press **`w`** in the running dev server terminal. Opens at `http://localhost:8081`.

---

## Demo Login

| Field | Value |
|-------|-------|
| Email | `saki@mercury.co` |
| Password | *(leave empty)* |

The app uses local seed data only — no backend is needed. You are logged in as **Saki Watanabe**, Senior Software Engineer.

---

## AI Assistant

The **AI** tab has an HR assistant powered by a local rule engine by default (no API key needed).

To enable real Claude AI responses:

1. Get an API key at [console.anthropic.com](https://console.anthropic.com)
2. Open `src/config.ts`
3. Set `ANTHROPIC_API_KEY = 'sk-ant-...'`

```ts
// src/config.ts
export const ANTHROPIC_API_KEY = 'sk-ant-your-key-here';
export const AI_MODEL = 'claude-haiku-4-5-20251001';
export const AI_MAX_TOKENS = 512;
```

---

## TypeScript & Code Quality

```bash
# Type-check (no emit)
npm run typecheck

# Lint
npm run lint

# Type-check + lint + build web export (full CI check)
npm run check
```

`npm run check` is the single command to run before committing. It must pass with zero errors.

The project uses **TypeScript 6** with `strict: true`. All types live in `src/types/index.ts`.

---

## Building for Production

### Web (static export)

```bash
npm run export:web
```

Output goes to `dist/`. Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

### Native (iOS / Android)

Expo managed workflow uses **EAS Build** (Expo Application Services) for native builds.

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure your project (first time only)
eas build:configure

# Build for Android (APK / AAB)
eas build --platform android

# Build for iOS (IPA)
eas build --platform ios

# Build for both
eas build --platform all
```

> EAS Build requires a free Expo account at [expo.dev](https://expo.dev). iOS builds require an Apple Developer account ($99/year).

### Local native build (without EAS)

```bash
# Generate native android/ and ios/ folders
npx expo prebuild

# Build Android debug APK locally
cd android && ./gradlew assembleDebug

# Open in Xcode for iOS
cd ios && xed .
```

---

## Project Structure

```
mobile/
├── App.tsx                      Root shell — login gate, header, tab bar
├── app.json                     Expo app config (name, slug, icons)
├── tsconfig.json                TypeScript config (extends expo/tsconfig.base, strict)
├── babel.config.js              Babel config (babel-preset-expo)
├── eslint.config.js             ESLint flat config with TypeScript rules
└── src/
    ├── types/
    │   └── index.ts             All shared interfaces and union types
    ├── theme.ts                 Design tokens: colors, font, spacing, radius, shadows
    ├── config.ts                AI model config and API key
    ├── data/
    │   └── seed.ts              Local mock data (employees, payslips, attendance, etc.)
    ├── hooks/
    │   └── useClock.ts          Live clock hook (1-second interval)
    ├── utils/
    │   └── dates.ts             Date formatting, money, calendar grid helpers
    ├── store/
    │   └── EssStore.tsx         React Context — all state, actions, and derived selectors
    ├── components/
    │   ├── ui/                  Design system primitives
    │   │   ├── Alert.tsx        AlertBanner — info/warning/danger/success banner
    │   │   ├── Avatar.tsx       Initials avatar circle
    │   │   ├── Badge.tsx        Toned status pill
    │   │   ├── Button.tsx       Primary/secondary/ghost/danger/success button
    │   │   ├── Card.tsx         Surface card with optional press and accent border
    │   │   ├── Chip.tsx         Segmented tab selector chip
    │   │   ├── Divider.tsx      Hairline rule with optional label
    │   │   ├── Empty.tsx        Empty-state placeholder
    │   │   ├── IconButton.tsx   Icon-only pressable
    │   │   ├── InfoRow.tsx      Label + value row (used in profile details)
    │   │   ├── ListItem.tsx     Icon + title + subtitle + right slot
    │   │   ├── Metric.tsx       Big number KPI card
    │   │   ├── ProgressBar.tsx  Horizontal fill bar
    │   │   ├── Row.tsx          Flex row wrapper
    │   │   ├── Screen.tsx       Scroll-aware screen container
    │   │   ├── SectionTitle.tsx Uppercase muted section label
    │   │   ├── StatRow.tsx      Horizontal stat columns with dividers
    │   │   ├── StatusDot.tsx    Colored status indicator dot
    │   │   ├── Tag.tsx          Small colored tag pill
    │   │   ├── Toggle.tsx       iOS-style toggle switch
    │   │   └── index.ts         Barrel — re-exports everything
    │   ├── charts/
    │   │   ├── WeeklyAttendanceChart.tsx  Mon–Fri vertical bar chart
    │   │   ├── MonthlyPayChart.tsx        Monthly net pay horizontal bars
    │   │   └── index.ts
    │   └── forms/
    │       ├── FormField.tsx        Label + input + error wrapper
    │       ├── TextFieldInput.tsx   Styled TextInput
    │       ├── DateFieldButton.tsx  Pressable date display field
    │       ├── InlineDatePicker.tsx Full inline calendar grid
    │       ├── SegmentedControl.tsx Segmented button control
    │       └── index.ts
    └── screens/
        ├── HomeScreen.tsx        Dashboard — hero card, quick actions, KPIs, summaries
        ├── LoginScreen.tsx       Login form with demo notice
        ├── LeaveScreen.tsx       Leave request, history, and approvals
        ├── AttendanceScreen.tsx  Clock in/out, corrections, overtime, charts
        ├── PayScreen.tsx         Payslips, YTD, claims, salary advances
        ├── ProfileScreen.tsx     Profile info, docs, tasks, team, notifications
        └── ChatScreen.tsx        AI HR assistant (local engine + optional Claude API)
```

---

## Architecture Notes

### State management

All state lives in `src/store/EssStore.tsx` via React Context. The `EssProvider` wraps the entire authenticated shell. Every screen calls `useEss()` to read state and trigger actions.

The `EssContextValue` interface in `EssStore.tsx` documents every field and action — it is the single contract between state and UI.

### Replacing mock data with a real API

1. Open `src/store/EssStore.tsx`
2. Replace `useState(seedData)` initialisers with `useQuery` / `useEffect` API calls
3. Replace action callbacks (`submitLeave`, `clockIn`, etc.) with `fetch`/`axios` calls
4. Screens require **zero changes** — they only call `useEss()`

### Navigation

Navigation is intentionally minimal: a single `tab` state string in `App.tsx` drives which screen renders. There is no React Navigation dependency. Sub-views within each screen use a local `view` state and `Chip` selectors.

### Design system

All visual tokens are in `src/theme.ts`:

| Token | Examples |
|-------|---------|
| `colors` | `primary`, `success`, `warning`, `danger`, `muted`, `border` |
| `font` | `xs` (11) → `xxxl` (34) |
| `spacing` | `xs` (4) → `xxl` (32) |
| `radius` | `xs` (4) → `full` (999) |
| `shadow` / `shadowMd` / `shadowLg` | Elevation presets |
| `hairline` | `StyleSheet.hairlineWidth` (0.5px on retina) |

Import from `'../theme'` in any file.

---

## Troubleshooting

**`npm start` fails with "Unable to resolve module"**
```bash
# Clear Metro bundler cache
npx expo start --clear
```

**QR code doesn't open on device**
- Confirm phone and computer are on the same Wi-Fi
- Try tunnel mode: `npx expo start --tunnel` (requires `@expo/ngrok`)

**TypeScript errors after pulling changes**
```bash
npm install          # update packages
npm run typecheck    # see what broke
```

**Android emulator not detected**
- Open Android Studio → Device Manager → start a virtual device
- Then run `npm run android`

**Expo Go shows "Something went wrong"**
- Check the Metro terminal for the actual error
- Run `npx expo start --clear` to reset the cache
