import { useStore } from "@/data/store";
import { AgentWorkspace } from "@/features/agent/AgentWorkspace";
import { Admin } from "@/features/admin/Admin";
import { Attendance } from "@/features/attendance/Attendance";
import { Company } from "@/features/company/Company";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { Employees } from "@/features/employees/Employees";
import { Leave } from "@/features/leave/Leave";
import { Org } from "@/features/org/Org";
import { Payroll } from "@/features/payroll/Payroll";
import { MyAccount } from "@/features/profile/MyAccount";
import { Recruitment } from "@/features/recruitment/Recruitment";

// useStore() subscribes to tick so newly-created entities trigger a re-render.
export function Router({ route, onNav, onAskAgent }) {
  useStore();
  switch (route.view) {
    case "agent":
      return <AgentWorkspace params={route.params} onNav={onNav} />;
    case "dashboard":
      return <Dashboard onNav={onNav} onAskAgent={onAskAgent} />;
    case "employees":
      return <Employees params={route.params} onNav={onNav} />;
    case "account":
      return <MyAccount onNav={onNav} params={route.params} />;
    case "recruitment":
      return <Recruitment params={route.params} onNav={onNav} />;
    case "leave":
      return <Leave params={route.params} onNav={onNav} />;
    case "attendance":
      return <Attendance params={route.params} onNav={onNav} />;
    case "payroll":
      return <Payroll params={route.params} onNav={onNav} />;
    case "org":
      return <Org onNav={onNav} />;
    case "admin":
      return <Admin params={route.params} onNav={onNav} />;
    case "company":
      return <Company params={route.params} onNav={onNav} />;
    default:
      return <div className="p-6 text-muted-fg">Not found.</div>;
  }
}
