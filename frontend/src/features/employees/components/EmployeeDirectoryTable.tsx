import { deptName, empName, locationName, positionName } from "@/lib/lookups";
import { I } from "@/components/Icons";
import {
  Avatar,
  Badge,
  Empty,
  TD,
  TH,
  THead,
  TR,
  Table,
} from "@/components/ui";
import { POSITIONS } from "@/data/seed";
import { getEmployeeGrade, isOnProbation } from "../employeeFilters";
import type { Employee, NavigateToEmployee } from "../types";

type EmployeeDirectoryTableProps = {
  employees: Employee[];
  allEmployees: Employee[];
  onNav: NavigateToEmployee;
};

export function EmployeeDirectoryTable({
  employees,
  allEmployees,
  onNav,
}: EmployeeDirectoryTableProps) {
  if (employees.length === 0) {
    return (
      <Empty
        title="No employees match"
        sub="Try clearing some filters."
      />
    );
  }

  return (
    <Table>
      <THead>
        <TR className="hover:bg-transparent">
          <TH className="w-[340px]">Employee</TH>
          <TH>Work</TH>
          <TH>Department</TH>
          <TH>Manager</TH>
          <TH>Location</TH>
          <TH>Lifecycle</TH>
          <TH>Status</TH>
          <TH />
        </TR>
      </THead>
      <tbody>
        {employees.map((employee) => {
          const onProbation = isOnProbation(employee);
          const reports = allEmployees.filter((item) => item.manager === employee.id).length;
          const grade = getEmployeeGrade(employee);
          const initials = `${employee.first?.[0] || ""}${employee.last?.[0] || ""}`;
          const positionExists = POSITIONS.some((position) => position.id === employee.position);

          return (
            <TR
              key={employee.id}
              className="cursor-pointer group"
              onClick={() => onNav("employees", employee.id)}
            >
              <TD>
                <div className="flex items-center gap-3">
                  <div className="relative flex-none">
                    <Avatar
                      name={`${employee.first} ${employee.last}`}
                      hue={employee.hue}
                      size={42}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-card border border-border-soft text-[8.5px] font-semibold flex items-center justify-center">
                      {initials}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold leading-tight">
                      {employee.first} {employee.last}
                    </div>
                    <div className="text-[12px] text-muted-fg truncate">
                      {employee.email}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge tone="outline" size="sm" className="font-mono">
                        {employee.code}
                      </Badge>
                      <Badge tone="outline" size="sm">
                        {employee.contract}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TD>

              <TD>
                <div className="text-[12.5px] font-medium">
                  {positionExists ? positionName(employee.position) : "Unassigned"}
                </div>
                <div className="text-[11.5px] text-muted-fg">
                  Grade {grade || "-"} · {reports} report{reports === 1 ? "" : "s"}
                </div>
              </TD>

              <TD className="text-[12.5px]">{deptName(employee.dept)}</TD>
              <TD className="text-[12.5px] text-muted-fg">
                {employee.manager ? (
                  empName(employee.manager)
                ) : (
                  <span className="text-muted-fg/60">-</span>
                )}
              </TD>
              <TD className="text-[12.5px]">{locationName(employee.loc)}</TD>
              <TD>
                <div className="text-[12px] font-mono">{employee.hire}</div>
                <div className="text-[11px] text-muted-fg">
                  {onProbation
                    ? `Probation ends ${employee.probation_end}`
                    : "Confirmed employee"}
                </div>
              </TD>
              <TD>
                {onProbation ? (
                  <Badge tone="warn">
                    <I.Clock size={10} />
                    Probation
                  </Badge>
                ) : (
                  <Badge tone="ok">
                    <I.CircleDot size={9} />
                    Active
                  </Badge>
                )}
              </TD>
              <TD className="text-right">
                <button
                  type="button"
                  aria-label={`Open actions for ${employee.first} ${employee.last}`}
                  className="text-muted-fg hover:text-fg p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(event) => event.stopPropagation()}
                >
                  <I.More size={14} />
                </button>
              </TD>
            </TR>
          );
        })}
      </tbody>
    </Table>
  );
}

