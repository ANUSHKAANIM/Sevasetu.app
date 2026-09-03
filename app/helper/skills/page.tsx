import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SKILL_TIER_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Skills & Assessments — SevaSetu" };

export default async function HelperSkillsPage() {
  const { helperId } = await requireHelperContext();

  const helper = await prisma.helperProfile.findUniqueOrThrow({
    where: { id: helperId },
    include: {
      helperSkills: { include: { skill: true } },
      skillAssessments: { orderBy: { assessedAt: "desc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Skills &amp; assessments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your current skill tier and assessment history.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Current skill tier</p>
          <Badge variant="secondary" className="mt-2 text-base">
            {SKILL_TIER_LABEL[helper.skillTier]}
          </Badge>
          <p className="mt-3 text-xs text-muted-foreground">
            Skill tiers are determined by assessment scores and completed training, reviewed by the
            SevaSetu skills panel.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recorded skills</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {helper.helperSkills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills recorded yet.</p>
          ) : (
            helper.helperSkills.map((hs) => (
              <Badge key={hs.id} variant="outline">
                {hs.skill.name} — {SKILL_TIER_LABEL[hs.level]}
              </Badge>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assessment history</CardTitle></CardHeader>
        <CardContent>
          {helper.skillAssessments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assessments on record yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {helper.skillAssessments.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{a.category.replace("_", " ")}</p>
                    <p className="text-muted-foreground">
                      Assessed by {a.assessorName} on {a.assessedAt.toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{a.score}/{a.maxScore}</p>
                    <Badge variant="outline">{SKILL_TIER_LABEL[a.result]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
