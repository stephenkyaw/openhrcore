export const employees = [
  { id: 'e001', code: 'MER-001', first: 'Anya', last: 'Sirichai', email: 'anya@mercury.co', phone: '+66 82 100 0101', position: 'Head of People', dept: 'People', manager: null, location: 'Bangkok HQ', hire: '2021-03-15', status: 'active' },
  { id: 'e002', code: 'MER-002', first: 'Marcus', last: 'Tan', email: 'marcus@mercury.co', phone: '+66 82 100 0102', position: 'Engineering Manager', dept: 'Engineering', manager: 'e001', location: 'Bangkok HQ', hire: '2021-06-01', status: 'active' },
  { id: 'e005', code: 'MER-005', first: 'Saki', last: 'Watanabe', email: 'saki@mercury.co', phone: '+66 82 100 0105', position: 'Senior Software Engineer', dept: 'Engineering', manager: 'e002', location: 'Bangkok HQ', hire: '2023-02-13', status: 'active' },
  { id: 'e006', code: 'MER-006', first: 'Priya', last: 'Nair', email: 'priya@mercury.co', phone: '+66 82 100 0106', position: 'Software Engineer', dept: 'Engineering', manager: 'e005', location: 'Bangkok HQ', hire: '2024-08-01', status: 'active' },
  { id: 'e007', code: 'MER-007', first: 'Leo', last: 'Tanaka', email: 'leo@mercury.co', phone: '+66 82 100 0107', position: 'Junior Software Engineer', dept: 'Engineering', manager: 'e005', location: 'Remote', hire: '2025-01-15', status: 'active' },
];

export const currentUserId = 'e005';

export const leaveTypes = [
  { id: 'lt1', code: 'AL', name: 'Annual leave', requiresAttachment: false },
  { id: 'lt2', code: 'SL', name: 'Sick leave', requiresAttachment: true },
  { id: 'lt3', code: 'PL', name: 'Personal leave', requiresAttachment: false },
  { id: 'lt4', code: 'BL', name: 'Birthday leave', requiresAttachment: false },
];

export const leaveBalances = {
  e005: {
    lt1: { granted: 15, used: 5, pending: 0 },
    lt2: { granted: 10, used: 2, pending: 0 },
    lt3: { granted: 3, used: 0, pending: 1 },
    lt4: { granted: 1, used: 0, pending: 0 },
  },
};

export const leaveRequests = [
  // Pending approvals for Saki (approver = e005)
  { id: 'lr001', emp: 'e002', type: 'lt1', from: '2026-05-22', to: '2026-05-26', days: 3, reason: 'Family wedding in Lyon', status: 'pending', submitted: '2026-05-12T09:14:00Z', approver: 'e005' },
  { id: 'lr010', emp: 'e006', type: 'lt2', from: '2026-05-21', to: '2026-05-22', days: 2, reason: 'Flu recovery, doctor note attached', status: 'pending', submitted: '2026-05-20T08:30:00Z', approver: 'e005' },
  { id: 'lr011', emp: 'e007', type: 'lt1', from: '2026-06-16', to: '2026-06-17', days: 2, reason: 'Family trip to Chiang Mai', status: 'pending', submitted: '2026-05-18T14:00:00Z', approver: 'e005' },

  // Saki's own leave requests
  { id: 'lr005', emp: 'e005', type: 'lt1', from: '2026-04-13', to: '2026-04-17', days: 5, reason: 'Songkran holiday extension', status: 'approved', submitted: '2026-03-30T10:00:00Z', approver: 'e002', decided: '2026-03-31T12:30:00Z' },
  { id: 'lr009', emp: 'e005', type: 'lt3', from: '2026-06-05', to: '2026-06-05', days: 1, reason: 'Bank appointment', status: 'pending', submitted: '2026-05-19T09:20:00Z', approver: 'e002' },
  { id: 'lr006', emp: 'e005', type: 'lt2', from: '2026-03-17', to: '2026-03-18', days: 2, reason: 'Seasonal flu', status: 'approved', submitted: '2026-03-17T07:00:00Z', approver: 'e002', decided: '2026-03-17T08:30:00Z' },
  { id: 'lr007', emp: 'e005', type: 'lt1', from: '2025-12-22', to: '2025-12-31', days: 8, reason: 'Christmas and New Year holidays', status: 'rejected', submitted: '2025-12-01T09:00:00Z', approver: 'e002', decided: '2025-12-05T10:00:00Z' },
  { id: 'lr008', emp: 'e005', type: 'lt1', from: '2025-10-20', to: '2025-10-22', days: 3, reason: 'Chulalongkorn Day long weekend', status: 'approved', submitted: '2025-09-28T10:00:00Z', approver: 'e002', decided: '2025-09-30T09:00:00Z' },
];

export const attendance = [
  // Current week (May 18–22, 2026 — Wed May 20 is today)
  { id: 'att-2026-05-19-e005', emp: 'e005', date: '2026-05-19', in: '09:14', out: '18:29', hours: 9.3, status: 'present', source: 'kiosk', wfh: false },
  { id: 'att-2026-05-18-e005', emp: 'e005', date: '2026-05-18', in: '08:58', out: '17:52', hours: 8.9, status: 'present', source: 'web', wfh: true },

  // Previous week (May 11–15)
  { id: 'att-2026-05-15-e005', emp: 'e005', date: '2026-05-15', in: '09:21', out: '18:13', hours: 8.9, status: 'late', source: 'kiosk', wfh: false },
  { id: 'att-2026-05-14-e005', emp: 'e005', date: '2026-05-14', in: '09:03', out: '18:01', hours: 9.0, status: 'present', source: 'kiosk', wfh: false },
  { id: 'att-2026-05-13-e005', emp: 'e005', date: '2026-05-13', in: '08:50', out: '17:45', hours: 8.9, status: 'present', source: 'web', wfh: true },
  { id: 'att-2026-05-12-e005', emp: 'e005', date: '2026-05-12', in: '09:02', out: '18:08', hours: 9.1, status: 'present', source: 'kiosk', wfh: false },
  { id: 'att-2026-05-11-e005', emp: 'e005', date: '2026-05-11', in: '09:00', out: '17:50', hours: 8.8, status: 'present', source: 'kiosk', wfh: false },

  // Week of May 4–8
  { id: 'att-2026-05-08-e005', emp: 'e005', date: '2026-05-08', in: '09:10', out: '17:31', hours: 8.4, status: 'late', source: 'kiosk', wfh: false },
  { id: 'att-2026-05-07-e005', emp: 'e005', date: '2026-05-07', in: null, out: null, hours: 0, status: 'absent', source: null, wfh: false },
  { id: 'att-2026-05-06-e005', emp: 'e005', date: '2026-05-06', in: '08:45', out: '18:10', hours: 9.4, status: 'present', source: 'web', wfh: true },
  { id: 'att-2026-05-05-e005', emp: 'e005', date: '2026-05-05', in: '09:01', out: '18:02', hours: 9.0, status: 'present', source: 'kiosk', wfh: false },
  { id: 'att-2026-05-04-e005', emp: 'e005', date: '2026-05-04', in: '09:05', out: '17:55', hours: 8.8, status: 'present', source: 'kiosk', wfh: false },

  // Week of Apr 28–May 1
  { id: 'att-2026-04-30-e005', emp: 'e005', date: '2026-04-30', in: '08:52', out: '17:58', hours: 9.1, status: 'present', source: 'web', wfh: true },
  { id: 'att-2026-04-29-e005', emp: 'e005', date: '2026-04-29', in: '09:08', out: '18:05', hours: 9.0, status: 'present', source: 'kiosk', wfh: false },
  { id: 'att-2026-04-28-e005', emp: 'e005', date: '2026-04-28', in: '09:00', out: '18:03', hours: 9.1, status: 'present', source: 'kiosk', wfh: false },
];

export const payslips = [
  {
    id: 'ps-2026-04-e005',
    emp: 'e005',
    period: 'April 2026',
    payDate: '2026-05-01',
    status: 'paid',
    currency: 'THB',
    earnings: [
      { label: 'Basic salary', amount: 105000 },
      { label: 'Housing allowance', amount: 15750 },
      { label: 'Transport allowance', amount: 2500 },
    ],
    deductions: [
      { label: 'Personal income tax', amount: 12325 },
      { label: 'Social security', amount: 750 },
      { label: 'Provident fund', amount: 5250 },
    ],
  },
  {
    id: 'ps-2026-03-e005',
    emp: 'e005',
    period: 'March 2026',
    payDate: '2026-04-01',
    status: 'paid',
    currency: 'THB',
    earnings: [
      { label: 'Basic salary', amount: 105000 },
      { label: 'Housing allowance', amount: 15750 },
      { label: 'Transport allowance', amount: 2500 },
    ],
    deductions: [
      { label: 'Personal income tax', amount: 12325 },
      { label: 'Social security', amount: 750 },
      { label: 'Provident fund', amount: 5250 },
    ],
  },
  {
    id: 'ps-2026-02-e005',
    emp: 'e005',
    period: 'February 2026',
    payDate: '2026-03-01',
    status: 'paid',
    currency: 'THB',
    earnings: [
      { label: 'Basic salary', amount: 105000 },
      { label: 'Housing allowance', amount: 15750 },
      { label: 'Transport allowance', amount: 2500 },
      { label: 'Annual performance bonus', amount: 52500 },
    ],
    deductions: [
      { label: 'Personal income tax', amount: 20825 },
      { label: 'Social security', amount: 750 },
      { label: 'Provident fund', amount: 5250 },
    ],
  },
  {
    id: 'ps-2026-01-e005',
    emp: 'e005',
    period: 'January 2026',
    payDate: '2026-02-01',
    status: 'paid',
    currency: 'THB',
    earnings: [
      { label: 'Basic salary', amount: 105000 },
      { label: 'Housing allowance', amount: 15750 },
      { label: 'Transport allowance', amount: 2500 },
    ],
    deductions: [
      { label: 'Personal income tax', amount: 12325 },
      { label: 'Social security', amount: 750 },
      { label: 'Provident fund', amount: 5250 },
    ],
  },
  {
    id: 'ps-2025-12-e005',
    emp: 'e005',
    period: 'December 2025',
    payDate: '2026-01-01',
    status: 'paid',
    currency: 'THB',
    earnings: [
      { label: 'Basic salary', amount: 105000 },
      { label: 'Housing allowance', amount: 15750 },
      { label: 'Transport allowance', amount: 2500 },
      { label: 'Year-end incentive', amount: 10500 },
    ],
    deductions: [
      { label: 'Personal income tax', amount: 13825 },
      { label: 'Social security', amount: 750 },
      { label: 'Provident fund', amount: 5250 },
    ],
  },
  {
    id: 'ps-2025-11-e005',
    emp: 'e005',
    period: 'November 2025',
    payDate: '2025-12-01',
    status: 'paid',
    currency: 'THB',
    earnings: [
      { label: 'Basic salary', amount: 105000 },
      { label: 'Housing allowance', amount: 15750 },
      { label: 'Transport allowance', amount: 2500 },
    ],
    deductions: [
      { label: 'Personal income tax', amount: 12325 },
      { label: 'Social security', amount: 750 },
      { label: 'Provident fund', amount: 5250 },
    ],
  },
];

export const documents = [
  { id: 'doc1', emp: 'e005', name: 'Employment contract', category: 'Contract', status: 'verified', uploaded: '2023-02-13', expires: null },
  { id: 'doc2', emp: 'e005', name: 'National ID', category: 'Identity', status: 'verified', uploaded: '2025-01-04', expires: '2030-01-04' },
  { id: 'doc3', emp: 'e005', name: 'AWS Solutions Architect', category: 'Certificate', status: 'expiring', uploaded: '2024-11-12', expires: '2026-07-12' },
  { id: 'doc4', emp: 'e005', name: 'Work permit', category: 'Legal', status: 'verified', uploaded: '2023-02-13', expires: '2027-02-12' },
];

export const correctionRequests = [
  { id: 'cr1', emp: 'e005', date: '2026-05-15', requestedIn: '09:02', requestedOut: '18:13', reason: 'Forgot to tap badge on arrival', status: 'pending', approver: 'e002' },
  { id: 'cr2', emp: 'e005', date: '2026-05-07', requestedIn: '09:00', requestedOut: '17:30', reason: 'Sick day — missed clock-out', status: 'approved', approver: 'e002' },
];

export const overtimeRequests = [
  { id: 'ot1', emp: 'e005', date: '2026-05-18', hours: 2, reason: 'Release support — v2.4 hotfix', status: 'approved', approver: 'e002' },
  { id: 'ot2', emp: 'e005', date: '2026-05-06', hours: 3, reason: 'Sprint deadline — feature freeze', status: 'pending', approver: 'e002' },
];

export const reimbursements = [
  { id: 'rb1', emp: 'e005', category: 'Transport', amount: 850, currency: 'THB', reason: 'Client visit taxi — Mercury Tower', status: 'pending', submitted: '2026-05-17' },
  { id: 'rb2', emp: 'e005', category: 'Learning', amount: 2400, currency: 'THB', reason: 'React Native workshop ticket', status: 'approved', submitted: '2026-04-20' },
  { id: 'rb3', emp: 'e005', category: 'Meals', amount: 580, currency: 'THB', reason: 'Team lunch during sprint review', status: 'approved', submitted: '2026-04-05' },
  { id: 'rb4', emp: 'e005', category: 'Equipment', amount: 3200, currency: 'THB', reason: 'Mechanical keyboard for remote work', status: 'rejected', submitted: '2026-03-15' },
];

export const salaryAdvances = [
  { id: 'sa1', emp: 'e005', amount: 12000, currency: 'THB', reason: 'Emergency home repair — water damage', status: 'rejected', submitted: '2026-03-10' },
];

export const notifications = [
  { id: 'n1', title: 'Payslip ready', body: 'April 2026 payslip is available for download.', kind: 'payroll', read: false },
  { id: 'n2', title: 'Leave pending approval', body: 'Your personal leave request (Jun 5) is awaiting Marcus for approval.', kind: 'leave', read: false },
  { id: 'n3', title: 'Certificate expiring', body: 'AWS certificate expires in 53 days — consider renewal.', kind: 'document', read: true },
  { id: 'n4', title: 'Overtime approved', body: 'Your overtime request for May 18 (2h) has been approved.', kind: 'attendance', read: false },
  { id: 'n5', title: 'Team approval needed', body: '3 leave requests from your team are waiting for your decision.', kind: 'leave', read: false },
];

export const onboardingTasks = [
  { id: 'task1', emp: 'e005', title: 'Review employee handbook', owner: 'employee', done: true },
  { id: 'task2', emp: 'e005', title: 'Confirm emergency contact details', owner: 'employee', done: false },
  { id: 'task3', emp: 'e005', title: 'Complete annual security refresher', owner: 'employee', done: false },
  { id: 'task4', emp: 'e005', title: 'Set up payroll bank account', owner: 'finance', done: true },
  { id: 'task5', emp: 'e005', title: 'Collect IT equipment from IT desk', owner: 'it', done: true },
  { id: 'task6', emp: 'e005', title: 'Sign NDA and IP agreement', owner: 'legal', done: true },
];
