import { deptName, positionName } from '@/lib/lookups';
import { I } from '@/components/Icons';
import { Avatar, Button, PageHero } from '@/components/ui';
import { EMPLOYEES } from '@/data/seed';

function OrgCard({ emp, onNav }) {
  const directs = EMPLOYEES.filter((e) => e.manager === emp.id).length;
  return (
    <button
      onClick={() => onNav('employees', emp.id)}
      className="bg-card border border-border rounded-md px-3.5 py-2.5 hover:border-accent/40 hover:shadow-sm focus-ring flex items-center gap-2.5 w-[220px] text-left"
    >
      <Avatar name={`${emp.first} ${emp.last}`} hue={emp.hue} size={36} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium leading-tight truncate">{emp.first} {emp.last}</div>
        <div className="text-[11.5px] text-muted-fg truncate">{positionName(emp.position)}</div>
        <div className="flex items-center gap-2 mt-1 text-[10.5px] text-muted-fg font-mono">
          <span>{deptName(emp.dept)}</span>
          {directs > 0 && <span>· {directs}↓</span>}
        </div>
      </div>
    </button>
  );
}

function OrgBranch({ emp, onNav, depth }) {
  const reports = EMPLOYEES.filter((e) => e.manager === emp.id);
  return (
    <div className="flex flex-col items-center">
      <OrgCard emp={emp} onNav={onNav} />
      {reports.length > 0 && (
        <>
          <div className="w-px h-6 bg-border" />
          <div className="relative">
            {reports.length > 1 && <div className="absolute top-0 left-0 right-0 h-px bg-border" />}
            <div className="flex items-start gap-5 pt-0">
              {reports.map((r) => (
                <div key={r.id} className="flex flex-col items-center">
                  <div className="w-px h-6 bg-border -mt-px" />
                  <OrgBranch emp={r} onNav={onNav} depth={depth + 1} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Org({ onNav }) {
  const roots = EMPLOYEES.filter((e) => !e.manager);
  const managers = EMPLOYEES.filter((e) => EMPLOYEES.some((x) => x.manager === e.id)).length;
  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      <PageHero
        eyebrow="Company · Org chart"
        title="Org chart"
        tone="blue"
        sub="Review reporting lines, managers, and team structure from employee manager relationships."
        actions={
          <>
            <Button variant="outline" size="md"><I.Download size={13} />Export</Button>
            <Button variant="outline" size="md"><I.Sliders size={13} />Layout</Button>
          </>
        }
        metrics={[
          { label: 'Employees', value: EMPLOYEES.length, sub: 'In chart' },
          { label: 'Top level', value: roots.length, sub: 'Root nodes' },
          { label: 'Managers', value: managers, sub: 'With reports' },
          { label: 'Departments', value: new Set(EMPLOYEES.map((e) => e.dept)).size, sub: 'Represented' },
        ]}
      />
      <div className="flex-1 overflow-auto scroll-thin p-6 bg-bg">
        <div className="rounded-xl bg-card border border-border-soft shadow-soft p-8 min-w-max">
          <div className="flex flex-col items-center gap-6 mx-auto">
          {roots.map((r) => (
            <OrgBranch key={r.id} emp={r} onNav={onNav} depth={0} />
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
