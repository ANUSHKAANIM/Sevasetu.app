"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EMPLOYMENT_TYPE_LABEL,
  SCOPE_OF_WORK_LABEL,
} from "@/lib/constants";
import { createJobRequestAction } from "@/app/actions/job-actions";
import type { EmploymentType, ScopeOfWork } from "@prisma/client";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STEPS = [
  "Select service",
  "Work schedule",
  "Responsibilities",
  "Standardized salary",
  "Review & confirm",
];

interface SalaryBreakdown {
  baseSalary: number;
  skillAdjustment: number;
  scopeAdjustment: number;
  workerSalary: number;
  platformFee: number;
  totalPayment: number;
}

export function HiringWizard({
  helperId,
  helperName,
  services,
}: {
  helperId: string;
  helperName: string;
  services: { serviceCategoryId: string; name: string }[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serviceCategoryId, setServiceCategoryId] = useState(
    services[0]?.serviceCategoryId ?? ""
  );
  const [employmentType, setEmploymentType] = useState<EmploymentType>("FULL_TIME");
  const [scopeOfWork, setScopeOfWork] = useState<ScopeOfWork>("STANDARD");
  const [days, setDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    "Daily housekeeping\nAssist with household chores"
  );
  const [message, setMessage] = useState("");
  const [breakdown, setBreakdown] = useState<SalaryBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const responsibilities = responsibilitiesText
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  async function fetchSalary() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/salary/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helperId, serviceCategoryId, employmentType, scopeOfWork }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not calculate salary.");
      setBreakdown(data);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    setLoading(true);
    setError(null);
    const result = await createJobRequestAction({
      helperId,
      serviceCategoryId,
      employmentType,
      scopeOfWork,
      responsibilities,
      message: message || undefined,
      schedule: { days, startTime, endTime },
    });
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push("/household/contracts?requestSent=1");
  }

  function toggleDay(day: string) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hire {helperName}</CardTitle>
        <ol className="mt-3 flex flex-wrap gap-2 text-xs">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`rounded-full px-3 py-1 ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <Label>Which service are you hiring for?</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {services.map((s) => (
                <button
                  key={s.serviceCategoryId}
                  type="button"
                  onClick={() => setServiceCategoryId(s.serviceCategoryId)}
                  className={`rounded-md border px-4 py-3 text-left text-sm font-medium ${
                    serviceCategoryId === s.serviceCategoryId
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label>Employment type</Label>
              <Select
                value={employmentType}
                onValueChange={(v) => setEmploymentType(v as EmploymentType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scope of work</Label>
              <Select
                value={scopeOfWork}
                onValueChange={(v) => setScopeOfWork(v as ScopeOfWork)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SCOPE_OF_WORK_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setStep(1)} disabled={!serviceCategoryId}>
              Continue
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Label>Working days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    days.includes(d)
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-input text-muted-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startTime">Start time</Label>
                <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime">End time</Label>
                <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)} disabled={days.length === 0}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
            <Textarea
              id="responsibilities"
              rows={5}
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
            />
            <div className="space-y-1.5">
              <Label htmlFor="message">Message to the professional (optional)</Label>
              <Textarea
                id="message"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={fetchSalary} disabled={loading || responsibilities.length === 0}>
                {loading ? "Calculating..." : "Calculate standardized salary"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && breakdown && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <Row label="Base worker salary" value={breakdown.baseSalary} />
              <Row label="Skill tier adjustment" value={breakdown.skillAdjustment} />
              <Row label="Scope of work adjustment" value={breakdown.scopeAdjustment} />
              <div className="my-2 border-t border-border" />
              <Row label="Worker salary" value={breakdown.workerSalary} bold />
              <Row label="SevaSetu platform fee" value={breakdown.platformFee} />
              <div className="my-2 border-t border-border" />
              <Row label="Total monthly payment" value={breakdown.totalPayment} bold large />
            </div>
            <p className="text-xs text-muted-foreground">
              This wage is derived from SevaSetu&apos;s standardized salary rules for this
              service, location tier and skill tier — it is not negotiated in the app.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)}>Continue to review</Button>
            </div>
          </div>
        )}

        {step === 4 && breakdown && (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Professional:</span> {helperName}</p>
              <p><span className="font-medium">Schedule:</span> {days.join(", ")}, {startTime}–{endTime}</p>
              <p><span className="font-medium">Responsibilities:</span></p>
              <ul className="ml-5 list-disc">
                {responsibilities.map((r) => <li key={r}>{r}</li>)}
              </ul>
              <p><span className="font-medium">Total monthly payment:</span> ₹{breakdown.totalPayment.toLocaleString("en-IN")}</p>
              <Badge variant="outline">Digital employment agreement — not a legally binding contract</Badge>
              <p className="text-xs text-muted-foreground">
                Sending this creates a job request. {helperName} will review the schedule,
                responsibilities and salary and can accept or decline it. If accepted, an
                active employment contract is generated automatically.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={submit} disabled={loading}>
                {loading ? "Sending..." : "Confirm & send hiring request"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  bold,
  large,
}: {
  label: string;
  value: number;
  bold?: boolean;
  large?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-1 ${bold ? "font-medium" : ""} ${large ? "text-lg" : "text-sm"}`}>
      <span>{label}</span>
      <span>₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}
