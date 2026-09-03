"use client";

import { useState, useTransition } from "react";
import { updateReplacementStatusAction } from "@/app/actions/replacement-actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ReplacementAdminControls({
  replacementRequestId,
  candidates,
}: {
  replacementRequestId: string;
  candidates: { id: string; name: string }[];
}) {
  const [selectedHelperId, setSelectedHelperId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedHelperId} onValueChange={setSelectedHelperId}>
        <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Choose helper" /></SelectTrigger>
        <SelectContent>
          {candidates.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        disabled={!selectedHelperId || isPending}
        onClick={() =>
          startTransition(() => {
            updateReplacementStatusAction(replacementRequestId, "MATCHED", selectedHelperId);
          })
        }
      >
        Mark matched
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(() => { updateReplacementStatusAction(replacementRequestId, "CLOSED"); })}
      >
        Close
      </Button>
    </div>
  );
}
