import { useMemo, useState } from "react";
import { I } from "@/components/Icons";
import {
  Button,
  Card,
  PageShell,
} from "@/components/ui";
import { NewEmployeeDialog } from "@/components/forms";
import { useStore } from "@/data/store";
import {
  DEFAULT_EMPLOYEE_FILTERS,
  filterEmployees,
  getEmployeeDirectoryStats,
  getEmployeeFilterOptions,
} from "../employeeFilters";
import type { Employee, EmployeeFilters, NavigateToEmployee } from "../types";
import { EmployeeDirectoryFilters } from "./EmployeeDirectoryFilters";
import { EmployeeDirectoryTable } from "./EmployeeDirectoryTable";

type EmployeeDirectoryProps = {
  onNav: NavigateToEmployee;
};

export function EmployeeDirectory({ onNav }: EmployeeDirectoryProps) {
  const { employees } = useStore();
  const employeeRows = employees as Employee[];
  const [filters, setFilters] = useState<EmployeeFilters>(DEFAULT_EMPLOYEE_FILTERS);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const filteredEmployees = useMemo(
    () => filterEmployees(employeeRows, filters),
    [employeeRows, filters],
  );
  const filterOptions = useMemo(
    () => getEmployeeFilterOptions(employeeRows),
    [employeeRows],
  );
  const stats = useMemo(
    () => getEmployeeDirectoryStats(employeeRows),
    [employeeRows],
  );

  return (
    <PageShell
      eyebrow="People · Employees"
      title="Employee system of record"
      sub="Search profiles, reporting lines, contracts, leave context, and lifecycle history from one operational table."
      stats={[
        { value: stats.activeCount, label: "active" },
        { value: stats.probationCount, label: "probation" },
        { value: stats.locationCount, label: "locations" },
        { value: filteredEmployees.length, label: "shown" },
      ]}
      actions={
        <>
          <Button variant="outline" size="md">
            <I.Download size={13} />
            Export
          </Button>
          <Button variant="primary" size="md" onClick={() => setAddOpen(true)}>
            <I.Plus size={13} />
            Add employee
          </Button>
        </>
      }
    >
      <div className="px-7 py-6 flex-1 overflow-hidden">
        <Card className="overflow-hidden h-full flex flex-col">
          <EmployeeDirectoryFilters
            filters={filters}
            options={filterOptions}
            advancedOpen={advancedOpen}
            shownCount={filteredEmployees.length}
            totalCount={employeeRows.length}
            onAdvancedOpenChange={setAdvancedOpen}
            onFiltersChange={setFilters}
            onReset={() => setFilters(DEFAULT_EMPLOYEE_FILTERS)}
          />

          <div className="flex-1 overflow-y-auto scroll-thin bg-card">
            <EmployeeDirectoryTable
              employees={filteredEmployees}
              allEmployees={employeeRows}
              onNav={onNav}
            />
          </div>
        </Card>
      </div>

      <NewEmployeeDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(id: string) => onNav("employees", id)}
      />
    </PageShell>
  );
}

