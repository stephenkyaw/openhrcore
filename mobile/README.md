# OpenHRCore ESS Mobile

React Native employee self-service app for the OpenHRCore project.

## Scope

- Employee home dashboard
- Leave balances, history, and request submission
- Attendance status with clock-in / clock-out
- Payslip summary and earnings / deductions
- Employee profile

The current implementation uses local demo data that mirrors the existing React frontend. The store is intentionally isolated behind `EssProvider` so API calls can replace the local seed data later without rewriting screens.

## Run

```bash
cd mobile
npm install
npm run start
```

Then open the app with Expo Go, Android emulator, iOS simulator, or the web target.
