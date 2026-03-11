"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canRebirth, getRebirthPointsFromTotalEarned, REBIRTH_THRESHOLD } from "@/lib/rebirth";
import { formatIdr } from "@/lib/formatIdr";
import { RebirthUpgradesModal } from "@/components/RebirthUpgradesModal";
import type { RebirthUpgrade } from "@/data/rebirthUpgrades";

interface RebirthPanelProps {
  totalEarned: number;
  rebirthCount: number;
  rebirthPoints: number;
  ownedRebirthUpgrades: Record<string, number>;
  onRebirth: () => void;
  onBuyRebirthUpgrade: (upgrade: RebirthUpgrade, quantity?: number) => number;
  getMaxAffordableRebirth: (upgrade: RebirthUpgrade) => number;
}

export function RebirthPanel({
  totalEarned,
  rebirthCount,
  rebirthPoints,
  ownedRebirthUpgrades,
  onRebirth,
  onBuyRebirthUpgrade,
  getMaxAffordableRebirth,
}: RebirthPanelProps) {
  const available = canRebirth(totalEarned);
  const pointsPreview = getRebirthPointsFromTotalEarned(totalEarned);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">
        Rebirth: {rebirthCount} · Points: {rebirthPoints}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={!available}
        onClick={onRebirth}
        title={
          available
            ? `Reset run and gain ${pointsPreview} Rebirth Point(s)`
            : `Earn at least ${formatIdr(REBIRTH_THRESHOLD)} total this run to rebirth`
        }
      >
        <RotateCcw className="size-4" />
        Rebirth
        {available && (
          <span className="text-primary">+{pointsPreview} pt</span>
        )}
      </Button>
      <RebirthUpgradesModal
        rebirthPoints={rebirthPoints}
        ownedRebirthUpgrades={ownedRebirthUpgrades}
        onBuy={onBuyRebirthUpgrade}
        getMaxAffordable={getMaxAffordableRebirth}
      />
    </div>
  );
}
