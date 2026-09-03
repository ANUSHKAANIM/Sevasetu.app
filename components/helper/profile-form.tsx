"use client";

import { useActionState, useState } from "react";
import {
  updateHelperProfileAction,
  type HelperProfileFormState,
} from "@/app/actions/helper-profile-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIES, EMPLOYMENT_TYPE_LABEL } from "@/lib/constants";
import type { EmploymentType } from "@prisma/client";

const initialState: HelperProfileFormState = {};

export function HelperProfileForm({
  bio,
  city,
  languages,
  experienceYears,
  employmentTypePref,
}: {
  bio: string | null;
  city: string;
  languages: string[];
  experienceYears: number;
  employmentTypePref: EmploymentType[];
}) {
  const [state, formAction, isPending] = useActionState(updateHelperProfileAction, initialState);
  const [languagesText, setLanguagesText] = useState(languages.join(", "));
  const [selectedTypes, setSelectedTypes] = useState<EmploymentType[]>(employmentTypePref);

  function toggleType(t: EmploymentType) {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">Profile updated.</p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="bio">About you</Label>
        <Textarea id="bio" name="bio" rows={3} defaultValue={bio ?? ""} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Select name="city" defaultValue={city}>
            <SelectTrigger id="city"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="experienceYears">Years of experience</Label>
          <Input id="experienceYears" name="experienceYears" type="number" min={0} defaultValue={experienceYears} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="languagesText">Languages (comma-separated)</Label>
        <Input
          id="languagesText"
          value={languagesText}
          onChange={(e) => setLanguagesText(e.target.value)}
          placeholder="Hindi, English"
        />
        {languagesText
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l, i) => (
            <input key={`${l}-${i}`} type="hidden" name="languages" value={l} />
          ))}
      </div>
      <div className="space-y-1.5">
        <Label>Availability</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selectedTypes.includes(value as EmploymentType)}
                onCheckedChange={() => toggleType(value as EmploymentType)}
              />
              {label}
              {selectedTypes.includes(value as EmploymentType) && (
                <input type="hidden" name="employmentTypePref" value={value} />
              )}
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
