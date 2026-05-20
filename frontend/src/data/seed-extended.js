import { EMPLOYEES } from './seed';

export const ATTENDANCE_LAST_DAYS = ['2026-05-13', '2026-05-14', '2026-05-15', '2026-05-18', '2026-05-19'];

// Synthesized: for each recent working day, every employee has a record.
export const ATTENDANCE = (() => {
  const rows = [];
  const employees = ['e002','e003','e004','e005','e006','e007','e008','e009','e010','e011','e013','e014','e015','e016','e017'];
  const baseStart = ['09:02','09:08','08:54','09:14','08:48','09:21','08:59','09:03','09:32','09:11','08:50','09:06','09:18','09:00','09:25'];
  ATTENDANCE_LAST_DAYS.forEach((date, dayIdx) => {
    employees.forEach((id, i) => {
      const startHHMM = baseStart[(i + dayIdx) % baseStart.length];
      const [sh, sm] = startHHMM.split(':').map(Number);
      const workMin = 9 * 60 + (i % 4) * 15 - (dayIdx % 2 === 0 ? 0 : 20);
      const endMin = sh * 60 + sm + workMin;
      const eh = Math.floor(endMin / 60), em = endMin % 60;
      const endHHMM = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
      const status = i === 7 && dayIdx === 4 ? 'on-leave' : (sh * 60 + sm > 9 * 60 + 15 ? 'late' : 'present');
      const wfh = (i + dayIdx) % 5 === 0;
      rows.push({
        id: `att-${date}-${id}`,
        emp: id, date,
        in: status === 'on-leave' ? null : startHHMM,
        out: status === 'on-leave' ? null : endHHMM,
        hours: status === 'on-leave' ? 0 : Math.round((workMin / 60) * 10) / 10,
        status, source: wfh ? 'web' : 'kiosk',
        wfh,
      });
    });
  });
  return rows;
})();

export const OT_REQUESTS = [
  { id: 'ot1', emp: 'e004', date: '2026-05-18', hours: 2.5, reason: 'Production hotfix — payment gateway', status: 'pending', approver: 'e002', submitted: '2026-05-18T19:14:00Z' },
  { id: 'ot2', emp: 'e007', date: '2026-05-15', hours: 3, reason: 'Customer launch prep', status: 'pending', approver: 'e002', submitted: '2026-05-15T22:02:00Z' },
  { id: 'ot3', emp: 'e009', date: '2026-05-12', hours: 1.5, reason: 'On-call escalation', status: 'approved', approver: 'e002', submitted: '2026-05-12T20:00:00Z', decided: '2026-05-13T09:00:00Z' },
];

export const SHIFTS = [
  { id: 's1', name: 'Standard', from: '09:00', to: '18:00', break: 60, color: 200 },
  { id: 's2', name: 'Early', from: '07:00', to: '16:00', break: 60, color: 50 },
  { id: 's3', name: 'Late', from: '12:00', to: '21:00', break: 60, color: 290 },
  { id: 's4', name: 'Weekend on-call', from: '10:00', to: '14:00', break: 0, color: 25 },
];

// emp -> [Mon..Sun shift id]
export const ROSTER = {
  e002: ['s1', 's1', 's1', 's1', 's1', null, null],
  e004: ['s2', 's2', 's1', 's1', 's2', 's4', null],
  e005: ['s1', 's1', 's1', 's1', 's1', null, null],
  e007: ['s1', 's3', 's3', 's1', 's1', null, null],
  e009: ['s1', 's1', 's1', 's1', 's1', 's4', null],
  e013: ['s1', 's1', 's1', 's1', 's1', null, null],
};

export const SALARY_COMPONENTS = [
  { id: 'sc1', code: 'BASIC', name: 'Basic salary', kind: 'earning', calc: 'fixed', notes: 'Contracted monthly base' },
  { id: 'sc2', code: 'HOUSE', name: 'Housing allowance', kind: 'earning', calc: 'percentage', value: '15%', notes: 'Of basic' },
  { id: 'sc3', code: 'TRANS', name: 'Transport allowance', kind: 'earning', calc: 'fixed', value: '฿2,500', notes: 'Flat per month' },
  { id: 'sc4', code: 'PIT', name: 'Personal income tax', kind: 'statutory', calc: 'formula', notes: 'Thai PIT progressive bracket' },
  { id: 'sc5', code: 'SSO', name: 'Social security', kind: 'statutory', calc: 'percentage', value: '5%', notes: 'Capped ฿750/mo (Thailand SSO)' },
  { id: 'sc6', code: 'PVD', name: 'Provident fund', kind: 'deduction', calc: 'percentage', value: '5%', notes: 'Optional opt-in' },
  { id: 'sc7', code: 'OT', name: 'Overtime', kind: 'earning', calc: 'formula', notes: 'Hours × 1.5× hourly rate' },
  { id: 'sc8', code: 'BONUS', name: 'One-time bonus', kind: 'earning', calc: 'fixed', notes: 'Discretionary' },
];

export const PAYROLL_RUNS = [
  { id: 'pr-2026-04', period: 'April 2026', from: '2026-04-01', to: '2026-04-30', status: 'committed', employees: 18, gross: 1428500, deductions: 248322, net: 1180178, pay_date: '2026-05-01', committed_by: 'e001', committed_at: '2026-04-29T16:32:00Z' },
  { id: 'pr-2026-05', period: 'May 2026', from: '2026-05-01', to: '2026-05-31', status: 'preview', employees: 18, gross: 1442000, deductions: 252118, net: 1189882, pay_date: '2026-06-01' },
  { id: 'pr-2026-03', period: 'March 2026', from: '2026-03-01', to: '2026-03-31', status: 'committed', employees: 17, gross: 1352000, deductions: 234104, net: 1117896, pay_date: '2026-04-01', committed_by: 'e001' },
  { id: 'pr-2026-02', period: 'February 2026', from: '2026-02-01', to: '2026-02-28', status: 'committed', employees: 17, gross: 1352000, deductions: 234104, net: 1117896, pay_date: '2026-03-01', committed_by: 'e001' },
];

export const MAY_PAYSLIP_LINES = EMPLOYEES.slice(0, 14).map((e, i) => {
  const basic = [120000, 95000, 110000, 145000, 105000, 92000, 105000, 78000, 75000, 65000, 80000, 62000, 62000, 68000][i] || 70000;
  const house = Math.round(basic * 0.15);
  const trans = 2500;
  const gross = basic + house + trans;
  const pit = Math.round(gross * 0.10);
  const sso = 750;
  const pvd = Math.round(basic * 0.05);
  const net = gross - pit - sso - pvd;
  return { emp: e.id, basic, house, trans, gross, pit, sso, pvd, net };
});

export const REC_STAGES = [
  { id: 'applied', label: 'Applied', color: 220 },
  { id: 'screen', label: 'Recruiter screen', color: 200 },
  { id: 'interview', label: 'Interview', color: 50 },
  { id: 'onsite', label: 'Onsite / final', color: 290 },
  { id: 'offer', label: 'Offer', color: 165 },
  { id: 'hired', label: 'Hired', color: 140 },
  { id: 'rejected', label: 'Rejected', color: 25 },
];

export const JOBS = [
  { id: 'j1', title: 'Senior Backend Engineer', dept: 'd1', loc: 'l1', hiring_manager: 'e002', recruiter: 'e011', status: 'open', priority: 'high', opened: '2026-03-12', target_close: '2026-06-30', headcount: 2, type: 'Permanent' },
  { id: 'j2', title: 'Product Designer', dept: 'd3', loc: 'l1', hiring_manager: 'e003', recruiter: 'e012', status: 'open', priority: 'high', opened: '2026-04-01', target_close: '2026-06-15', headcount: 1, type: 'Permanent' },
  { id: 'j3', title: 'Senior Product Manager — Platform', dept: 'd2', loc: 'l2', hiring_manager: 'e001', recruiter: 'e011', status: 'open', priority: 'medium', opened: '2026-04-22', target_close: '2026-07-31', headcount: 1, type: 'Permanent' },
  { id: 'j4', title: 'Engineering Manager — Product Eng', dept: 'd1', loc: 'l1', hiring_manager: 'e001', recruiter: 'e011', status: 'open', priority: 'high', opened: '2026-05-02', target_close: '2026-08-31', headcount: 1, type: 'Permanent' },
  { id: 'j5', title: 'People Ops Specialist', dept: 'd4', loc: 'l1', hiring_manager: 'e011', recruiter: 'e012', status: 'open', priority: 'low', opened: '2026-04-30', target_close: '2026-07-15', headcount: 1, type: 'Permanent' },
  { id: 'j6', title: 'DevOps Engineer (contract)', dept: 'd1', loc: 'l3', hiring_manager: 'e002', recruiter: 'e011', status: 'draft', priority: 'medium', opened: null, target_close: null, headcount: 1, type: 'Contract · 6mo' },
  { id: 'j7', title: 'Marketing Lead', dept: 'd5', loc: 'l1', hiring_manager: 'e001', recruiter: 'e012', status: 'on-hold', priority: 'low', opened: '2026-02-15', headcount: 1, type: 'Permanent' },
  { id: 'j8', title: 'Frontend Engineer (Junior)', dept: 'd1', loc: 'l1', hiring_manager: 'e004', recruiter: 'e011', status: 'closed', priority: 'medium', opened: '2026-01-10', closed: '2026-04-14', headcount: 1, type: 'Permanent', hired: 'e017' },
];

export const CANDIDATES = [
  { id: 'cn001', job: 'j1', first: 'Marek', last: 'Kowalski', loc: 'Warsaw, PL', applied: '2026-03-14', stage: 'onsite', source: 'Referral · Marcus T.', rating: 4.5, exp: '8y', current: 'Senior Engineer at Datafold', hue: 210, salary_ask: 145000 },
  { id: 'cn002', job: 'j1', first: 'Yuki', last: 'Tanabe', loc: 'Tokyo, JP', applied: '2026-03-22', stage: 'offer', source: 'LinkedIn', rating: 5, exp: '10y', current: 'Staff Engineer at Mercari', hue: 320, salary_ask: 160000 },
  { id: 'cn003', job: 'j1', first: 'Adam', last: 'Mendez', loc: 'Bangkok, TH', applied: '2026-04-02', stage: 'interview', source: 'Inbound · Careers page', rating: 3.5, exp: '6y', current: 'Backend Eng at LINE Man Wongnai', hue: 100 },
  { id: 'cn004', job: 'j1', first: 'Lena', last: 'Müller', loc: 'Berlin, DE', applied: '2026-04-15', stage: 'screen', source: 'LinkedIn', rating: 4, exp: '7y', current: 'Senior SWE at SoundCloud', hue: 280 },
  { id: 'cn005', job: 'j1', first: 'Sanjay', last: 'Iyer', loc: 'Bangalore, IN', applied: '2026-04-28', stage: 'applied', source: 'Inbound', rating: null, exp: '9y', current: 'Tech Lead at Razorpay', hue: 30 },
  { id: 'cn006', job: 'j1', first: 'Carla', last: 'Beltrán', loc: 'Madrid, ES', applied: '2026-05-02', stage: 'applied', source: 'Inbound', rating: null, exp: '5y', current: 'SWE at Glovo', hue: 15 },
  { id: 'cn007', job: 'j1', first: 'Ravi', last: 'Sundaram', loc: 'Singapore, SG', applied: '2026-03-30', stage: 'rejected', source: 'Recruiter outbound', rating: 2, exp: '4y', current: 'SWE at Grab', hue: 60, reject_reason: 'Below seniority bar' },

  { id: 'cn101', job: 'j2', first: 'Mei', last: 'Suzuki', loc: 'Tokyo, JP', applied: '2026-04-04', stage: 'offer', source: 'Referral · Priya R.', rating: 5, exp: '7y', current: 'Design Lead at Smartnews', hue: 340, salary_ask: 125000 },
  { id: 'cn102', job: 'j2', first: 'Pim', last: 'Sukasem', loc: 'Bangkok, TH', applied: '2026-04-14', stage: 'onsite', source: 'Dribbble', rating: 4, exp: '5y', current: 'Senior Designer at Lazada', hue: 25 },
  { id: 'cn103', job: 'j2', first: 'Oscar', last: 'Lindblad', loc: 'Stockholm, SE', applied: '2026-04-22', stage: 'interview', source: 'Inbound', rating: 4, exp: '6y', current: 'Product Designer at Spotify', hue: 165 },
  { id: 'cn104', job: 'j2', first: 'Jung-min', last: 'Park', loc: 'Seoul, KR', applied: '2026-05-01', stage: 'screen', source: 'LinkedIn', rating: null, exp: '4y', current: 'Designer at Toss', hue: 250 },
  { id: 'cn105', job: 'j2', first: 'Carmen', last: 'Vidal', loc: 'Barcelona, ES', applied: '2026-05-08', stage: 'applied', source: 'Inbound', rating: null, exp: '6y', current: 'Senior Designer at Wallapop', hue: 18 },

  { id: 'cn201', job: 'j3', first: 'Daniel', last: 'Cohen', loc: 'Tel Aviv, IL', applied: '2026-04-25', stage: 'onsite', source: 'Referral · Daniel O.', rating: 4.5, exp: '9y', current: 'Group PM at Wix', hue: 200, salary_ask: 150000 },
  { id: 'cn202', job: 'j3', first: 'Anh', last: 'Nguyen', loc: 'Singapore, SG', applied: '2026-05-05', stage: 'interview', source: 'LinkedIn', rating: 4, exp: '7y', current: 'Senior PM at Shopee', hue: 280 },
  { id: 'cn203', job: 'j3', first: 'Tess', last: 'Anand', loc: 'San Francisco, US', applied: '2026-05-11', stage: 'screen', source: 'Recruiter outbound', rating: null, exp: '8y', current: 'PM at Notion', hue: 130 },

  { id: 'cn301', job: 'j4', first: 'Hiro', last: 'Tanaka', loc: 'Singapore, SG', applied: '2026-05-08', stage: 'interview', source: 'Referral · Lin C.', rating: 4, exp: '12y', current: 'EM at Stripe APAC', hue: 200 },
  { id: 'cn302', job: 'j4', first: 'Reema', last: 'Aziz', loc: 'Dubai, AE', applied: '2026-05-14', stage: 'screen', source: 'LinkedIn', rating: null, exp: '11y', current: 'Senior EM at Careem', hue: 320 },

  { id: 'cn401', job: 'j5', first: 'Ploy', last: 'Charoenchai', loc: 'Bangkok, TH', applied: '2026-05-04', stage: 'screen', source: 'Inbound', rating: 3.5, exp: '3y', current: 'HR Coordinator at Agoda', hue: 340 },
  { id: 'cn402', job: 'j5', first: 'Niran', last: 'Phongphat', loc: 'Bangkok, TH', applied: '2026-05-12', stage: 'applied', source: 'Inbound', rating: null, exp: '4y', current: 'People Ops at Sertis', hue: 90 },
];

export const INTERVIEWS = [
  { id: 'iv1', cand: 'cn001', date: '2026-05-20', time: '10:00', dur: 60, type: 'Onsite — System design', interviewer: 'e004', status: 'scheduled' },
  { id: 'iv2', cand: 'cn001', date: '2026-05-20', time: '11:30', dur: 60, type: 'Onsite — Coding', interviewer: 'e005', status: 'scheduled' },
  { id: 'iv3', cand: 'cn001', date: '2026-05-20', time: '14:00', dur: 45, type: 'Onsite — Hiring manager', interviewer: 'e002', status: 'scheduled' },
  { id: 'iv4', cand: 'cn003', date: '2026-05-21', time: '15:00', dur: 60, type: 'Interview — Technical', interviewer: 'e007', status: 'scheduled' },
  { id: 'iv5', cand: 'cn102', date: '2026-05-22', time: '10:00', dur: 90, type: 'Onsite — Portfolio', interviewer: 'e003', status: 'scheduled' },
];

export const SCORECARDS = [
  { id: 'sc1', cand: 'cn002', interviewer: 'e002', round: 'Hiring manager', rating: 5, recommend: 'strong-yes', notes: 'Exceptional system design depth. Has built similar at Mercari. Strong product sense.' },
  { id: 'sc2', cand: 'cn002', interviewer: 'e004', round: 'System design', rating: 5, recommend: 'strong-yes', notes: 'Best system design interview I have run in 6 months. Trade-offs were articulate.' },
  { id: 'sc3', cand: 'cn002', interviewer: 'e005', round: 'Coding', rating: 4, recommend: 'yes', notes: 'Clean code, idiomatic. Took an extra hint on the second problem.' },
  { id: 'sc4', cand: 'cn003', interviewer: 'e002', round: 'Hiring manager', rating: 3, recommend: 'no', notes: 'Strong on Thai market context but seniority gap shows in design discussion.' },
];

export const OFFERS = [
  { id: 'of1', cand: 'cn002', job: 'j1', basic: 145000, house: 21750, trans: 2500, total: 169250, currency: 'THB', status: 'sent', sent_at: '2026-05-17', expires: '2026-05-24', start_date: '2026-07-01' },
  { id: 'of2', cand: 'cn101', job: 'j2', basic: 115000, house: 17250, trans: 2500, total: 134750, currency: 'THB', status: 'pending-approval', start_date: '2026-06-15' },
];

export const ONBOARDING_TASKS_DEFAULT = [
  { id: 'ob1', label: 'Equipment ready (laptop, badge)', owner: 'it', day: -3 },
  { id: 'ob2', label: 'Welcome email sent', owner: 'hr', day: -1 },
  { id: 'ob3', label: 'Account provisioning', owner: 'it', day: 0 },
  { id: 'ob4', label: 'HR orientation', owner: 'hr', day: 1 },
  { id: 'ob5', label: 'Manager 1:1', owner: 'manager', day: 1 },
  { id: 'ob6', label: 'Team intro', owner: 'manager', day: 2 },
  { id: 'ob7', label: 'Health insurance enrollment', owner: 'hr', day: 7 },
  { id: 'ob8', label: '30-day check-in', owner: 'manager', day: 30 },
  { id: 'ob9', label: 'Probation review', owner: 'hr', day: 180 },
];

export const SCORECARD_RECOMMEND_TONE = {
  'strong-yes': { tone: 'ok', label: 'Strong yes' },
  yes:          { tone: 'ok', label: 'Yes' },
  maybe:        { tone: 'warn', label: 'Maybe' },
  no:           { tone: 'danger', label: 'No' },
  'strong-no':  { tone: 'danger', label: 'Strong no' },
};
