# OpenHRCore

**Open Source HR Management System**

OpenHRCore is a modular, open-source HRMS built for modern teams. It currently ships two applications that work together as a complete HR platform:

| App | Description | Stack |
|-----|-------------|-------|
| **Admin Web** | HR admin portal — employees, payroll, recruitment, AI agent | React 18 · Vite · Tailwind CSS |
| **ESS Mobile** | Employee Self Service app for iOS & Android | React Native · Expo SDK 54 |

Both applications run on mock/seed data — no backend is required to run them.

---

## Admin Web (`frontend/`)

A full-featured HR admin portal built with React and Tailwind CSS.

### Features

- **Dashboard** — Overview metrics, quick stats, activity summary
- **Employees** — Employee list, profiles, search and filter
- **Attendance** — Attendance records, clock-in/out management
- **Leave** — Leave requests, approval workflow, balance tracking
- **Payroll** — Payslip management, earnings & deductions
- **Recruitment** — Job openings, candidate pipeline, application tracking
- **Org Chart** — Visual organisation hierarchy
- **Company** — Company settings and configuration
- **AI Agent** — Natural language HR assistant with command palette and intent recognition
- **My Account** — User profile settings
- **Admin** — System administration panel

### Tech stack

- React 18, Vite
- Tailwind CSS 3
- Mock data via `src/data/seed.js` and `src/data/seed-extended.js`
- Global state via `src/data/store.jsx` (React Context)

### Project structure

```
frontend/
├── src/
│   ├── App.jsx
│   ├── Router.jsx
│   ├── main.jsx
│   ├── components/
│   │   ├── ui/index.jsx          # Shared UI components
│   │   ├── forms/                # Form components and dialogs
│   │   └── layout/               # Sidebar, Topbar
│   ├── features/
│   │   ├── auth/Login.jsx
│   │   ├── dashboard/Dashboard.jsx
│   │   ├── employees/Employees.jsx
│   │   ├── attendance/Attendance.jsx
│   │   ├── leave/Leave.jsx
│   │   ├── payroll/Payroll.jsx
│   │   ├── recruitment/Recruitment.jsx
│   │   ├── org/Org.jsx
│   │   ├── company/Company.jsx
│   │   ├── admin/Admin.jsx
│   │   ├── profile/MyAccount.jsx
│   │   └── agent/                # AI agent — panel, workspace, command palette
│   ├── data/
│   │   ├── seed.js               # Core mock HR data
│   │   ├── seed-extended.js      # Extended mock data
│   │   └── store.jsx             # Context API state store
│   ├── config/theme.js           # Design tokens
│   └── lib/                      # Utilities (dates, lookups, cn)
├── package.json
└── vite.config.js
```

### Getting started

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**.

---

## ESS Mobile (`mobile/`)

A React Native ESS (Employee Self Service) app for employees to manage their own HR data on the go.

### Features

| Screen | Sub-tabs | Key features |
|--------|----------|-------------|
| **Home** | — | Greeting hero, quick-action shortcuts, attendance & leave metrics, weekly bar chart, upcoming leave, YTD payslip hint, unread notifications |
| **Leave** | Request · History · Approvals | Leave balance cards with progress bars, inline calendar date picker, form validation, approval workflow |
| **Time** | Clock · History · Requests | Live clock (HH:MM:SS), clock in/out, WFH toggle, weekly attendance chart, monthly summary, correction & overtime request forms |
| **Pay** | Payslips · Claims · Advances | YTD gross/tax/net summary, monthly trend chart, full payslip detail (earnings + deductions), expense claims, salary advances |
| **Me** | Details · Docs · Tasks · Team | Employee info, notifications, document upload & expiry tracking, onboarding task checklist, org chart (manager + direct reports) |
| **AI** | — | AI assistant using live store data, attach files UI, voice recording UI, quick-reply chips |

### Tech stack

- React Native 0.81.5, Expo SDK 54 (managed workflow)
- React Context API (`EssProvider`) for all state and actions
- `@expo/vector-icons` (Ionicons), `react-native-safe-area-context`
- No third-party navigation — custom floating tab bar + chip-based sub-navigation
- Mock data only (`src/data/seed.js`) — no backend required

### Project structure

```
mobile/
├── App.js                        # Root — login gate, tab bar, header
├── src/
│   ├── config.js                 # AI config (Anthropic API key)
│   ├── theme.js                  # Colors, spacing, radius, shadow tokens
│   ├── data/seed.js              # All mock HR data
│   ├── store/EssStore.js         # Context — state, actions, computed values
│   ├── hooks/useClock.js         # Live clock hook (1s interval)
│   ├── utils/dates.js            # Date helpers, calendar grid
│   ├── components/
│   │   ├── ui.js                 # Card, Button, Badge, Metric, Toggle, Avatar…
│   │   ├── charts.js             # WeeklyAttendanceChart, MonthlyPayChart
│   │   └── forms.js              # FormField, InlineDatePicker, DateFieldButton
│   └── screens/
│       ├── LoginScreen.js
│       ├── HomeScreen.js
│       ├── LeaveScreen.js
│       ├── AttendanceScreen.js
│       ├── PayScreen.js
│       ├── ProfileScreen.js
│       └── ChatScreen.js
├── package.json
└── app.json
```

### Getting started

Install [Expo Go](https://expo.dev/go) on your phone, or set up an Android/iOS emulator.

```bash
cd mobile
npm install
npm run start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

**Demo login** — the email field is pre-filled as `saki@mercury.co`. Leave the password empty and tap **Sign in**.

### AI Chat

The chat screen uses a keyword-regex engine (`buildReply` in `ChatScreen.js`) that answers questions from live store data — no API calls needed. It covers leave balances, payslips, YTD earnings, attendance, approvals, documents, tasks, and more.

To connect to real Claude AI, add your key to `src/config.js`:

```js
export const ANTHROPIC_API_KEY = 'sk-ant-...';
```

### Mock data

Seeded for **Saki Watanabe** (Senior Software Engineer, `e005`):

- 7 employees across an org hierarchy with 2 direct reports
- 4 leave types: Annual (15d), Sick (10d), Personal (3d), Birthday (1d)
- 15 attendance records spanning 4 weeks
- 6 payslips (Nov 2025 – Apr 2026), Feb 2026 includes annual performance bonus
- Expense claims, salary advances, documents, onboarding tasks, notifications
- 3 pending leave approvals from manager and direct reports

---

## Roadmap

- [ ] REST API backend (FastAPI + PostgreSQL)
- [ ] Real authentication (JWT / Keycloak)
- [ ] Connect ESS mobile to backend API
- [ ] Connect admin web to backend API
- [ ] Push notifications
- [ ] Multi-tenancy

---

## License

MIT
