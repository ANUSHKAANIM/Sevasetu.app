"use client";

import { useActionState } from "react";
import {
  addHelperServiceAction,
  removeHelperServiceAction,
  type HelperProfileFormState,
} from "@/app/actions/helper-profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const initialState: HelperProfileFormState = {};

export function ServicesManager({
  currentServices,
  allCategories,
}: {
  currentServices: { id: string; name: string; yearsExperience: number }[];
  allCategories: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(addHelperServiceAction, initialState);

  return (
    <div className="space-y-4">
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex flex-wrap gap-2">
        {currentServices.map((s) => (
          <Badge key={s.id} variant="secondary" className="gap-1.5 pr-1">
            {s.name} ({s.yearsExperience} yrs)
            <form action={removeHelperServiceAction.bind(null, s.id)}>
              <button type="submit" className="rounded-full p-0.5 hover:bg-black/10" aria-label={`Remove ${s.name}`}>
                <X className="h-3 w-3" />
              </button>
            </form>
          </Badge>
        ))}
        {currentServices.length === 0 && (
          <p className="text-sm text-muted-foreground">No services added yet.</p>
        )}
      </div>
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px]">
          <Select name="serviceCategoryId">
            <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
            <SelectContent>
              {allCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Input name="yearsExperience" type="number" min={0} placeholder="Years" className="w-24" />
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Adding..." : "Add service"}
        </Button>
      </form>
    </div>
  );
}
