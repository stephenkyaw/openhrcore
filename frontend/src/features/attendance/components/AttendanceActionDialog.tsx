import { useEffect, useState } from "react";
import { I } from "@/components/Icons";
import { Button, Dialog, Input, Select, Textarea } from "@/components/ui";
import { FormField, FormFooter, FormGrid, FormHeader } from "@/components/forms";
import { actionDefaults, departmentOptions, employeeOptions, shiftOptions, WEEK_DAYS } from "./AttendancePrimitives";

export function AttendanceActionDialog({ action, onClose, onSubmit }) {
  const [form, setForm] = useState<any>(actionDefaults(action));
  useEffect(() => {
    if (action) setForm(actionDefaults(action));
  }, [action]);
  if (!action) return null;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const title = action.action.replaceAll("_", " ");
  const needsNote = ![
    "new_overtime_request",
    "request_correction",
    "new_shift",
  ].includes(action.action);
  return (
    <Dialog open onClose={onClose} width={620}>
      {" "}
      <FormHeader
        eyebrow="Attendance Â· Action form"
        title={title}
        sub="Complete the action details. Submissions update the roster data and write an audit event."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        {action.action === "new_shift" && (
          <>
            {" "}
            <FormField label="Shift name">
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                autoFocus
              />
            </FormField>{" "}
            <FormGrid>
              {" "}
              <FormField label="Start">
                <Input
                  value={form.from}
                  onChange={(e) => update("from", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
              <FormField label="End">
                <Input
                  value={form.to}
                  onChange={(e) => update("to", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormGrid>
              {" "}
              <FormField label="Break minutes">
                <Input
                  type="number"
                  value={form.break}
                  onChange={(e) => update("break", +e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
              <FormField label="Color hue">
                <Input
                  type="number"
                  min="0"
                  max="360"
                  value={form.color}
                  onChange={(e) => update("color", +e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
          </>
        )}{" "}
        {(action.action === "assign_shift" ||
          action.action === "add_to_roster") && (
          <>
            {" "}
            <FormGrid>
              {" "}
              <FormField label="Employee">
                {" "}
                <Select
                  value={form.employee}
                  onChange={(e) => update("employee", e.target.value)}
                >
                  {employeeOptions()}
                </Select>{" "}
              </FormField>{" "}
              <FormField label="Effective date">
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormGrid>
              {" "}
              <FormField
                label={
                  action.action === "assign_shift"
                    ? "Roster day"
                    : "Primary shift"
                }
              >
                {" "}
                {action.action === "assign_shift" ? (
                  <Select
                    value={form.day}
                    onChange={(e) => update("day", e.target.value)}
                  >
                    {" "}
                    {WEEK_DAYS.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}{" "}
                  </Select>
                ) : (
                  <Select
                    value={form.shiftId}
                    onChange={(e) => update("shiftId", e.target.value)}
                  >
                    {shiftOptions()}
                  </Select>
                )}{" "}
              </FormField>{" "}
              <FormField
                label={
                  action.action === "assign_shift" ? "Shift" : "Roster template"
                }
              >
                {" "}
                {action.action === "assign_shift" ? (
                  <Select
                    value={form.shiftId}
                    onChange={(e) => update("shiftId", e.target.value)}
                  >
                    {shiftOptions({ includeOff: true })}
                  </Select>
                ) : (
                  <Select
                    value={form.rosterTemplate}
                    onChange={(e) => update("rosterTemplate", e.target.value)}
                  >
                    {" "}
                    <option value="weekdays">Weekdays only</option>{" "}
                    <option value="full-week">Full week</option>{" "}
                    <option value="weekend">Weekend only</option>{" "}
                  </Select>
                )}{" "}
              </FormField>{" "}
            </FormGrid>{" "}
            {action.action === "add_to_roster" && (
              <FormField label="Repeat weeks">
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={form.repeatWeeks}
                  onChange={(e) => update("repeatWeeks", +e.target.value)}
                  className="font-mono"
                />
              </FormField>
            )}{" "}
          </>
        )}{" "}
        {action.action === "apply_rotation" && (
          <>
            {" "}
            <FormGrid>
              {" "}
              <FormField label="Pattern">
                {" "}
                <Select
                  value={form.pattern}
                  onChange={(e) => update("pattern", e.target.value)}
                >
                  {" "}
                  <option>Weekly rotation Â· Late shift</option>{" "}
                  <option>Weekend on-call Â· pair</option>{" "}
                  <option>Night shift rotation</option>{" "}
                </Select>{" "}
              </FormField>{" "}
              <FormField label="Department">
                <Select
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                >
                  {departmentOptions()}
                </Select>
              </FormField>{" "}
            </FormGrid>{" "}
            <FormGrid>
              {" "}
              <FormField label="Start date">
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
              <FormField label="End date">
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormField label="Conflict policy">
              {" "}
              <Select
                value={form.conflictPolicy}
                onChange={(e) => update("conflictPolicy", e.target.value)}
              >
                {" "}
                <option value="skip-approved">
                  Skip approved leave and locked shifts
                </option>{" "}
                <option value="overwrite-draft">
                  Overwrite draft roster only
                </option>{" "}
                <option value="require-review">
                  Create manager review queue
                </option>{" "}
              </Select>{" "}
            </FormField>{" "}
          </>
        )}{" "}
        {(action.action === "new_pattern" ||
          action.action === "edit_pattern") && (
          <>
            {" "}
            <FormField label="Pattern name">
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                autoFocus
              />
            </FormField>{" "}
            <FormGrid>
              {" "}
              <FormField label="Period">
                <Input
                  value={form.period}
                  onChange={(e) => update("period", e.target.value)}
                />
              </FormField>{" "}
              <FormField label="Effective date">
                <Input
                  type="date"
                  value={form.effectiveDate}
                  onChange={(e) => update("effectiveDate", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormField label="Sequence">
              <Textarea
                rows={3}
                value={form.sequence}
                onChange={(e) => update("sequence", e.target.value)}
                placeholder="Standard, Standard, Late, Late"
              />
            </FormField>{" "}
            <FormField label="Target department">
              <Select
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
              >
                {departmentOptions()}
              </Select>
            </FormField>{" "}
          </>
        )}{" "}
        {action.action === "new_overtime_request" && (
          <>
            {" "}
            <FormGrid>
              {" "}
              <FormField label="Employee">
                <Select
                  value={form.employee}
                  onChange={(e) => update("employee", e.target.value)}
                >
                  {employeeOptions()}
                </Select>
              </FormField>{" "}
              <FormField label="Date">
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormGrid>
              {" "}
              <FormField label="Hours">
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={form.hours}
                  onChange={(e) => update("hours", +e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
              <FormField label="Approver">
                <Input
                  value={form.approver}
                  onChange={(e) => update("approver", e.target.value)}
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormField label="Reason">
              <Textarea
                rows={3}
                value={form.reason}
                onChange={(e) => update("reason", e.target.value)}
              />
            </FormField>{" "}
          </>
        )}{" "}
        {action.action === "new_record" && (
          <>
            {" "}
            <FormGrid>
              {" "}
              <FormField label="Employee">
                <Select
                  value={form.employee}
                  onChange={(e) => update("employee", e.target.value)}
                >
                  {employeeOptions()}
                </Select>
              </FormField>{" "}
              <FormField label="Date">
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormGrid>
              {" "}
              <FormField label="Check in">
                <Input
                  value={form.in}
                  onChange={(e) => update("in", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
              <FormField label="Check out">
                <Input
                  value={form.out}
                  onChange={(e) => update("out", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormGrid>
              {" "}
              <FormField label="Status">
                {" "}
                <Select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {" "}
                  <option value="present">Present</option>{" "}
                  <option value="late">Late</option>{" "}
                  <option value="on-leave">On leave</option>{" "}
                </Select>{" "}
              </FormField>{" "}
              <FormField label="Source">
                {" "}
                <Select
                  value={form.source}
                  onChange={(e) => update("source", e.target.value)}
                >
                  {" "}
                  <option value="manual">Manual</option>{" "}
                  <option value="kiosk">Kiosk</option>{" "}
                  <option value="web">Web</option>{" "}
                  <option value="mobile">Mobile</option>{" "}
                </Select>{" "}
              </FormField>{" "}
            </FormGrid>{" "}
            <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
              {" "}
              <input
                type="checkbox"
                checked={!!form.wfh}
                onChange={(e) => update("wfh", e.target.checked)}
                className="accent-current"
              />{" "}
              <span>Working from home</span>{" "}
            </label>{" "}
          </>
        )}{" "}
        {action.action === "request_correction" && (
          <>
            {" "}
            <FormGrid>
              {" "}
              <FormField label="Employee">
                <Select
                  value={form.employee}
                  onChange={(e) => update("employee", e.target.value)}
                >
                  {employeeOptions()}
                </Select>
              </FormField>{" "}
              <FormField label="Date">
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormField label="Correction type">
              {" "}
              <Select
                value={form.kind}
                onChange={(e) => update("kind", e.target.value)}
              >
                {" "}
                <option value="forgot-checkin">Forgot check-in</option>{" "}
                <option value="forgot-checkout">Forgot check-out</option>{" "}
                <option value="wrong-time">Wrong time</option>{" "}
              </Select>{" "}
            </FormField>{" "}
            <FormGrid>
              {" "}
              <FormField label="Current in">
                <Input
                  value={form.currentIn}
                  onChange={(e) => update("currentIn", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
              <FormField label="Current out">
                <Input
                  value={form.currentOut}
                  onChange={(e) => update("currentOut", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormGrid>
              {" "}
              <FormField label="Proposed in">
                <Input
                  value={form.proposedIn}
                  onChange={(e) => update("proposedIn", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
              <FormField label="Proposed out">
                <Input
                  value={form.proposedOut}
                  onChange={(e) => update("proposedOut", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormField label="Reason">
              <Textarea
                rows={3}
                value={form.reason}
                onChange={(e) => update("reason", e.target.value)}
              />
            </FormField>{" "}
          </>
        )}{" "}
        {action.action === "bulk_regularize" && (
          <>
            {" "}
            <FormGrid>
              {" "}
              <FormField label="Department">
                <Select
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                >
                  {departmentOptions()}
                </Select>
              </FormField>{" "}
              <FormField label="Status">
                {" "}
                <Select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {" "}
                  <option value="present">Present</option>{" "}
                  <option value="late">Late</option>{" "}
                  <option value="on-leave">On leave</option>{" "}
                </Select>{" "}
              </FormField>{" "}
            </FormGrid>{" "}
            <FormGrid>
              {" "}
              <FormField label="From">
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
              <FormField label="To">
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormField label="Source">
              <Input
                value={form.source}
                onChange={(e) => update("source", e.target.value)}
              />
            </FormField>{" "}
          </>
        )}{" "}
        {needsNote && (
          <FormField label="Audit note">
            <Textarea
              rows={2}
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              placeholder="Optional audit note"
            />
          </FormField>
        )}{" "}
      </div>{" "}
      <FormFooter>
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button size="md" onClick={() => onSubmit(form)}>
          <I.Check size={13} />
          Submit
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
