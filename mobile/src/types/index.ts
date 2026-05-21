export type EmployeeStatus = 'active' | 'inactive';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type AttendanceStatus = 'present' | 'late' | 'absent';
export type AttendanceSource = 'kiosk' | 'web' | 'mobile' | null;
export type PayslipStatus = 'paid' | 'pending';
export type DocumentStatus = 'verified' | 'expiring' | 'pending';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type NotificationKind = 'payroll' | 'leave' | 'document' | 'attendance';
export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'primary' | 'info';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'md' | 'sm';

export interface Employee {
  id: string;
  code: string;
  first: string;
  last: string;
  email: string;
  phone: string;
  position: string;
  dept: string;
  manager: string | null;
  location: string;
  hire: string;
  status: EmployeeStatus;
}

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  requiresAttachment: boolean;
}

export interface LeaveBalance {
  granted: number;
  used: number;
  pending: number;
}

export type LeaveBalanceMap = Record<string, LeaveBalance>;
export type EmployeeLeaveBalances = Record<string, LeaveBalanceMap>;

export interface LeaveRequest {
  id: string;
  emp: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  submitted: string;
  approver: string | null;
  decided?: string;
}

export interface AttendanceRecord {
  id: string;
  emp: string;
  date: string;
  in: string | null;
  out: string | null;
  hours: number;
  status: AttendanceStatus | null;
  source: AttendanceSource;
  wfh: boolean;
}

export interface PayLine {
  label: string;
  amount: number;
}

export interface Payslip {
  id: string;
  emp: string;
  period: string;
  payDate: string;
  status: PayslipStatus;
  currency: string;
  earnings: PayLine[];
  deductions: PayLine[];
}

export interface HrDocument {
  id: string;
  emp: string;
  name: string;
  category: string;
  status: DocumentStatus;
  uploaded: string;
  expires: string | null;
}

export interface CorrectionRequest {
  id: string;
  emp: string;
  date: string;
  requestedIn: string;
  requestedOut: string;
  reason: string;
  status: RequestStatus;
  approver: string;
}

export interface OvertimeRequest {
  id: string;
  emp: string;
  date: string;
  hours: number;
  reason: string;
  status: RequestStatus;
  approver: string;
}

export interface Reimbursement {
  id: string;
  emp: string;
  category: string;
  amount: number;
  currency: string;
  reason: string;
  status: RequestStatus;
  submitted: string;
}

export interface SalaryAdvance {
  id: string;
  emp: string;
  amount: number;
  currency: string;
  reason: string;
  status: RequestStatus;
  submitted: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  kind: NotificationKind;
  read: boolean;
}

export interface OnboardingTask {
  id: string;
  emp: string;
  title: string;
  owner: string;
  done: boolean;
}

export interface MonthSummary {
  present: number;
  late: number;
  absent: number;
  wfh: number;
  total: number;
}

export interface YtdEarnings {
  gross: number;
  net: number;
  tax: number;
  months: number;
}

export interface WeekAttendanceDay {
  date: string;
  hours: number;
  status: AttendanceStatus | null;
  in?: string | null;
  out?: string | null;
  wfh?: boolean;
  id?: string;
}
