import type { ChangeEvent } from "react";
import { deptName, empName, locationName } from "@/lib/lookups";
import { I } from "@/components/Icons";
import {
  Badge,
  Button,
  FilterChip,
  Input,
  Select,
} from "@/components/ui";
import { DEPARTMENTS, LOCATIONS } from "@/data/seed";
import {
  EMPLOYEE_STATUS_TABS,
  hasAdvancedEmployeeFilters,
  hasAnyEmployeeFilter,
} from "../employeeFilters";
import type {
  EmployeeFilterOptions,
  EmployeeFilters,
} from "../types";

type EmployeeDirectoryFiltersProps = {
  filters: EmployeeFilters;
  options: EmployeeFilterOptions;
  advancedOpen: boolean;
  shownCount: number;
  totalCount: number;
  onAdvancedOpenChange: (open: boolean) => void;
  onFiltersChange: (filters: EmployeeFilters) => void;
  onReset: () => void;
};

export function EmployeeDirectoryFilters({
  filters,
  options,
  advancedOpen,
  shownCount,
  totalCount,
  onAdvancedOpenChange,
  onFiltersChange,
  onReset,
}: EmployeeDirectoryFiltersProps) {
  const activeAdvanced = hasAdvancedEmployeeFilters(filters);
  const hasFilters = hasAnyEmployeeFilter(filters);
  const updateFilter = <Key extends keyof EmployeeFilters>(
    key: Key,
    value: EmployeeFilters[Key],
  ) => onFiltersChange({ ...filters, [key]: value });

  return (
    <div className="border-b border-border-soft bg-card">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="relative flex-1 max-w-[460px]">
          <I.Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg"
          />
          <Input
            value={filters.query}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateFilter("query", event.target.value)
            }
            placeholder="Search name, email, code, position, department"
            className="pl-8 h-9 bg-card"
          />
        </div>

        <div className="h-9 inline-flex items-center bg-surface border border-border-soft rounded-md p-0.5">
          {EMPLOYEE_STATUS_TABS.map((status) => {
            const active = filters.status === status.id;
            return (
              <button
                key={status.id}
                type="button"
                onClick={() => updateFilter("status", status.id)}
                className={[
                  "h-7 px-3 rounded text-[12.5px] font-medium focus-ring transition-all",
                  active
                    ? "bg-card text-fg border border-border-soft shadow-soft-sm"
                    : "text-muted-fg hover:text-fg hover:bg-muted/50 border border-transparent",
                ].join(" ")}
              >
                {status.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Select
            value={filters.departmentId}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateFilter("departmentId", event.target.value)
            }
            className="w-44 h-9 bg-card"
          >
            <option value="all">All departments</option>
            {DEPARTMENTS.filter((department) => !department.parent).map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>

          <Select
            value={filters.locationId}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateFilter("locationId", event.target.value)
            }
            className="w-40 h-9 bg-card"
          >
            <option value="all">All locations</option>
            {LOCATIONS.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>

          <Button
            variant={activeAdvanced ? "secondary" : "outline"}
            size="md"
            onClick={() => onAdvancedOpenChange(!advancedOpen)}
            className="h-9"
          >
            <I.Filter size={12} />
            Advanced
            {activeAdvanced && <Badge tone="accent" size="sm">On</Badge>}
          </Button>
        </div>
      </div>

      {advancedOpen && (
        <div className="px-4 pb-3 grid grid-cols-2 lg:grid-cols-5 gap-2">
          <Select
            value={filters.contract}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateFilter("contract", event.target.value)
            }
            className="h-9 bg-card"
          >
            <option value="all">All contracts</option>
            {options.contracts.map((contract) => (
              <option key={contract} value={contract}>
                {contract}
              </option>
            ))}
          </Select>

          <Select
            value={filters.managerId}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateFilter("managerId", event.target.value)
            }
            className="h-9 bg-card"
          >
            <option value="all">All managers</option>
            <option value="none">No manager</option>
            {options.managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.first} {manager.last}
              </option>
            ))}
          </Select>

          <Select
            value={filters.grade}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateFilter("grade", event.target.value)
            }
            className="h-9 bg-card"
          >
            <option value="all">All grades</option>
            {options.grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </Select>

          <Select
            value={filters.hireYear}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateFilter("hireYear", event.target.value)
            }
            className="h-9 bg-card"
          >
            <option value="all">All hire years</option>
            {options.hireYears.map((hireYear) => (
              <option key={hireYear} value={hireYear}>
                Hired {hireYear}
              </option>
            ))}
          </Select>

          <Select
            value={filters.probation}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateFilter("probation", event.target.value as EmployeeFilters["probation"])
            }
            className="h-9 bg-card"
          >
            <option value="all">All probation</option>
            <option value="yes">On probation</option>
            <option value="no">Not on probation</option>
          </Select>
        </div>
      )}

      <div className="px-4 py-2 bg-surface/70 border-t border-border-soft flex items-center gap-2 text-[12px]">
        <span className="font-mono text-muted-fg tabular-nums">
          {shownCount} / {totalCount}
        </span>
        <span className="text-muted-fg">employees shown</span>

        {filters.query && (
          <FilterChip onClear={() => updateFilter("query", "")}>
            Search: {filters.query}
          </FilterChip>
        )}
        {filters.status !== "all" && (
          <FilterChip onClear={() => updateFilter("status", "all")}>
            Status: {EMPLOYEE_STATUS_TABS.find((status) => status.id === filters.status)?.label}
          </FilterChip>
        )}
        {filters.departmentId !== "all" && (
          <FilterChip onClear={() => updateFilter("departmentId", "all")}>
            Dept: {deptName(filters.departmentId)}
          </FilterChip>
        )}
        {filters.locationId !== "all" && (
          <FilterChip onClear={() => updateFilter("locationId", "all")}>
            Location: {locationName(filters.locationId)}
          </FilterChip>
        )}
        {filters.contract !== "all" && (
          <FilterChip onClear={() => updateFilter("contract", "all")}>
            Contract: {filters.contract}
          </FilterChip>
        )}
        {filters.managerId !== "all" && (
          <FilterChip onClear={() => updateFilter("managerId", "all")}>
            Manager: {filters.managerId === "none" ? "No manager" : empName(filters.managerId)}
          </FilterChip>
        )}
        {filters.grade !== "all" && (
          <FilterChip onClear={() => updateFilter("grade", "all")}>
            Grade: {filters.grade}
          </FilterChip>
        )}
        {filters.hireYear !== "all" && (
          <FilterChip onClear={() => updateFilter("hireYear", "all")}>
            Hired: {filters.hireYear}
          </FilterChip>
        )}
        {filters.probation !== "all" && (
          <FilterChip onClear={() => updateFilter("probation", "all")}>
            Probation: {filters.probation === "yes" ? "Yes" : "No"}
          </FilterChip>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto text-[12px] text-muted-fg hover:text-fg inline-flex items-center gap-1.5 focus-ring rounded px-2 py-1"
          >
            <I.X size={11} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
