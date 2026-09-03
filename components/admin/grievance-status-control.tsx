"use client";

import { useTransition } from "react";
import { updateGrievanceStatusAction } from "@/app/actions/grievance-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GrievanceStatus } from "@prisma/client";

export function GrievanceStatusControl({
  grievanceId,
  status,
}: {
  grievanceId: string;
  status: GrievanceStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={status}
      disabled={isPending}
      onValueChange={(next) =>
        startTransition(() => {
          updateGrievanceStatusAction(
            grievanceId,
            next as "UNDER_REVIEW" | "RESOLVED" | "CLOSED"
          );
        })
      }
    >
      <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
        <SelectItem value="RESOLVED">Resolved</SelectItem>
        <SelectItem value="CLOSED">Closed</SelectItem>
      </SelectContent>
    </Select>
  );
}
