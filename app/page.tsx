import Link from "next/link";
import {
  Sparkles,
  ChefHat,
  Baby,
  HeartHandshake,
  Car,
  Home as HomeIcon,
  ShieldCheck,
  IndianRupee,
  GraduationCap,
  FileText,
  Users2,
  Search,
  ClipboardCheck,
  Handshake,
  Settings2,
  UserPlus,
  BadgeCheck,
  Award,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { BridgeIllustration } from "@/components/shared/bridge-illustration";

const TILE_STYLES = [
  "bg-primary/10 text-primary",
  "bg-accent/15 text-accent",
  "bg-success/10 text-success",
];

const SERVICES = [
  { icon: Sparkles, name: "House Cleaning", description: "Sweeping, mopping, deep cleaning and household upkeep." },
  { icon: ChefHat, name: "Cooking", description: "Daily meals across regional and dietary preferences." },
  { icon: Baby, name: "Child Care", description: "Nanny and childminding support you can trust." },
  { icon: HeartHandshake, name: "Elderly Care", description: "Companionship and daily-living support for elders." },
  { icon: Car, name: "Driving", description: "Personal driving with route familiarity and vehicle care." },
  { icon: HomeIcon, name: "Live-in Assistance", description: "Full-time, live-in help across combined duties." },
];

const WHY_SEVASETU = [
  { icon: ShieldCheck, title: "Verified Professionals", description: "Identity, address and reference checks tracked through a structured workflow." },
  { icon: IndianRupee, title: "Transparent Standardized Wages", description: "Pay is computed from published rules, never negotiated ad hoc in the app." },
  { icon: GraduationCap, title: "Professional Skill Development", description: "Training courses and assessments that build toward recognized skill tiers." },
  { icon: FileText, title: "Digital Employment Records", description: "Every engagement has a structured, reviewable employment agreement." },
  { icon: Users2, title: "Leave Management", description: "Configurable leave accrual with transparent balances for every contract." },
  { icon: Handshake, title: "Reliable Replacement Support", description: "Request temporary or permanent replacement help without starting over." },
];

const HOUSEHOLD_STEPS = [
  { icon: Search, title: "Search", description: "Filter verified professionals by service, location, availability and skill tier." },
  { icon: ClipboardCheck, title: "Compare", description: "Review profiles, ratings, training and standardized wage estimates." },
  { icon: Handshake, title: "Hire", description: "Confirm schedule and responsibilities, then generate a digital agreement." },
  { icon: Settings2, title: "Manage", description: "Track attendance, leave, payments and reviews from one dashboard." },
];

const HELPER_STEPS = [
  { icon: UserPlus, title: "Create Profile", description: "Add your services, experience, languages and availability." },
  { icon: BadgeCheck, title: "Get Verified", description: "Complete identity, address and reference verification." },
  { icon: Award, title: "Get Assessed", description: "Take skill assessments to earn Basic, Intermediate or Advanced tiers." },
  { icon: Briefcase, title: "Find Work", description: "Get matched to household job requests based on transparent scoring." },
  { icon: TrendingUp, title: "Build Your Career", description: "Complete training and grow your skill tier over time." },
];

export default async function HomePage() {
  const [helperCount, householdCount, contractCount, trainingCompletions] =
    await Promise.all([
      prisma.helperProfile.count({ where: { identityVerification: "VERIFIED" } }),
      prisma.householdProfile.count(),
      prisma.employmentContract.count(),
      prisma.trainingEnrollment.count({ where: { status: "COMPLETED" } }),
    ]);

  const stats = [
    { label: "Professionals Verified", value: helperCount },
    { label: "Households Served", value: householdCount },
    { label: "Jobs Facilitated", value: contractCount },
    { label: "Training Courses Completed", value: trainingCompletions },
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="overflow-hidden border-b border-border bg-gradient-to-b from-secondary/50 to-background">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-6">
            <div className="text-center lg:text-left">
              <h1 className="mx-auto max-w-xl font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:mx-0">
                Dignified Work. Trusted Help. Better Homes.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground lg:mx-0">
                SevaSetu connects households with verified, skilled domestic
                service professionals — through transparent standardized wages
                and structured professional growth.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Button asChild size="lg">
                  <Link href="/auth/register?role=HOUSEHOLD">Find Help</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/auth/register?role=HELPER">Find Work</Link>
                </Button>
              </div>
            </div>
            <BridgeIllustration className="mx-auto w-full max-w-md lg:max-w-lg" />
          </div>
        </section>

        {/* Services */}
        <section id="services" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-semibold">Services</h2>
            <p className="mt-2 text-muted-foreground">
              Standardized categories, each with its own wage structure.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Card key={s.name} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${TILE_STYLES[i % TILE_STYLES.length]}`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why SevaSetu */}
        <section id="why-sevasetu" className="border-y border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="font-serif text-3xl font-semibold">Why SevaSetu</h2>
              <p className="mt-2 text-muted-foreground">
                A structured employment platform, not just a listings marketplace.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_SEVASETU.map((f, i) => (
                <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${TILE_STYLES[i % TILE_STYLES.length]}`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-medium">{f.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-semibold">How it works</h2>
          </div>

          <div className="mb-14">
            <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-accent">
              For households
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {HOUSEHOLD_STEPS.map((s, i) => (
                <div key={s.title} className="relative rounded-xl border border-border bg-card p-6">
                  <span className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <s.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-medium">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-accent">
              For service professionals
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {HELPER_STEPS.map((s, i) => (
                <div key={s.title} className="relative rounded-xl border border-border bg-card p-6">
                  <span className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <s.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-medium">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact */}
        <section className="relative overflow-hidden border-t border-border bg-primary text-primary-foreground">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
            aria-hidden="true"
          >
            <defs>
              <pattern id="dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid)" />
          </svg>
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="mb-8 text-center text-sm uppercase tracking-wide text-primary-foreground/70">
              Platform activity — demonstration data from this deployment
            </p>
            <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-serif text-4xl font-semibold">{s.value}</p>
                  <p className="mt-1 text-sm text-primary-foreground/80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
