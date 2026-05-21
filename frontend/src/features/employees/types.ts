import type { ComponentType } from "react";

export type EmployeeStatus = "active" | "archived" | string;

export type Employee = {
  id: string;
  code: string;
  first: string;
  last: string;
  email: string;
  position: string;
  dept: string;
  manager: string | null;
  loc: string;
  hire: string;
  probation_end: string | null;
  status: EmployeeStatus;
  contract: string;
  hue: number;
};

export type EmployeeFilters = {
  query: string;
  status: "active" | "archived" | "all";
  departmentId: string;
  locationId: string;
  contract: string;
  managerId: string;
  grade: string;
  hireYear: string;
  probation: "all" | "yes" | "no";
};

export type EmployeeFilterOptions = {
  contracts: string[];
  managers: Employee[];
  grades: string[];
  hireYears: string[];
};

export type EmployeeDirectoryStats = {
  activeCount: number;
  probationCount: number;
  locationCount: number;
};

export type EmployeeTabItem = {
  id: string;
  label: string;
  sub?: string;
  count?: number;
  icon?: ComponentType<{ size?: number; className?: string }>;
};

export type NavigateToEmployee = (
  view: "employees",
  id?: string | null,
  params?: Record<string, unknown> | null,
) => void;

