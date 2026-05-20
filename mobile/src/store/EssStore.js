import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  attendance as seedAttendance,
  correctionRequests,
  currentUserId,
  documents,
  employees,
  leaveBalances,
  leaveRequests,
  leaveTypes,
  notifications,
  onboardingTasks,
  overtimeRequests,
  payslips,
  reimbursements,
  salaryAdvances,
} from '../data/seed';
import { daysBetween, todayStr, toDateStr } from '../utils/dates';

const EssContext = createContext(null);

export function useEss() {
  const value = useContext(EssContext);
  if (!value) throw new Error('useEss must be used within EssProvider');
  return value;
}

export function EssProvider({ children }) {
  const [requests, setRequests] = useState(leaveRequests);
  const [balances, setBalances] = useState(leaveBalances);
  const [attendance, setAttendance] = useState(seedAttendance);
  const [corrections, setCorrections] = useState(correctionRequests);
  const [overtime, setOvertime] = useState(overtimeRequests);
  const [claims, setClaims] = useState(reimbursements);
  const [advances, setAdvances] = useState(salaryAdvances);
  const [docs, setDocs] = useState(documents);
  const [alerts, setAlerts] = useState(notifications);
  const [tasks, setTasks] = useState(onboardingTasks);
  const [toast, setToast] = useState(null);

  const employee = useMemo(() => employees.find((e) => e.id === currentUserId), []);
  const manager = useMemo(() => employees.find((e) => e.id === employee.manager), [employee]);
  const team = useMemo(() => employees.filter((e) => e.manager === currentUserId), []);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  }, []);

  // ── Derived attendance ────────────────────────────────────────────────────

  const myAttendance = useMemo(
    () => [...attendance.filter((a) => a.emp === currentUserId)].sort((a, b) => b.date.localeCompare(a.date)),
    [attendance],
  );

  const weekAttendance = useMemo(() => {
    const today = new Date();
    const dow = (today.getDay() + 6) % 7; // 0=Mon … 4=Fri
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - dow + i);
      const dateStr = toDateStr(d);
      return myAttendance.find((a) => a.date === dateStr) || { date: dateStr, hours: 0, status: null };
    });
  }, [myAttendance]);

  const monthSummary = useMemo(() => {
    const prefix = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const monthly = myAttendance.filter((r) => r.date.startsWith(prefix));
    return {
      present: monthly.filter((r) => r.status === 'present').length,
      late: monthly.filter((r) => r.status === 'late').length,
      absent: monthly.filter((r) => r.status === 'absent').length,
      wfh: monthly.filter((r) => r.wfh).length,
      total: monthly.length,
    };
  }, [myAttendance]);

  // ── Derived pay ────────────────────────────────────────────────────────────

  const myPayslips = useMemo(
    () => payslips.filter((p) => p.emp === currentUserId),
    [],
  );

  const ytdEarnings = useMemo(() => {
    const year = String(new Date().getFullYear());
    const ytd = myPayslips.filter((p) => p.payDate.startsWith(year));
    const gross = ytd.reduce((s, p) => s + p.earnings.reduce((e, l) => e + l.amount, 0), 0);
    const deductions = ytd.reduce((s, p) => s + p.deductions.reduce((e, l) => e + l.amount, 0), 0);
    const tax = ytd.reduce(
      (s, p) => s + (p.deductions.find((d) => d.label.includes('tax'))?.amount ?? 0),
      0,
    );
    return { gross, net: gross - deductions, tax, months: ytd.length };
  }, [myPayslips]);

  // ── Derived leave ─────────────────────────────────────────────────────────

  const myRequests = useMemo(
    () => requests.filter((r) => r.emp === currentUserId),
    [requests],
  );

  const pendingApprovals = useMemo(
    () => requests.filter((r) => r.approver === currentUserId && r.status === 'pending'),
    [requests],
  );

  const upcomingLeave = useMemo(() => {
    const today = todayStr();
    return myRequests
      .filter((r) => r.status === 'approved' && r.to >= today)
      .sort((a, b) => a.from.localeCompare(b.from));
  }, [myRequests]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const submitLeave = useCallback(({ type, from, to, reason }) => {
    const days = daysBetween(from, to);
    if (!type || !from || !to || days <= 0) {
      showToast('Check leave type and dates');
      return false;
    }
    const request = {
      id: `lr-${Date.now()}`,
      emp: currentUserId,
      type,
      from,
      to,
      days,
      reason: reason?.trim() || 'No reason provided',
      status: 'pending',
      submitted: new Date().toISOString(),
      approver: employee.manager,
    };
    setRequests((prev) => [request, ...prev]);
    setBalances((prev) => {
      const cur = prev[currentUserId]?.[type] || { granted: 0, used: 0, pending: 0 };
      return { ...prev, [currentUserId]: { ...prev[currentUserId], [type]: { ...cur, pending: cur.pending + days } } };
    });
    showToast('Leave request submitted');
    return true;
  }, [employee.manager, showToast]);

  const cancelLeave = useCallback((id) => {
    const req = requests.find((r) => r.id === id);
    if (!req || req.status !== 'pending') { showToast('Only pending leave can be cancelled'); return; }
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r));
    setBalances((prev) => {
      const cur = prev[currentUserId]?.[req.type] || { granted: 0, used: 0, pending: 0 };
      return { ...prev, [currentUserId]: { ...prev[currentUserId], [req.type]: { ...cur, pending: Math.max(0, cur.pending - req.days) } } };
    });
    showToast('Leave request cancelled');
  }, [requests, showToast]);

  const decideLeave = useCallback((id, decision) => {
    const req = requests.find((r) => r.id === id);
    if (!req || req.status !== 'pending') { showToast('Request already decided'); return; }
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: decision, decided: new Date().toISOString() } : r),
    );
    showToast(decision === 'approved' ? 'Leave approved' : 'Leave rejected');
  }, [requests, showToast]);

  const clockIn = useCallback(() => {
    const today = todayStr();
    const existing = attendance.find((a) => a.date === today && a.emp === currentUserId);
    if (existing?.in && !existing?.out) { showToast('Already clocked in'); return; }
    const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    setAttendance((prev) => [
      { id: `att-${today}-${currentUserId}`, emp: currentUserId, date: today, in: time, out: null, hours: 0, status: 'present', source: 'mobile', wfh: false },
      ...prev.filter((a) => !(a.date === today && a.emp === currentUserId)),
    ]);
    showToast('Clocked in');
  }, [attendance, showToast]);

  const clockOut = useCallback(() => {
    const today = todayStr();
    const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    setAttendance((prev) =>
      prev.map((a) => a.date === today && a.emp === currentUserId ? { ...a, out: time, hours: a.hours || 8 } : a),
    );
    showToast('Clocked out');
  }, [showToast]);

  const submitCorrection = useCallback(({ date, requestedIn, requestedOut, reason }) => {
    if (!date || !requestedIn || !requestedOut) { showToast('Enter date and times'); return false; }
    setCorrections((prev) => [
      { id: `cr-${Date.now()}`, emp: currentUserId, date, requestedIn, requestedOut, reason: reason?.trim() || 'Correction requested', status: 'pending', approver: employee.manager },
      ...prev,
    ]);
    showToast('Correction request sent');
    return true;
  }, [employee.manager, showToast]);

  const submitOvertime = useCallback(({ date, hours, reason }) => {
    const parsed = Number(hours);
    if (!date || !parsed || parsed <= 0) { showToast('Enter overtime date and hours'); return false; }
    setOvertime((prev) => [
      { id: `ot-${Date.now()}`, emp: currentUserId, date, hours: parsed, reason: reason?.trim() || 'Overtime request', status: 'pending', approver: employee.manager },
      ...prev,
    ]);
    showToast('Overtime request sent');
    return true;
  }, [employee.manager, showToast]);

  const submitReimbursement = useCallback(({ category, amount, reason }) => {
    const parsed = Number(amount);
    if (!category || !parsed || parsed <= 0) { showToast('Enter category and amount'); return false; }
    setClaims((prev) => [
      { id: `rb-${Date.now()}`, emp: currentUserId, category, amount: parsed, currency: 'THB', reason: reason?.trim() || 'Expense claim', status: 'pending', submitted: todayStr() },
      ...prev,
    ]);
    showToast('Reimbursement submitted');
    return true;
  }, [showToast]);

  const submitAdvance = useCallback(({ amount, reason }) => {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) { showToast('Enter advance amount'); return false; }
    setAdvances((prev) => [
      { id: `sa-${Date.now()}`, emp: currentUserId, amount: parsed, currency: 'THB', reason: reason?.trim() || 'Salary advance', status: 'pending', submitted: todayStr() },
      ...prev,
    ]);
    showToast('Salary advance requested');
    return true;
  }, [showToast]);

  const uploadDocument = useCallback(({ name, category }) => {
    if (!name?.trim() || !category?.trim()) { showToast('Enter document name and category'); return false; }
    setDocs((prev) => [
      { id: `doc-${Date.now()}`, emp: currentUserId, name: name.trim(), category: category.trim(), status: 'pending', uploaded: todayStr(), expires: null },
      ...prev,
    ]);
    showToast('Document added');
    return true;
  }, [showToast]);

  const toggleTask = useCallback((id) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  const markNotificationRead = useCallback((id) => {
    setAlerts((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const value = useMemo(() => ({
    employee,
    manager,
    team,
    employees,
    leaveTypes,
    requests: myRequests,
    pendingApprovals,
    balances: balances[currentUserId] || {},
    attendance: myAttendance,
    weekAttendance,
    monthSummary,
    corrections: corrections.filter((c) => c.emp === currentUserId),
    overtime: overtime.filter((o) => o.emp === currentUserId),
    payslips: myPayslips,
    ytdEarnings,
    upcomingLeave,
    documents: docs.filter((d) => d.emp === currentUserId),
    reimbursements: claims.filter((c) => c.emp === currentUserId),
    salaryAdvances: advances.filter((a) => a.emp === currentUserId),
    notifications: alerts,
    tasks: tasks.filter((t) => t.emp === currentUserId),
    submitLeave,
    cancelLeave,
    decideLeave,
    clockIn,
    clockOut,
    submitCorrection,
    submitOvertime,
    submitReimbursement,
    submitAdvance,
    uploadDocument,
    toggleTask,
    markNotificationRead,
    markAllRead,
    toast,
  }), [
    advances, alerts, attendance, balances, claims, corrections, docs,
    employee, manager, monthSummary, myAttendance, myPayslips, myRequests,
    overtime, pendingApprovals, requests, tasks, team, toast, upcomingLeave,
    weekAttendance, ytdEarnings,
    submitLeave, cancelLeave, decideLeave, clockIn, clockOut,
    submitCorrection, submitOvertime, submitReimbursement, submitAdvance,
    uploadDocument, toggleTask, markNotificationRead, markAllRead,
  ]);

  return <EssContext.Provider value={value}>{children}</EssContext.Provider>;
}
