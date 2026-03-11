"use client";

import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  REBIRTH_UPGRADES,
  getRebirthUpgradeCost,
  getRebirthMaxLevel,
  canBuyMoreRebirth,
} from "@/data/rebirthUpgrades";
import type { RebirthUpgrade } from "@/data/rebirthUpgrades";

interface RebirthUpgradesModalProps {
  rebirthPoints: number;
  ownedRebirthUpgrades: Record<string, number>;
  onBuy: (upgrade: RebirthUpgrade, quantity?: number) => number;
  getMaxAffordable: (upgrade: RebirthUpgrade) => number;
}

export function RebirthUpgradesModal({
  rebirthPoints,
  ownedRebirthUpgrades,
  onBuy,
  getMaxAffordable,
}: RebirthUpgradesModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="size-4" />
          Rebirth Upgrades
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center justify-between gap-2">
            Rebirth Upgrades
            <span className="text-sm font-normal text-muted-foreground">
              {rebirthPoints} pts
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          {REBIRTH_UPGRADES.map((upgrade) => {
            const owned = ownedRebirthUpgrades[upgrade.id] ?? 0;
            const maxLevel = getRebirthMaxLevel(upgrade);
            const atMax = !canBuyMoreRebirth(upgrade, owned);
            const maxBuy = getMaxAffordable(upgrade);
            const costOne = maxBuy >= 1 ? getRebirthUpgradeCost(upgrade.baseCost, owned) : 0;
            const canAfford = rebirthPoints >= costOne;

            return (
              <Card
                key={upgrade.id}
                className={
                  atMax
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-card/50"
                }
              >
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{upgrade.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {upgrade.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Level {owned}
                      {maxLevel > 0 ? ` / ${maxLevel}` : ""}
                    </p>
                  </div>
                  {atMax ? (
                    <span className="text-sm text-primary shrink-0">
                      Maxed
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canAfford}
                      onClick={() => onBuy(upgrade, 1)}
                      className="shrink-0"
                    >
                      {Math.floor(costOne)} pt
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
