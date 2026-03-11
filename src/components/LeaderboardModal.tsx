"use client";

import { Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatIdr } from "@/lib/formatIdr";
import { FORBES_TOP_100 } from "@/data/forbesTop100";
import { buildLeaderboard } from "@/lib/leaderboard";

interface LeaderboardModalProps {
  playerName: string;
  totalEarned: number;
}

export function LeaderboardModal({ playerName, totalEarned }: LeaderboardModalProps) {
  const entries = buildLeaderboard(
    FORBES_TOP_100,
    { name: playerName.trim() || "Player", wealth: totalEarned }
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className="gap-2">
          <Trophy className="size-4" />
          Leaderboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="size-5" />
            Forbes Top 100 (offline)
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Ranked by total wealth (your total earned). You are highlighted.
        </p>
        <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-card">
              <tr>
                <th className="px-3 py-2 font-medium text-muted-foreground">#</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Name</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Wealth</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.isPlayer ? "player" : `${entry.rank}-${entry.name}`}
                  className={
                    entry.isPlayer
                      ? "border-b border-primary/30 bg-primary/10 font-medium"
                      : "border-b border-border"
                  }
                >
                  <td className="px-3 py-1.5 font-mono tabular-nums">{entry.rank}</td>
                  <td className="px-3 py-1.5">
                    {entry.name}
                    {entry.isPlayer && (
                      <span className="ml-1.5 text-xs text-primary">(You)</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                    {formatIdr(entry.wealth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
