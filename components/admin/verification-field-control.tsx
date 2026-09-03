"use client";

import { useTransition } from "react";
import { updateVerificationFieldAction } from "@/app/actions/admin-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VERIFICATION_STATUS_LABEL } from "@/lib/constants";
import type { VerificationStatus } from "@prisma/client";

type Field =
  | "identityVerification"
  | "addressVerification"
  | "referenceVerification"
  | "backgroundCheck";

export function VerificationFieldControl({
  helperId,
  field,
  label,
  value,
}: {
  helperId: string;
  field: Field;
  label: string;
  value: VerificationStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <Select
        defaultValue={value}
        disabled={isPending}
        onValueChange={(next) =>
          startTransition(() => {
            updateVerificationFieldAction(helperId, field, next as VerificationStatus);
          })
        }
      >
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {Object.entries(VERIFICATION_STATUS_LABEL).map(([v, l]) => (
            <SelectItem key={v} value={v}>{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
