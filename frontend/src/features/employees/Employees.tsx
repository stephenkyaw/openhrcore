import { EmployeeDetail } from "./components/EmployeeDetail";
import { EmployeeDirectory } from "./components/EmployeeDirectory";
import type { NavigateToEmployee } from "./types";

type EmployeesProps = {
  params?: {
    id?: string;
    tab?: string;
  } | null;
  onNav: NavigateToEmployee;
};

export function Employees({ params, onNav }: EmployeesProps) {
  if (params?.id) {
    return <EmployeeDetail id={params.id} params={params} onNav={onNav} />;
  }

  return <EmployeeDirectory onNav={onNav} />;
}
