"use client";

import { useActionState } from "react";
import { createTrainingCourseAction, type TrainingCourseFormState } from "@/app/actions/training-actions";
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

const initialState: TrainingCourseFormState = {};

const CATEGORIES = ["CLEANING", "COOKING", "CHILD_CARE", "ELDERLY_CARE", "DRIVING"];

export function CreateCourseForm() {
  const [state, formAction, isPending] = useActionState(createTrainingCourseAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {state.error && (
        <p className="sm:col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="sm:col-span-2 rounded-md bg-success/10 px-3 py-2 text-sm text-success">Course created.</p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue="CLEANING">
          <SelectTrigger id="category"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="sm:col-span-2 space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="durationHours">Duration (hours)</Label>
        <Input id="durationHours" name="durationHours" type="number" min={1} required />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create course"}</Button>
      </div>
    </form>
  );
}
