"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatIdr } from "@/lib/formatIdr";
import { getUpgradeCost } from "@/data/upgrades";
import type { Upgrade } from "@/data/upgrades";

interface UpgradesListProps {
  upgrades: Upgrade[];
  balance: number;
  ownedUpgrades: Record<string, number>;
  onBuy: (upgrade: Upgrade) => void;
}

export function UpgradesList({
  upgrades,
  balance,
  ownedUpgrades,
  onBuy,
}: UpgradesListProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Upgrades</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {upgrades.map((upgrade) => {
          const owned = ownedUpgrades[upgrade.id] ?? 0;
          const cost = getUpgradeCost(upgrade.baseCost, owned);
          const canAfford = balance >= cost;
          const effectText =
            upgrade.effectType === "ipc"
              ? `+${upgrade.effectValue} IPC`
              : `+${upgrade.effectValue} IPS`;

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
                      <span className="text-xs text-muted-foreground">
                        ×{owned}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <p className="text-sm text-muted-foreground">{effectText}</p>
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
        })}
      </ul>
    </div>
  );
}
