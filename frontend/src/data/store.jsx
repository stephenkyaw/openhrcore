import { createContext, useCallback, useContext, useState } from "react";
import { daysBetween } from "@/lib/dates";
import {
  AUDIT_LOG,
  BASE_BALANCES,
  COMPANIES,
  DEPARTMENTS,
  EMPLOYEES,
  HOLIDAYS,
  INITIAL_REQUESTS,
  LEAVE_TYPES,
  LOCATIONS,
  POSITIONS,
  ROLES,
} from "./seed";
const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);
export function StoreProvider({ children }) {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [balances, setBalances] = useState(BASE_BALANCES);
  const [audit, setAudit] = useState(AUDIT_LOG);
  const [employees] = useState(EMPLOYEES);
  const [currentUser] = useState("e001");
  const [activeEntity, setActiveEntity] = useState("c1");
  // Forms mutate window-level seed arrays directly. This tick re-renders subscribers.
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, kind = "default") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const logAudit = useCallback(
    (entry) => {
      const full = {
        id: "a" + Math.random().toString(36).slice(2, 8),
        ts: new Date().toISOString(),
        actor: currentUser,
        ...entry,
      };
      setAudit((a) => [full, ...a]);
    },
    [currentUser],
  );

  const submitLeave = useCallback(
    (req) => {
      const id = "lr" + Math.random().toString(36).slice(2, 7);
      const days = daysBetween(req.from, req.to);
      const full = {
        id,
        emp: req.emp || currentUser,
        type: req.type,
        from: req.from,
        to: req.to,
        days,
        reason: req.reason,
        status: "pending",
        submitted: new Date().toISOString(),
        approver: "e002",
      };

      setRequests((r) => [full, ...r]);
      setBalances((b) => {
        const cur = b[full.emp]?.[full.type] || {
          granted: 0,
          used: 0,
          pending: 0,
        };
        return {
          ...b,
          [full.emp]: {
            ...b[full.emp],
            [full.type]: { ...cur, pending: cur.pending + days },
          },
        };
      });
      logAudit({
        action: "leave.create",
        entity: `leave_request:${id}`,
        meta: { type: req.type, days },
      });
      toast("Leave request submitted");
      return full;
    },
    [currentUser, logAudit, toast],
  );

  const decideLeave = useCallback(
    (id, decision, reason) => {
      setRequests((r) =>
        r.map((x) =>
          x.id === id
            ? {
                ...x,
                status: decision,
                decided: new Date().toISOString(),
                reject_reason: reason,
              }
            : x,
        ),
      );
      const req = requests.find((x) => x.id === id);
      if (req) {
        setBalances((b) => {
          const cur = b[req.emp]?.[req.type] || {
            granted: 0,
            used: 0,
            pending: 0,
          };
          const next = {
            ...cur,
            pending: Math.max(0, cur.pending - req.days),
          };
          if (decision === "approved") next.used = next.used + req.days;
          return {
            ...b,
            [req.emp]: { ...b[req.emp], [req.type]: next },
          };
        });
      }
      logAudit({
        action: decision === "approved" ? "leave.approve" : "leave.reject",
        entity: `leave_request:${id}`,
        meta: reason ? { reason } : {},
      });
      toast(decision === "approved" ? "Request approved" : "Request rejected");
    },
    [requests, logAudit, toast],
  );

  const value = {
    employees,
    departments: DEPARTMENTS,
    positions: POSITIONS,
    locations: LOCATIONS,
    leaveTypes: LEAVE_TYPES,
    holidays: HOLIDAYS,
    roles: ROLES,
    companies: COMPANIES,
    requests,
    balances,
    audit,
    currentUser,
    toast,
    toasts,
    submitLeave,
    decideLeave,
    logAudit,
    tick,
    bump,
    activeEntity,
    setActiveEntity,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
