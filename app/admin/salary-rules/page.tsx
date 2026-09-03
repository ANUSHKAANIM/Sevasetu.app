import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SalaryRuleRow } from "@/components/admin/salary-rule-row";
import { EMPLOYMENT_TYPE_LABEL, LOCATION_TIER_LABEL } from "@/lib/constants";
import type { LocationTier } from "@prisma/client";

export const metadata: Metadata = { title: "Salary Rules — SevaSetu Admin" };

export default async function AdminSalaryRulesPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; locationTier?: string }>;
}) {
  await requireAdminContext();
  const params = await searchParams;

  const categories = await prisma.serviceCategory.findMany({ orderBy: { name: "asc" } });
  const serviceCategoryId = params.service ?? categories[0]?.id;
  const locationTier = (params.locationTier ?? "TIER_1") as LocationTier;

  const rules = serviceCategoryId
    ? await prisma.salaryRule.findMany({
        where: { serviceCategoryId, locationTier },
        orderBy: [{ employmentType: "asc" }, { skillTier: "asc" }, { scopeOfWork: "asc" }],
      })
    : [];

  const rulesByEmploymentType = rules.reduce<Record<string, typeof rules>>((acc, r) => {
    (acc[r.employmentType] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Salary rule management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the standardized wage matrix. Changes apply to future salary calculations only —
          existing contracts keep their frozen salary snapshot.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <form className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="service">Service</Label>
              <Select name="service" defaultValue={serviceCategoryId}>
                <SelectTrigger id="service" className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="locationTier">Location tier</Label>
              <Select name="locationTier" defaultValue={locationTier}>
                <SelectTrigger id="locationTier" className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LOCATION_TIER_LABEL).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="sm">Filter</Button>
          </form>
        </CardContent>
      </Card>

      {Object.entries(rulesByEmploymentType).map(([employmentType, group]) => (
        <Card key={employmentType}>
          <CardHeader>
            <CardTitle className="text-base">
              {EMPLOYMENT_TYPE_LABEL[employmentType as keyof typeof EMPLOYMENT_TYPE_LABEL]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 pb-2 text-xs font-medium text-muted-foreground sm:grid-cols-8">
              <span className="sm:col-span-1">Tier / Scope</span>
              <span>Base ₹</span>
              <span>Skill adj %</span>
              <span>Scope adj %</span>
              <span>Fee %</span>
              <span />
              <span />
            </div>
            {group.map((r) => (
              <SalaryRuleRow
                key={r.id}
                id={r.id}
                serviceCategoryId={r.serviceCategoryId}
                locationTier={r.locationTier}
                skillTier={r.skillTier}
                employmentType={r.employmentType}
                scopeOfWork={r.scopeOfWork}
                baseSalary={Number(r.baseSalary)}
                skillAdjustmentPercent={Number(r.skillAdjustmentPercent)}
                scopeAdjustmentPercent={Number(r.scopeAdjustmentPercent)}
                platformFeePercent={Number(r.platformFeePercent)}
                isActive={r.isActive}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {rules.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No salary rules for this combination yet.
        </p>
      )}
    </div>
  );
}
