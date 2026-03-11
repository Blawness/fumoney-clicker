"use client";

import { Award, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ACHIEVEMENTS } from "@/data/achievements";
import { cn } from "@/lib/utils";

interface AchievementsModalProps {
  unlockedAchievements: string[];
}

export function AchievementsModal({ unlockedAchievements }: AchievementsModalProps) {
  const set = new Set(unlockedAchievements);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className="gap-2">
          <Award className="size-4" />
          Achievements
          {unlockedAchievements.length > 0 && (
            <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary">
              {unlockedAchievements.length}/{ACHIEVEMENTS.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-md overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Award className="size-5" />
            Achievements
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <ul className="space-y-2">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = set.has(a.id);
              const Icon = a.icon;
              return (
                <li
                  key={a.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    unlocked
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50 bg-muted/30 opacity-75"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full",
                      unlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {unlocked ? <Icon className="size-5" /> : <Lock className="size-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("font-medium", unlocked ? "text-foreground" : "text-muted-foreground")}>
                      {a.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
