"use client";

import { useActionState } from "react";
import { markAttendanceAction, type AttendanceFormState } from "@/app/actions/attendance-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: AttendanceFormState = {};

export function AttendanceForm({
  contracts,
}: {
  contracts: { id: string; helperName: string }[];
}) {
  const [state, formAction, isPending] = useActionState(markAttendanceAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {state.error && (
        <p className="sm:col-span-2 lg:col-span-5 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="sm:col-span-2 lg:col-span-5 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Attendance recorded.
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="contractId">Helper</Label>
        <Select name="contractId" defaultValue={contracts[0]?.id}>
          <SelectTrigger id="contractId"><SelectValue /></SelectTrigger>
          <SelectContent>
            {contracts.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.helperName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" defaultValue={today} max={today} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue="PRESENT">
          <SelectTrigger id="status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PRESENT">Present</SelectItem>
            <SelectItem value="ABSENT">Absent</SelectItem>
            <SelectItem value="LEAVE">Leave</SelectItem>
            <SelectItem value="HALF_DAY">Half day</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 lg:col-span-1">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" rows={1} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isPending || contracts.length === 0} className="w-full">
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
