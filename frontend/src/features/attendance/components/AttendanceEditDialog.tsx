import { useEffect, useState } from "react";
import { I } from "@/components/Icons";
import { Button, Dialog, Input, Select, Textarea } from "@/components/ui";
import { FormField, FormFooter, FormGrid, FormHeader } from "@/components/forms";

export function AttendanceEditDialog({ edit, onClose, onSave }) {
  const [form, setForm] = useState<any>({});
  const open = !!edit;
  useEffect(() => {
    if (open) setForm({ ...edit.item });
  }, [open, edit]);
  if (!open) return null;
  const type = edit.type;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Dialog open onClose={onClose} width={540}>
      {" "}
      <FormHeader
        eyebrow="Attendance Â· Update"
        title={`Edit ${type}`}
        sub="Manual changes are audit logged and keep before/after values."
        onClose={onClose}
      />{" "}
      <div className="p-5 space-y-3.5">
        {" "}
        {type === "record" && (
          <>
            {" "}
            <FormGrid>
              {" "}
              <FormField label="Date">
                <Input
                  type="date"
                  value={form.date || ""}
                  onChange={(e) => update("date", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
              <FormField label="Status">
                {" "}
                <Select
                  value={form.status || "present"}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {" "}
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="on-leave">On leave</option>{" "}
                </Select>{" "}
              </FormField>{" "}
            </FormGrid>{" "}
            <FormGrid>
              {" "}
              <FormField label="Check in">
                <Input
                  value={form.in || ""}
                  onChange={(e) => update("in", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
              <FormField label="Check out">
                <Input
                  value={form.out || ""}
                  onChange={(e) => update("out", e.target.value)}
                  className="font-mono"
                />
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
        {type === "shift" && (
          <>
            {" "}
            <FormField label="Name">
              <Input
                value={form.name || ""}
                onChange={(e) => update("name", e.target.value)}
                autoFocus
              />
            </FormField>{" "}
            <FormGrid>
              {" "}
              <FormField label="From">
                <Input
                  value={form.from || ""}
                  onChange={(e) => update("from", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
              <FormField label="To">
                <Input
                  value={form.to || ""}
                  onChange={(e) => update("to", e.target.value)}
                  className="font-mono"
                />
              </FormField>{" "}
            </FormGrid>{" "}
            <FormField label="Break minutes">
              <Input
                type="number"
                value={form.break ?? 0}
                onChange={(e) => update("break", +e.target.value)}
                className="font-mono"
              />
            </FormField>{" "}
          </>
        )}{" "}
        {(type === "overtime" || type === "correction") && (
          <>
            {" "}
            {type === "overtime" && (
              <FormGrid>
                {" "}
                <FormField label="Date">
                  <Input
                    type="date"
                    value={form.date || ""}
                    onChange={(e) => update("date", e.target.value)}
                    className="font-mono"
                  />
                </FormField>{" "}
                <FormField label="Hours">
                  <Input
                    type="number"
                    step="0.5"
                    value={form.hours ?? 0}
                    onChange={(e) => update("hours", +e.target.value)}
                    className="font-mono"
                  />
                </FormField>{" "}
              </FormGrid>
            )}{" "}
            {type === "correction" && (
              <>
                {" "}
                <FormGrid>
                  {" "}
                  <FormField label="Current in">
                    <Input
                      value={form.current?.in || ""}
                      onChange={(e) =>
                        update("current", {
                          ...(form.current || {}),
                          in: e.target.value,
                        })
                      }
                      className="font-mono"
                    />
                  </FormField>{" "}
                  <FormField label="Current out">
                    <Input
                      value={form.current?.out || ""}
                      onChange={(e) =>
                        update("current", {
                          ...(form.current || {}),
                          out: e.target.value,
                        })
                      }
                      className="font-mono"
                    />
                  </FormField>{" "}
                </FormGrid>{" "}
                <FormGrid>
                  {" "}
                  <FormField label="Proposed in">
                    <Input
                      value={form.proposed?.in || ""}
                      onChange={(e) =>
                        update("proposed", {
                          ...(form.proposed || {}),
                          in: e.target.value,
                        })
                      }
                      className="font-mono"
                    />
                  </FormField>{" "}
                  <FormField label="Proposed out">
                    <Input
                      value={form.proposed?.out || ""}
                      onChange={(e) =>
                        update("proposed", {
                          ...(form.proposed || {}),
                          out: e.target.value,
                        })
                      }
                      className="font-mono"
                    />
                  </FormField>{" "}
                </FormGrid>{" "}
              </>
            )}{" "}
            <FormField label="Status">
              {" "}
              <Select
                value={form.status || "pending"}
                onChange={(e) => update("status", e.target.value)}
              >
                {" "}
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>{" "}
              </Select>{" "}
            </FormField>{" "}
            <FormField label="Reason">
              <Textarea
                rows={3}
                value={form.reason || ""}
                onChange={(e) => update("reason", e.target.value)}
              />
            </FormField>{" "}
          </>
        )}{" "}
      </div>{" "}
      <FormFooter>
        {" "}
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>{" "}
        <Button size="md" onClick={() => onSave(type, edit.item, form)}>
          <I.Check size={13} />
          Save changes
        </Button>{" "}
      </FormFooter>{" "}
    </Dialog>
  );
}
