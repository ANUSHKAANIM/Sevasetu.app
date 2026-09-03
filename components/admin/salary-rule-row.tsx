"use client";

import { useActionState } from "react";
import { upsertSalaryRuleAction, toggleSalaryRuleActiveAction, type SalaryRuleFormState } from "@/app/actions/admin-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SKILL_TIER_LABEL, SCOPE_OF_WORK_LABEL } from "@/lib/constants";
import type { EmploymentType, LocationTier, ScopeOfWork, SkillTier } from "@prisma/client";

const initialState: SalaryRuleFormState = {};

export function SalaryRuleRow({
  id,
  serviceCategoryId,
  locationTier,
  skillTier,
  employmentType,
  scopeOfWork,
  baseSalary,
  skillAdjustmentPercent,
  scopeAdjustmentPercent,
  platformFeePercent,
  isActive,
}: {
  id: string;
  serviceCategoryId: string;
  locationTier: LocationTier;
  skillTier: SkillTier;
  employmentType: EmploymentType;
  scopeOfWork: ScopeOfWork;
  baseSalary: number;
  skillAdjustmentPercent: number;
  scopeAdjustmentPercent: number;
  platformFeePercent: number;
  isActive: boolean;
}) {
  const [state, formAction, isPending] = useActionState(upsertSalaryRuleAction, initialState);

  return (
    <form
      action={formAction}
      className="grid grid-cols-2 items-center gap-2 border-b border-border py-2 text-sm sm:grid-cols-8"
    >
      <input type="hidden" name="serviceCategoryId" value={serviceCategoryId} />
      <input type="hidden" name="locationTier" value={locationTier} />
      <input type="hidden" name="skillTier" value={skillTier} />
      <input type="hidden" name="employmentType" value={employmentType} />
      <input type="hidden" name="scopeOfWork" value={scopeOfWork} />

      <div className="col-span-2 sm:col-span-1">
        <p className="text-xs font-medium">{SKILL_TIER_LABEL[skillTier]}</p>
        <p className="text-xs text-muted-foreground">{SCOPE_OF_WORK_LABEL[scopeOfWork]}</p>
      </div>
      <Input name="baseSalary" type="number" step="1" defaultValue={baseSalary} className="h-8" />
      <Input name="skillAdjustmentPercent" type="number" step="0.1" defaultValue={skillAdjustmentPercent} className="h-8" />
      <Input name="scopeAdjustmentPercent" type="number" step="0.1" defaultValue={scopeAdjustmentPercent} className="h-8" />
      <Input name="platformFeePercent" type="number" step="0.1" defaultValue={platformFeePercent} className="h-8" />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => toggleSalaryRuleActiveAction(id)}
      >
        <Badge variant={isActive ? "success" : "outline"}>{isActive ? "Active" : "Inactive"}</Badge>
      </Button>
      {state.error && <p className="col-span-full text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
