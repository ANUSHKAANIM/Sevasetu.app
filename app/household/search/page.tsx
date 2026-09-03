import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchX } from "lucide-react";
import {
  CITIES,
  SKILL_TIER_LABEL,
  EMPLOYMENT_TYPE_LABEL,
  VERIFICATION_STATUS_LABEL,
} from "@/lib/constants";

export const metadata: Metadata = { title: "Find Helpers — SevaSetu" };

interface SearchParams {
  service?: string;
  city?: string;
  employmentType?: string;
  skillTier?: string;
  minExperience?: string;
  verification?: string;
}

export default async function HouseholdSearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireHouseholdContext();
  const params = await searchParams;

  const categories = await prisma.serviceCategory.findMany({ orderBy: { name: "asc" } });

  const where: Prisma.HelperProfileWhereInput = {
    identityVerification: params.verification === "ALL" ? undefined : "VERIFIED",
  };
  if (params.city) where.city = params.city;
  if (params.skillTier) where.skillTier = params.skillTier as never;
  if (params.minExperience) {
    where.experienceYears = { gte: Number(params.minExperience) };
  }
  if (params.employmentType) {
    where.employmentTypePref = { has: params.employmentType as never };
  }
  if (params.service) {
    where.helperServices = { some: { serviceCategory: { slug: params.service } } };
  }

  const helpers = await prisma.helperProfile.findMany({
    where,
    include: {
      user: true,
      helperServices: { include: { serviceCategory: true } },
      reviews: true,
    },
    orderBy: { experienceYears: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Find helpers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search verified service professionals by service, location and skill tier.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <FilterSelect
              name="service"
              label="Service"
              defaultValue={params.service}
              placeholder="Any service"
              options={categories.map((c) => ({ value: c.slug, label: c.name }))}
            />
            <FilterSelect
              name="city"
              label="City"
              defaultValue={params.city}
              placeholder="Any city"
              options={CITIES.map((c) => ({ value: c, label: c }))}
            />
            <FilterSelect
              name="employmentType"
              label="Availability"
              defaultValue={params.employmentType}
              placeholder="Any"
              options={Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <FilterSelect
              name="skillTier"
              label="Skill tier"
              defaultValue={params.skillTier}
              placeholder="Any tier"
              options={Object.entries(SKILL_TIER_LABEL).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <div className="space-y-1.5">
              <Label htmlFor="minExperience">Min. experience (yrs)</Label>
              <Input
                id="minExperience"
                name="minExperience"
                type="number"
                min={0}
                defaultValue={params.minExperience}
              />
            </div>
            <FilterSelect
              name="verification"
              label="Verification"
              defaultValue={params.verification ?? "VERIFIED"}
              placeholder="Verified only"
              options={[
                { value: "VERIFIED", label: "Verified only" },
                { value: "ALL", label: "All statuses" },
              ]}
            />
            <div className="sm:col-span-2 lg:col-span-6">
              <Button type="submit">Apply filters</Button>
              <Button asChild variant="ghost" className="ml-2">
                <Link href="/household/search">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{helpers.length} professionals found</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {helpers.map((h) => {
          const avgRating =
            h.reviews.length > 0
              ? h.reviews.reduce((sum, r) => sum + r.rating, 0) / h.reviews.length
              : null;
          return (
            <Card key={h.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <PersonAvatar id={h.id} name={h.user.name} />
                    <div>
                      <p className="font-medium">{h.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {h.city} · {h.experienceYears} yrs experience
                      </p>
                    </div>
                  </div>
                  <Badge variant={h.identityVerification === "VERIFIED" ? "success" : "outline"}>
                    {VERIFICATION_STATUS_LABEL[h.identityVerification]}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {h.helperServices.map((hs) => (
                    <Badge key={hs.id} variant="secondary">
                      {hs.serviceCategory.name}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {SKILL_TIER_LABEL[h.skillTier]} tier
                    {avgRating && ` · ★ ${avgRating.toFixed(1)}`}
                  </span>
                  <Button asChild size="sm">
                    <Link href={`/household/helpers/${h.id}`}>View profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {helpers.length === 0 && (
        <div className="rounded-xl border border-dashed border-border">
          <EmptyState icon={SearchX} message="No helpers match these filters yet." />
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  name,
  label,
  defaultValue,
  placeholder,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={defaultValue}>
        <SelectTrigger id={name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
