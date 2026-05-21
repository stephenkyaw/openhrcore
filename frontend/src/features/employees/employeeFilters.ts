import { TODAY } from "@/lib/dates";
import { deptName, locationName, positionName } from "@/lib/lookups";
import { POSITIONS } from "@/data/seed";
import type {
  Employee,
  EmployeeDirectoryStats,
  EmployeeFilterOptions,
  EmployeeFilters,
} from "./types";

export const DEFAULT_EMPLOYEE_FILTERS: EmployeeFilters = {
  query: "",
  status: "active",
  departmentId: "all",
  locationId: "all",
  contract: "all",
  managerId: "all",
  grade: "all",
  hireYear: "all",
  probation: "all",
};

export const EMPLOYEE_STATUS_TABS = [
  { id: "active", label: "Active" },
  { id: "archived", label: "Archived" },
  { id: "all", label: "All" },
] as const;

export function isOnProbation(employee: Employee): boolean {
  return Boolean(
    employee.probation_end &&
      new Date(employee.probation_end).getTime() > new Date(`${TODAY}T00:00:00`).getTime(),
  );
}

export function getEmployeeGrade(employee: Employee): string {
  return POSITIONS.find((position) => position.id === employee.position)?.grade || "";
}

export function getEmployeeSearchText(employee: Employee): string {
  return [
    employee.first,
    employee.last,
    employee.email,
    employee.code,
    positionName(employee.position),
    deptName(employee.dept),
    locationName(employee.loc),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterEmployees(
  employees: Employee[],
  filters: EmployeeFilters,
): Employee[] {
  const query = filters.query.trim().toLowerCase();

  return employees.filter((employee) => {
    const onProbation = isOnProbation(employee);
    const grade = getEmployeeGrade(employee);

    if (filters.status !== "all" && employee.status !== filters.status) return false;
    if (filters.departmentId !== "all" && employee.dept !== filters.departmentId) return false;
    if (filters.locationId !== "all" && employee.loc !== filters.locationId) return false;
    if (filters.contract !== "all" && employee.contract !== filters.contract) return false;
    if (filters.managerId !== "all" && (employee.manager || "none") !== filters.managerId) return false;
    if (filters.grade !== "all" && grade !== filters.grade) return false;
    if (filters.hireYear !== "all" && !employee.hire.startsWith(filters.hireYear)) return false;
    if (filters.probation === "yes" && !onProbation) return false;
    if (filters.probation === "no" && onProbation) return false;
    if (query && !getEmployeeSearchText(employee).includes(query)) return false;

    return true;
  });
}

export function getEmployeeFilterOptions(employees: Employee[]): EmployeeFilterOptions {
  return {
    contracts: Array.from(new Set(employees.map((employee) => employee.contract))).filter(Boolean),
    managers: employees.filter((employee) =>
      employees.some((candidate) => candidate.manager === employee.id),
    ),
    grades: Array.from(new Set(POSITIONS.map((position) => position.grade))).sort(),
    hireYears: Array.from(new Set(employees.map((employee) => employee.hire.slice(0, 4))))
      .sort()
      .reverse(),
  };
}

export function getEmployeeDirectoryStats(employees: Employee[]): EmployeeDirectoryStats {
  return {
    activeCount: employees.filter((employee) => employee.status === "active").length,
    probationCount: employees.filter(isOnProbation).length,
    locationCount: new Set(employees.map((employee) => employee.loc)).size,
  };
}

export function hasAdvancedEmployeeFilters(filters: EmployeeFilters): boolean {
  return (
    filters.contract !== "all" ||
    filters.managerId !== "all" ||
    filters.grade !== "all" ||
    filters.hireYear !== "all" ||
    filters.probation !== "all"
  );
}

export function hasAnyEmployeeFilter(filters: EmployeeFilters): boolean {
  return (
    filters.query !== "" ||
    filters.status !== DEFAULT_EMPLOYEE_FILTERS.status ||
    filters.departmentId !== "all" ||
    filters.locationId !== "all" ||
    hasAdvancedEmployeeFilters(filters)
  );
}

