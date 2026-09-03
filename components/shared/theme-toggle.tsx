"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, MonitorCog } from "lucide-react";
import { Button } from "@/components/ui/button";

type ThemePreference = "light" | "dark" | "system";
const STORAGE_KEY = "sevasetu-theme";
const ORDER: ThemePreference[] = ["light", "dark", "system"];
const ICON = { light: Sun, dark: Moon, system: MonitorCog } as const;

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    // Reading localStorage to sync in the client's actual stored
    // preference — this must happen post-mount (not in a lazy useState
    // initializer) so the client's first render still matches the
    // server-rendered "system" default and avoids a hydration mismatch.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreference(stored);
    }
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length];
    setPreference(next);
    if (next === "system") {
      localStorage.removeItem(STORAGE_KEY);
      document.documentElement.removeAttribute("data-theme");
    } else {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute("data-theme", next);
    }
  }

  const Icon = ICON[preference];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Theme: ${preference}. Click to switch.`}
      title={`Theme: ${preference} (click to switch)`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
