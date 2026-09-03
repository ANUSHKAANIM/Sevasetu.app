"use client";

import { useActionState } from "react";
import { createGrievanceAction, type GrievanceFormState } from "@/app/actions/grievance-actions";
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

const initialState: GrievanceFormState = {};

const CATEGORIES = [
  { value: "PAYMENT_ISSUE", label: "Payment issue" },
  { value: "WORKPLACE_CONCERN", label: "Workplace concern" },
  { value: "ATTENDANCE_DISPUTE", label: "Attendance dispute" },
  { value: "LEAVE_DISPUTE", label: "Leave dispute" },
  { value: "OTHER", label: "Other" },
];

export function GrievanceForm({
  contracts,
  defaultContractId,
}: {
  contracts?: { id: string; label: string }[];
  defaultContractId?: string;
}) {
  const [state, formAction, isPending] = useActionState(createGrievanceAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Your grievance has been submitted. Our team will review it shortly.
        </p>
      )}
      {contracts && contracts.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="contractId">Related contract (optional)</Label>
          <Select name="contractId" defaultValue={defaultContractId}>
            <SelectTrigger id="contractId"><SelectValue placeholder="Not specific to a contract" /></SelectTrigger>
            <SelectContent>
              {contracts.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue="OTHER">
          <SelectTrigger id="category"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} required />
      </div>
      <p className="text-xs text-muted-foreground">
        For safety emergencies, please contact local emergency services directly — SevaSetu&apos;s
        grievance system is not a substitute for emergency response.
      </p>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit grievance"}
      </Button>
    </form>
  );
}
