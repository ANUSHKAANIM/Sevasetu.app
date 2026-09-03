"use client";

import { useActionState } from "react";
import { submitLeaveRequestAction, type LeaveFormState } from "@/app/actions/leave-actions";
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

const initialState: LeaveFormState = {};

export function LeaveRequestForm({
  contracts,
}: {
  contracts: { id: string; label: string }[];
}) {
  const [state, formAction, isPending] = useActionState(submitLeaveRequestAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {state.error && (
        <p className="sm:col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="sm:col-span-2 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Leave request submitted.
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="contractId">Contract</Label>
        <Select name="contractId" defaultValue={contracts[0]?.id}>
          <SelectTrigger id="contractId"><SelectValue /></SelectTrigger>
          <SelectContent>
            {contracts.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="leaveType">Leave type</Label>
        <Select name="leaveType" defaultValue="ANNUAL">
          <SelectTrigger id="leaveType"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ANNUAL">Annual</SelectItem>
            <SelectItem value="SICK">Sick</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="startDate">Start date</Label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="endDate">End date</Label>
        <Input id="endDate" name="endDate" type="date" required />
      </div>
      <div className="sm:col-span-2 space-y-1.5">
        <Label htmlFor="reason">Reason</Label>
        <Textarea id="reason" name="reason" rows={2} required />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending || contracts.length === 0}>
          {isPending ? "Submitting..." : "Submit leave request"}
        </Button>
      </div>
    </form>
  );
}
