"use client";

import { useActionState } from "react";
import {
  createReplacementRequestAction,
  type ReplacementFormState,
} from "@/app/actions/replacement-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: ReplacementFormState = {};

export function ReplacementRequestForm({
  contracts,
  defaultContractId,
}: {
  contracts: { id: string; helperName: string }[];
  defaultContractId?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    createReplacementRequestAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Replacement request submitted. Our team will begin matching shortly.
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="contractId">Contract</Label>
        <Select name="contractId" defaultValue={defaultContractId ?? contracts[0]?.id}>
          <SelectTrigger id="contractId"><SelectValue /></SelectTrigger>
          <SelectContent>
            {contracts.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.helperName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="type">Replacement type</Label>
        <Select name="type" defaultValue="TEMPORARY">
          <SelectTrigger id="type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TEMPORARY">Temporary</SelectItem>
            <SelectItem value="PERMANENT">Permanent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reason">Reason</Label>
        <Textarea id="reason" name="reason" rows={3} required />
      </div>
      <Button type="submit" disabled={isPending || contracts.length === 0}>
        {isPending ? "Submitting..." : "Submit request"}
      </Button>
    </form>
  );
}
