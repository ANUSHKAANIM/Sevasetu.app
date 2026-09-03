"use client";

import { useActionState } from "react";
import { addGrievanceMessageAction, type GrievanceFormState } from "@/app/actions/grievance-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initialState: GrievanceFormState = {};

export interface GrievanceMessageView {
  id: string;
  authorName: string;
  isAdmin: boolean;
  isInternalNote: boolean;
  message: string;
  createdAt: string;
}

export function GrievanceThread({
  grievanceId,
  messages,
  canViewInternalNotes,
}: {
  grievanceId: string;
  messages: GrievanceMessageView[];
  canViewInternalNotes: boolean;
}) {
  const [state, formAction, isPending] = useActionState(addGrievanceMessageAction, initialState);
  const visibleMessages = messages.filter((m) => !m.isInternalNote || canViewInternalNotes);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {visibleMessages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          visibleMessages.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg border p-3 text-sm ${
                m.isInternalNote ? "border-warning/40 bg-warning/10" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {m.authorName} {m.isAdmin && "· SevaSetu Support"}
                  {m.isInternalNote && " (internal note)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(m.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <p className="mt-1">{m.message}</p>
            </div>
          ))
        )}
      </div>

      <form action={formAction} className="space-y-2">
        <input type="hidden" name="grievanceId" value={grievanceId} />
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Textarea name="message" rows={3} placeholder="Write a reply..." required />
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Sending..." : "Send reply"}
        </Button>
      </form>
    </div>
  );
}
