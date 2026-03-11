"use client";

import { BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatIdr } from "@/lib/formatIdr";
import type { GameStats } from "@/lib/storage";

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

interface StatsModalProps {
  stats: GameStats;
}

export function StatsModal({ stats }: StatsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className="gap-2">
          <BarChart3 className="size-4" />
          Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Statistics
          </DialogTitle>
        </DialogHeader>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Total clicks</dt>
            <dd className="font-mono tabular-nums">{stats.totalClicks.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Total earned (lifetime)</dt>
            <dd className="font-mono tabular-nums text-primary">{formatIdr(stats.totalEarned)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Play time</dt>
            <dd className="font-mono tabular-nums">{formatDuration(stats.playTimeMs)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Highest combo</dt>
            <dd className="font-mono tabular-nums font-semibold text-amber-400">×{stats.highestCombo}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
