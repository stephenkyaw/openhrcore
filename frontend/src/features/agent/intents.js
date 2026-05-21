import { TODAY, addDays } from "@/lib/dates";
import { EMPLOYEES } from "@/data/seed";
import { ATTENDANCE, CANDIDATES, JOBS, REC_STAGES } from "@/data/seed-extended";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const todayDate = () => new Date(`${TODAY}T00:00:00`);

function monthBounds(date = todayDate()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1).toISOString().slice(0, 10);
  const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  return { year, month, start, end };
}

function findEmployeeMention(ql) {
  return EMPLOYEES.find((e) => {
    const name = `${e.first} ${e.last}`.toLowerCase();
    return (
      ql.includes(name) ||
      ql.includes(e.first.toLowerCase()) ||
      ql.includes(e.last.toLowerCase()) ||
      ql.includes(e.code.toLowerCase())
    );
  });
}

function tabFromQuery(ql) {
  if (/lifecycle|life cycle|promotion|transfer|probation|contract|offboard|rehire/.test(ql)) {
    return "lifecycle";
  }
  if (/leave|balance|holiday|time off/.test(ql)) return "leave";
  if (/org|manager|reporting|direct report/.test(ql)) return "org";
  if (/document|file|contract pdf|id copy/.test(ql)) return "documents";
  if (/employment|job|role|position|manager/.test(ql)) return "employment";
  return "profile";
}

// Canned intent resolution. Each intent matches against the user's query and
// returns a plan/tool-call/run/reply/view shape that the panel replays as a
// fake agent loop.
export function resolveIntent(q) {
  const ql = q.toLowerCase();
  const mentionedEmployee = findEmployeeMention(ql);

  if (
    mentionedEmployee &&
    /open|show|view|profile|employee|lifecycle|life cycle|leave|org|employment|document/.test(ql)
  ) {
    const tab = tabFromQuery(ql);
    return {
      plan: `Resolve employee mention to ${mentionedEmployee.code}, then open the requested employee detail context.`,
      tool: "employee.read",
      args: { employee_id: mentionedEmployee.id, include: [tab] },
      run: () => ({ count: 1, ms: 16 }),
      reply: `${mentionedEmployee.first} ${mentionedEmployee.last} is ready. I can open ${tab === "profile" ? "the profile" : `the ${tab} tab`} from here.`,
      view: {
        kind: "employee-detail",
        employee: mentionedEmployee,
        tab,
      },
    };
  }

  if (/probation/.test(ql)) {
    const { month, year, start, end } = monthBounds();
    const matches = EMPLOYEES.filter((e) => {
      if (!e.probation_end) return false;
      const d = new Date(e.probation_end);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    return {
      plan: `Filter employees where probation_end falls between ${start} and ${end}, ordered by date.`,
      tool: "employee.list",
      args: {
        filters: { probation_end: { gte: start, lte: end } },
        order: "probation_end asc",
      },
      run: () => ({ count: matches.length, ms: 38 }),
      reply: `${matches.length} employees have probation ending this month. Review the list and open Lifecycle when you need to record an outcome.`,
      view: {
        kind: "employee-list",
        rows: matches,
        suggest_action: "probation",
      },
    };
  }

  if (/on leave/.test(ql) || /next week/.test(ql)) {
    const start = addDays(TODAY, 1);
    const end = addDays(TODAY, 14);
    return {
      plan: "Find approved leave overlapping next week.",
      tool: "leave.list",
      args: {
        filters: { status: "approved", overlaps: { from: start, to: end } },
      },
      run: ({ requests }) => {
        const rows = requests.filter(
          (r) => r.status === "approved" && r.from <= end && r.to >= start,
        );
        return { count: rows.length, ms: 22, rows };
      },
      reply:
        "Nobody is on approved leave next week. There are 4 pending requests — want me to open the approvals queue?",
      view: {
        kind: "cta",
        label: "Open approvals queue",
        target: ["leave", null, { tab: "approvals" }],
      },
    };
  }

  if (/pending/.test(ql) && /approval/.test(ql)) {
    return {
      plan: "Filter pending leave requests with submitted_at older than 3 days.",
      tool: "leave.list",
      args: {
        filters: { status: "pending", submitted_before: addDays(TODAY, -3) },
      },
      run: ({ requests }) => {
        const rows = requests.filter(
          (r) =>
            r.status === "pending" &&
            (todayDate() - new Date(r.submitted)) / 86400000 >= 3,
        );
        return { count: rows.length, ms: 28, rows };
      },
      reply:
        "Found 2 pending requests older than 3 days. Marcus Tan and Priya Raman are the approvers — you can nudge them or escalate.",
      view: { kind: "leave-list", filter: "stale" },
    };
  }

  if (/direct report/.test(ql) || /marcus/.test(ql)) {
    const marcus = EMPLOYEES.find((e) => e.first === "Marcus");
    const reports = EMPLOYEES.filter((e) => e.manager === marcus.id);
    return {
      plan: "Look up employee by name, then list employees where manager = marcus.id.",
      tool: "employee.list",
      args: { filters: { manager: marcus.id } },
      run: () => ({ count: reports.length, ms: 14 }),
      reply: `Marcus Tan (Engineering Manager) has ${reports.length} direct reports.`,
      view: { kind: "employee-list", rows: reports },
    };
  }

  if (/pipeline|recruit|hiring|candidate|backend/.test(ql)) {
    const job =
      JOBS.find((j) => j.title.toLowerCase().includes("backend")) || JOBS[0];
    const cands = CANDIDATES.filter((c) => c.job === job.id);
    return {
      plan: "Aggregate candidates per stage for the Senior Backend Engineer requisition.",
      tool: "recruitment.pipeline",
      args: { job_id: job.id, group_by: "stage" },
      run: () => ({ count: cands.length, ms: 31 }),
      reply: `${job.title} has ${cands.length} candidates in the pipeline. ${cands.filter((c) => c.stage === "offer").length} in offer, ${cands.filter((c) => c.stage === "onsite").length} in onsite, ${cands.filter((c) => c.stage === "interview").length} in interview rounds.`,
      view: {
        kind: "cta",
        label: "Open pipeline",
        target: ["recruitment", null, { jobId: job.id }],
      },
    };
  }

  if (/payroll|salary|net pay|gross/.test(ql)) {
    return {
      plan: "Read the active payroll run preview and summarize totals.",
      tool: "payroll.read",
      args: { run_id: "pr-2026-05" },
      run: () => ({ count: 1, ms: 19 }),
      reply:
        "May 2026 payroll preview: 18 employees · ฿1,442,000 gross · −฿252,118 statutory · ฿1,189,882 net. Cutoff in 12 days; still in dry-run mode.",
      view: {
        kind: "cta",
        label: "Review preview",
        target: ["payroll", null, { tab: "preview" }],
      },
    };
  }

  if (/late|lateness|attendance/.test(ql)) {
    return {
      plan: "Count late arrivals across the last 5 working days, grouped by employee.",
      tool: "attendance.report",
      args: {
        metric: "late",
        from: "2026-05-13",
        to: "2026-05-19",
        group_by: "employee",
      },
      run: () => {
        const n = ATTENDANCE.filter((a) => a.status === "late").length;
        return { count: n, ms: 24 };
      },
      reply:
        "Recorded 21 late arrivals across 5 working days. The lateness report is the fastest way to spot patterns.",
      view: {
        kind: "cta",
        label: "Open lateness report",
        target: ["attendance", null, { tab: "reports" }],
      },
    };
  }

  return {
    plan: "Interpreting freeform question — no exact intent match, will return a helpful pointer.",
    tool: "agent.fallback",
    args: { question: q },
    run: () => ({ count: 0, ms: 12 }),
    reply:
      'I can answer questions about employees, leave, org structure, and admin actions. Try one of the suggestions — or ask something like "who joined in the last 90 days?" or "how many days of annual leave does Saki have left?"',
    view: null,
  };
}
