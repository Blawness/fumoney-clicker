"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatIdr } from "@/lib/formatIdr";
import {
  getUpgradeCost,
  UPGRADE_CATEGORIES,
  getUpgradesByCategory,
} from "@/data/upgrades";
import type { Upgrade } from "@/data/upgrades";

interface UpgradesListProps {
  balance: number;
  ownedUpgrades: Record<string, number>;
  onBuy: (upgrade: Upgrade) => void;
  /** Hide the main "Upgrades" heading (e.g. when inside a modal that has its own title) */
  hideTitle?: boolean;
}

function getEffectText(upgrade: Upgrade): string {
  switch (upgrade.effectType) {
    case "ipc":
      return `+${upgrade.effectValue} IPC`;
    case "ips":
      return `+${upgrade.effectValue}/s IPS`;
    case "acps":
      return `+${upgrade.effectValue} auto click/s`;
    case "ips_percent":
      return `+${upgrade.effectValue}% total IPS`;
    case "compound":
      return "2× all income every 5 min";
    default:
      return "";
  }
}

function UpgradeCard({
  upgrade,
  owned,
  cost,
  canAfford,
  onBuy,
}: {
  upgrade: Upgrade;
  owned: number;
  cost: number;
  canAfford: boolean;
  onBuy: (u: Upgrade) => void;
}) {
  return (
    <motion.li
      key={upgrade.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">{upgrade.name}</span>
            {owned > 0 && (
              <span className="text-xs text-muted-foreground">Lv. {owned}</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <p className="text-sm text-muted-foreground">
            {getEffectText(upgrade)}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm tabular-nums">
              {formatIdr(cost)}
            </span>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                size="sm"
                disabled={!canAfford}
                onClick={() => onBuy(upgrade)}
                className="shrink-0"
              >
                Buy
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.li>
  );
}

export function UpgradesList({
  balance,
  ownedUpgrades,
  onBuy,
  hideTitle = false,
}: UpgradesListProps) {
  return (
    <div className="space-y-8">
      {!hideTitle && (
        <h2 className="text-lg font-semibold">Upgrades</h2>
      )}
      {UPGRADE_CATEGORIES.map(({ id, title }) => {
        const upgrades = getUpgradesByCategory(id);
        return (
          <div key={id} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {title}
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {upgrades.map((upgrade) => {
                const owned = ownedUpgrades[upgrade.id] ?? 0;
                const cost = getUpgradeCost(upgrade.baseCost, owned);
                const canAfford = balance >= cost;
                return (
                  <UpgradeCard
                    key={upgrade.id}
                    upgrade={upgrade}
                    owned={owned}
                    cost={cost}
                    canAfford={canAfford}
                    onBuy={onBuy}
                  />
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
