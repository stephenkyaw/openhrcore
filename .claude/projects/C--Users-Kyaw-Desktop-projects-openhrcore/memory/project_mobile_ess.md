---
name: project-mobile-ess
description: OpenHRCore ESS React Native mobile app architecture and status
metadata:
  type: project
---

ESS mobile app built with Expo 54 + React Native 0.81.5, no external nav libraries.

**Architecture:**
- `mobile/App.js` — root entry, auth state (loggedIn), tab navigation, TabBar, AppHeader, ToastOverlay
- `mobile/src/screens/LoginScreen.js` — login form with brand, demo credentials
- `mobile/src/screens/HomeScreen.js` — dashboard, metrics, quick actions, leave balances w/ progress bars
- `mobile/src/screens/LeaveScreen.js` — 3-tab (Request/History/Approvals), balance cards, leave form, approval queue
- `mobile/src/screens/AttendanceScreen.js` — live clock, WFH toggle, clock in/out, correction & OT request forms
- `mobile/src/screens/PayScreen.js` — 3-tab (Payslips/Claims/Advances), payslip breakdown, reimbursements
- `mobile/src/screens/ProfileScreen.js` — 4-tab (Details/Docs/Tasks/Team), logout, org chart
- `mobile/src/store/EssStore.js` — React Context with all ESS operations (unchanged)
- `mobile/src/data/seed.js` — mock data: employees, leave, attendance, payroll (unchanged)
- `mobile/src/components/ui.js` — enhanced with ProgressBar, Toggle, Avatar, InfoRow, Empty, Chip, Divider
- `mobile/src/theme.js` — enhanced color tokens (textSecondary, borderLight, info, infoSoft, radius, shadowMd)

**How to apply:** When adding new ESS screens or modifying mobile features, follow the pattern: screen in src/screens/, consume useEss() from EssStore, use ui.js components, tab-based view switching within screens.

**Why:** User (project lead) wants a complete ESS mobile companion to the admin web frontend.
