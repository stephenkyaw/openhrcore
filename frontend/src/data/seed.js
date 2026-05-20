export const COMPANIES = [
  { id: 'c1', name: 'Mercury Labs Co., Ltd.', short: 'Mercury TH', registration: 'TH 0105561012345', country: 'TH', currency: 'THB', established: '2018-06-12', employees: 14, status: 'primary', address: '38 Soi Ari 4, Phaholyothin Rd., Phaya Thai, Bangkok 10400', tax_id: '0105561012345', fiscal: 'Jan–Dec' },
  { id: 'c2', name: 'Mercury Labs Pte Ltd', short: 'Mercury SG', registration: 'SG 201932184K', country: 'SG', currency: 'SGD', established: '2022-09-04', employees: 3, status: 'active', address: '160 Robinson Rd, #14-04, SBF Center, Singapore 068914', tax_id: '201932184K', fiscal: 'Apr–Mar' },
  { id: 'c3', name: 'Mercury Holdings Ltd', short: 'Mercury HK', registration: 'HK 2987345', country: 'HK', currency: 'HKD', established: '2024-01-20', employees: 1, status: 'active', address: 'Suite 2901, Two IFC, Central, Hong Kong', tax_id: '2987345', fiscal: 'Apr–Mar' },
  { id: 'c4', name: 'Mercury Labs Vietnam Co.', short: 'Mercury VN', registration: 'VN 0309876543', country: 'VN', currency: 'VND', established: '2026-02-01', employees: 0, status: 'setup', address: 'District 1, Ho Chi Minh City', tax_id: '0309876543', fiscal: 'Jan–Dec' },
];

export const LOCATIONS = [
  { id: 'l1', name: 'Bangkok HQ', city: 'Bangkok', country: 'TH', tz: 'Asia/Bangkok' },
  { id: 'l2', name: 'Singapore', city: 'Singapore', country: 'SG', tz: 'Asia/Singapore' },
  { id: 'l3', name: 'Remote', city: '—', country: '—', tz: 'UTC' },
];

export const DEPARTMENTS = [
  { id: 'd1', name: 'Engineering', parent: null, headcount: 11 },
  { id: 'd2', name: 'Product', parent: null, headcount: 4 },
  { id: 'd3', name: 'Design', parent: null, headcount: 3 },
  { id: 'd4', name: 'People', parent: null, headcount: 3 },
  { id: 'd5', name: 'Operations', parent: null, headcount: 3 },
  { id: 'd6', name: 'Platform', parent: 'd1', headcount: 5 },
  { id: 'd7', name: 'Product Eng', parent: 'd1', headcount: 6 },
];

export const POSITIONS = [
  { id: 'p1', title: 'Software Engineer', grade: 'L3', dept: 'd1' },
  { id: 'p2', title: 'Senior Software Engineer', grade: 'L4', dept: 'd1' },
  { id: 'p3', title: 'Staff Engineer', grade: 'L5', dept: 'd1' },
  { id: 'p4', title: 'Engineering Manager', grade: 'M1', dept: 'd1' },
  { id: 'p5', title: 'Product Manager', grade: 'L4', dept: 'd2' },
  { id: 'p6', title: 'Product Designer', grade: 'L3', dept: 'd3' },
  { id: 'p7', title: 'Design Lead', grade: 'L5', dept: 'd3' },
  { id: 'p8', title: 'People Operations', grade: 'L3', dept: 'd4' },
  { id: 'p9', title: 'HR Business Partner', grade: 'L4', dept: 'd4' },
  { id: 'p10', title: 'Head of People', grade: 'M2', dept: 'd4' },
  { id: 'p11', title: 'Operations Specialist', grade: 'L3', dept: 'd5' },
];

// e013–e016 = May 2026 probation cohort (hero use case for the dashboard)
export const EMPLOYEES = [
  { id: 'e001', code: 'MER-001', first: 'Anya', last: 'Sirichai', email: 'anya@mercury.co', position: 'p10', dept: 'd4', manager: null, loc: 'l1', hire: '2021-03-15', probation_end: null, status: 'active', contract: 'permanent', hue: 25 },
  { id: 'e002', code: 'MER-002', first: 'Marcus', last: 'Tan', email: 'marcus@mercury.co', position: 'p4', dept: 'd1', manager: 'e001', loc: 'l1', hire: '2021-06-01', probation_end: null, status: 'active', contract: 'permanent', hue: 220 },
  { id: 'e003', code: 'MER-003', first: 'Priya', last: 'Raman', email: 'priya@mercury.co', position: 'p7', dept: 'd3', manager: 'e001', loc: 'l2', hire: '2022-01-10', probation_end: null, status: 'active', contract: 'permanent', hue: 320 },
  { id: 'e004', code: 'MER-004', first: 'Jonas', last: 'Weber', email: 'jonas@mercury.co', position: 'p3', dept: 'd1', manager: 'e002', loc: 'l3', hire: '2022-04-22', probation_end: null, status: 'active', contract: 'permanent', hue: 160 },
  { id: 'e005', code: 'MER-005', first: 'Saki', last: 'Watanabe', email: 'saki@mercury.co', position: 'p2', dept: 'd1', manager: 'e002', loc: 'l1', hire: '2023-02-13', probation_end: null, status: 'active', contract: 'permanent', hue: 280 },
  { id: 'e006', code: 'MER-006', first: 'Daniel', last: 'Okafor', email: 'daniel@mercury.co', position: 'p5', dept: 'd2', manager: 'e001', loc: 'l1', hire: '2023-08-07', probation_end: null, status: 'active', contract: 'permanent', hue: 50 },
  { id: 'e007', code: 'MER-007', first: 'Lin', last: 'Chen', email: 'lin@mercury.co', position: 'p2', dept: 'd1', manager: 'e002', loc: 'l2', hire: '2023-11-14', probation_end: null, status: 'active', contract: 'permanent', hue: 195 },
  { id: 'e008', code: 'MER-008', first: 'Marisa', last: 'Halim', email: 'marisa@mercury.co', position: 'p6', dept: 'd3', manager: 'e003', loc: 'l1', hire: '2024-02-19', probation_end: null, status: 'active', contract: 'permanent', hue: 10 },
  { id: 'e009', code: 'MER-009', first: 'Theo', last: 'Marchand', email: 'theo@mercury.co', position: 'p1', dept: 'd1', manager: 'e002', loc: 'l3', hire: '2024-06-03', probation_end: null, status: 'active', contract: 'permanent', hue: 130 },
  { id: 'e010', code: 'MER-010', first: 'Rin', last: 'Hayashi', email: 'rin@mercury.co', position: 'p11', dept: 'd5', manager: 'e001', loc: 'l1', hire: '2024-09-09', probation_end: null, status: 'active', contract: 'permanent', hue: 340 },
  { id: 'e011', code: 'MER-011', first: 'Kofi', last: 'Mensah', email: 'kofi@mercury.co', position: 'p9', dept: 'd4', manager: 'e001', loc: 'l1', hire: '2025-01-20', probation_end: null, status: 'active', contract: 'permanent', hue: 70 },
  { id: 'e012', code: 'MER-012', first: 'Elena', last: 'Rossi', email: 'elena@mercury.co', position: 'p8', dept: 'd4', manager: 'e011', loc: 'l1', hire: '2025-04-14', probation_end: null, status: 'active', contract: 'permanent', hue: 245 },

  { id: 'e013', code: 'MER-013', first: 'Hiro', last: 'Nakamura', email: 'hiro@mercury.co', position: 'p1', dept: 'd1', manager: 'e002', loc: 'l1', hire: '2025-11-18', probation_end: '2026-05-18', status: 'active', contract: 'permanent', hue: 200 },
  { id: 'e014', code: 'MER-014', first: 'Imani', last: 'Adeyemi', email: 'imani@mercury.co', position: 'p6', dept: 'd3', manager: 'e003', loc: 'l2', hire: '2025-11-24', probation_end: '2026-05-24', status: 'active', contract: 'permanent', hue: 15 },
  { id: 'e015', code: 'MER-015', first: 'Felix', last: 'Lindqvist', email: 'felix@mercury.co', position: 'p1', dept: 'd1', manager: 'e002', loc: 'l3', hire: '2025-11-27', probation_end: '2026-05-27', status: 'active', contract: 'permanent', hue: 290 },
  { id: 'e016', code: 'MER-016', first: 'Noor', last: 'Hassan', email: 'noor@mercury.co', position: 'p5', dept: 'd2', manager: 'e001', loc: 'l1', hire: '2025-11-30', probation_end: '2026-05-30', status: 'active', contract: 'permanent', hue: 100 },

  { id: 'e017', code: 'MER-017', first: 'Aditi', last: 'Sharma', email: 'aditi@mercury.co', position: 'p1', dept: 'd1', manager: 'e002', loc: 'l1', hire: '2025-08-04', probation_end: '2026-02-04', status: 'active', contract: 'permanent', hue: 350 },
  { id: 'e018', code: 'MER-018', first: 'Bram', last: 'de Vries', email: 'bram@mercury.co', position: 'p11', dept: 'd5', manager: 'e010', loc: 'l3', hire: '2026-02-09', probation_end: '2026-08-09', status: 'active', contract: 'fixed-term', hue: 175 },
];

export const ROLES = [
  { id: 'r1', name: 'Super Admin', system: true, users: 1, desc: 'Full system access incl. instance settings' },
  { id: 'r2', name: 'HR Admin', system: true, users: 3, desc: 'All people operations across the company' },
  { id: 'r3', name: 'Manager', system: true, users: 6, desc: 'Read team, approve team’s leave, edit team profiles' },
  { id: 'r4', name: 'Employee', system: true, users: 18, desc: 'Self-service: profile, leave, payslips' },
  { id: 'r5', name: 'Finance Reviewer', system: false, users: 2, desc: 'Read payroll, no edit' },
];

export const LEAVE_TYPES = [
  { id: 'lt1', code: 'AL', name: 'Annual leave', color: 165, default_days: 15, accrual: 'monthly', carry_forward: 5, encash: true, attachment: false, advance_notice: 7 },
  { id: 'lt2', code: 'SL', name: 'Sick leave', color: 25, default_days: 10, accrual: 'upfront', carry_forward: 0, encash: false, attachment: true, advance_notice: 0 },
  { id: 'lt3', code: 'PL', name: 'Personal leave', color: 280, default_days: 3, accrual: 'upfront', carry_forward: 0, encash: false, attachment: false, advance_notice: 2 },
  { id: 'lt4', code: 'BL', name: 'Bereavement', color: 220, default_days: 5, accrual: 'as-needed', carry_forward: 0, encash: false, attachment: false, advance_notice: 0 },
  { id: 'lt5', code: 'ML', name: 'Maternity', color: 320, default_days: 98, accrual: 'as-needed', carry_forward: 0, encash: false, attachment: true, advance_notice: 30, gender: 'F' },
  { id: 'lt6', code: 'UL', name: 'Unpaid', color: 0, default_days: 0, accrual: 'as-needed', carry_forward: 0, encash: false, attachment: false, advance_notice: 7 },
];

export const BASE_BALANCES = {
  e001: { lt1: { granted: 15, used: 4, pending: 0 }, lt2: { granted: 10, used: 1, pending: 0 } },
  e002: { lt1: { granted: 15, used: 6, pending: 0 }, lt2: { granted: 10, used: 0, pending: 0 } },
  e003: { lt1: { granted: 15, used: 2, pending: 0 }, lt2: { granted: 10, used: 3, pending: 0 } },
  e004: { lt1: { granted: 15, used: 9, pending: 0 }, lt2: { granted: 10, used: 0, pending: 0 } },
  e005: { lt1: { granted: 15, used: 5, pending: 0 }, lt2: { granted: 10, used: 2, pending: 0 } },
  e006: { lt1: { granted: 15, used: 7, pending: 0 }, lt2: { granted: 10, used: 1, pending: 0 } },
  e007: { lt1: { granted: 15, used: 3, pending: 0 }, lt2: { granted: 10, used: 0, pending: 0 } },
  e008: { lt1: { granted: 15, used: 11, pending: 0 }, lt2: { granted: 10, used: 4, pending: 0 } },
  e009: { lt1: { granted: 12, used: 2, pending: 0 }, lt2: { granted: 10, used: 1, pending: 0 } },
  e010: { lt1: { granted: 11, used: 4, pending: 0 }, lt2: { granted: 10, used: 0, pending: 0 } },
  e011: { lt1: { granted: 8, used: 1, pending: 0 }, lt2: { granted: 10, used: 0, pending: 0 } },
  e012: { lt1: { granted: 6, used: 0, pending: 0 }, lt2: { granted: 10, used: 0, pending: 0 } },
  e013: { lt1: { granted: 4, used: 0, pending: 0 }, lt2: { granted: 10, used: 1, pending: 0 } },
  e014: { lt1: { granted: 4, used: 1, pending: 0 }, lt2: { granted: 10, used: 0, pending: 0 } },
  e015: { lt1: { granted: 4, used: 0, pending: 0 }, lt2: { granted: 10, used: 2, pending: 0 } },
  e016: { lt1: { granted: 4, used: 0, pending: 0 }, lt2: { granted: 10, used: 0, pending: 0 } },
  e017: { lt1: { granted: 6, used: 2, pending: 0 }, lt2: { granted: 10, used: 1, pending: 0 } },
  e018: { lt1: { granted: 2, used: 0, pending: 0 }, lt2: { granted: 10, used: 0, pending: 0 } },
};

export const INITIAL_REQUESTS = [
  { id: 'lr001', emp: 'e004', type: 'lt1', from: '2026-05-22', to: '2026-05-26', days: 3, reason: 'Family wedding in Lyon', status: 'pending', submitted: '2026-05-12T09:14:00Z', approver: 'e002' },
  { id: 'lr002', emp: 'e008', type: 'lt2', from: '2026-05-19', to: '2026-05-20', days: 2, reason: 'Flu, doctor’s note attached', status: 'pending', submitted: '2026-05-19T07:48:00Z', approver: 'e003', attachment: 'med-cert-may19.pdf' },
  { id: 'lr003', emp: 'e009', type: 'lt1', from: '2026-06-08', to: '2026-06-12', days: 5, reason: 'Annual trip, planned long in advance', status: 'pending', submitted: '2026-05-15T16:02:00Z', approver: 'e002' },
  { id: 'lr004', emp: 'e013', type: 'lt3', from: '2026-05-21', to: '2026-05-21', days: 1, reason: 'Apartment move-in', status: 'pending', submitted: '2026-05-18T11:30:00Z', approver: 'e002' },
  { id: 'lr005', emp: 'e005', type: 'lt1', from: '2026-04-13', to: '2026-04-17', days: 5, reason: 'Songkran holiday extension', status: 'approved', submitted: '2026-03-30T10:00:00Z', approver: 'e002', decided: '2026-03-31T12:30:00Z' },
  { id: 'lr006', emp: 'e006', type: 'lt1', from: '2026-04-06', to: '2026-04-10', days: 5, reason: 'Personal trip', status: 'approved', submitted: '2026-03-22T14:00:00Z', approver: 'e001', decided: '2026-03-23T09:00:00Z' },
  { id: 'lr007', emp: 'e007', type: 'lt2', from: '2026-05-05', to: '2026-05-06', days: 2, reason: 'Migraine', status: 'approved', submitted: '2026-05-05T08:11:00Z', approver: 'e002', decided: '2026-05-05T09:00:00Z' },
  { id: 'lr008', emp: 'e015', type: 'lt3', from: '2026-04-01', to: '2026-04-01', days: 1, reason: 'Government appointment', status: 'rejected', submitted: '2026-03-28T10:00:00Z', approver: 'e002', decided: '2026-03-29T11:00:00Z', reject_reason: 'Quarter-close blackout — please reschedule' },
];

export const HOLIDAYS = [
  { date: '2026-01-01', name: 'New Year’s Day', country: 'TH' },
  { date: '2026-02-26', name: 'Makha Bucha Day', country: 'TH' },
  { date: '2026-04-06', name: 'Chakri Day', country: 'TH' },
  { date: '2026-04-13', name: 'Songkran Day 1', country: 'TH' },
  { date: '2026-04-14', name: 'Songkran Day 2', country: 'TH' },
  { date: '2026-04-15', name: 'Songkran Day 3', country: 'TH' },
  { date: '2026-05-01', name: 'Labour Day', country: 'TH' },
  { date: '2026-05-11', name: 'Coronation Day', country: 'TH' },
  { date: '2026-07-28', name: 'King’s Birthday', country: 'TH' },
  { date: '2026-08-12', name: 'Mother’s Day', country: 'TH' },
  { date: '2026-10-13', name: 'Bhumibol Memorial', country: 'TH' },
  { date: '2026-12-05', name: 'Father’s Day', country: 'TH' },
  { date: '2026-12-31', name: 'New Year’s Eve', country: 'TH' },
];

export const AUDIT_LOG = [
  { id: 'a001', ts: '2026-05-19T08:42:11Z', actor: 'e001', action: 'leave.approve', entity: 'leave_request:lr007', meta: { from: '2026-05-05', to: '2026-05-06' } },
  { id: 'a002', ts: '2026-05-19T08:30:02Z', actor: 'e008', action: 'leave.create', entity: 'leave_request:lr002', meta: { type: 'SL', days: 2 } },
  { id: 'a003', ts: '2026-05-18T17:11:55Z', actor: 'e001', action: 'employee.update', entity: 'employee:e014', meta: { field: 'manager', before: 'e002', after: 'e003' } },
  { id: 'a004', ts: '2026-05-18T14:02:03Z', actor: 'e011', action: 'role.assign', entity: 'user:e012', meta: { role: 'HR Admin' } },
  { id: 'a005', ts: '2026-05-18T11:30:44Z', actor: 'e013', action: 'leave.create', entity: 'leave_request:lr004', meta: { type: 'PL', days: 1 } },
  { id: 'a006', ts: '2026-05-18T09:55:21Z', actor: 'agent:claude', action: 'employee.list', entity: 'query', meta: { filter: 'probation_end:2026-05', count: 4 } },
  { id: 'a007', ts: '2026-05-17T16:20:09Z', actor: 'e001', action: 'holiday.create', entity: 'holiday:h2026-08-12', meta: { name: 'Mother’s Day' } },
  { id: 'a008', ts: '2026-05-17T10:05:55Z', actor: 'e002', action: 'leave.approve', entity: 'leave_request:lr006', meta: {} },
  { id: 'a009', ts: '2026-05-16T19:18:30Z', actor: 'e001', action: 'department.create', entity: 'department:d7', meta: { name: 'Product Eng' } },
  { id: 'a010', ts: '2026-05-16T12:00:00Z', actor: 'system', action: 'leave.accrual', entity: 'batch', meta: { employees: 18, days_granted: 22 } },
];
