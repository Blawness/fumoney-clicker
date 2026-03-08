"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Layers,
  Zap,
  Server,
  Brain,
  Briefcase,
  Users,
  MessageSquare,
  Sheet,
  Globe,
  Coins,
  TrendingUp,
  Activity,
  Bitcoin,
  Percent,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatIdr } from "@/lib/formatIdr";
import {
  getUpgradeCost,
  getTotalCostForMany,
  canBuyMore,
  getMaxLevel,
  UPGRADE_CATEGORIES,
  getUpgradesByCategory,
} from "@/data/upgrades";
import type { Upgrade } from "@/data/upgrades";

const BUY_MULTIPLIER_OPTIONS = [1, 5, 10, 25, 100, "max"] as const;
export type BuyMultiplier = (typeof BUY_MULTIPLIER_OPTIONS)[number];

export function buyMultiplierFromStorage(stored: string): BuyMultiplier {
  if (stored === "max") return "max";
  const n = parseInt(stored, 10);
  if ([1, 5, 10, 25, 100].includes(n)) return n as BuyMultiplier;
  return 1;
}

export function buyMultiplierToStorage(v: BuyMultiplier): string {
  return v === "max" ? "max" : String(v);
}

const UPGRADE_ICONS: Record<string, LucideIcon> = {
  "vibe-coding-ai": Code2,
  "fullstack-mastery": Layers,
  "openrouter-api-pro": Zap,
  "supercomputer-cluster": Server,
  "neural-link-coding": Brain,
  "freelance-project": Briefcase,
  "vorca-studio-team": Users,
  "feedback-hub-saas": MessageSquare,
  "gitsheet-enterprise": Sheet,
  "global-tech-empire": Globe,
  "income-multiplier": Percent,
  "xaut-digital-gold": Coins,
  "sp500-voo": TrendingUp,
  "nasdaq-qqq": Activity,
  "bitcoin-whale": Bitcoin,
  "compound-interest-mastery": Percent,
};

interface UpgradesListProps {
  balance: number;
  ownedUpgrades: Record<string, number>;
  buyMultiplier: BuyMultiplier;
  onBuyMultiplierChange: (value: BuyMultiplier) => void;
  onBuy: (upgrade: Upgrade, quantity?: number) => void;
  getMaxAffordable: (upgrade: Upgrade) => number;
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
    case "income_multiplier": {
      const max = getMaxLevel(upgrade);
      return max
        ? `+${upgrade.effectValue}% income (max ${max} level)`
        : `+${upgrade.effectValue}% total income`;
    }
    default:
      return "";
  }
}

function UpgradeCard({
  upgrade,
  owned,
  buyQuantity,
  cost,
  canAfford,
  atMax,
  onBuy,
  getMaxAffordable,
}: {
  upgrade: Upgrade;
  owned: number;
  buyQuantity: BuyMultiplier;
  cost: number;
  canAfford: boolean;
  atMax: boolean;
  onBuy: (u: Upgrade, q?: number) => void;
  getMaxAffordable: (u: Upgrade) => number;
}) {
  const Icon = UPGRADE_ICONS[upgrade.id] ?? Code2;
  const effectiveQ =
    buyQuantity === "max"
      ? getMaxAffordable(upgrade)
      : Math.min(
          buyQuantity,
          getMaxLevel(upgrade) === 0 ? buyQuantity : getMaxLevel(upgrade) - owned
        );
  const handleBuy = () => onBuy(upgrade, effectiveQ);
  return (
    <motion.li
      key={upgrade.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <span className="font-medium truncate">{upgrade.name}</span>
            </div>
            {owned > 0 && (
              <span className="shrink-0 text-xs text-muted-foreground">
                Lv. {owned}
                {atMax && " (Max)"}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <p className="text-sm text-muted-foreground">
            {getEffectText(upgrade)}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm tabular-nums">
              {atMax ? "—" : formatIdr(cost)}
            </span>
            <motion.div whileTap={{ scale: canAfford ? 0.97 : 1 }}>
              <Button
                size="sm"
                disabled={!canAfford}
                onClick={handleBuy}
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
  buyMultiplier,
  onBuyMultiplierChange,
  onBuy,
  getMaxAffordable,
  hideTitle = false,
}: UpgradesListProps) {
  return (
    <div className="space-y-6">
      {!hideTitle && (
        <h2 className="text-lg font-semibold">Upgrades</h2>
      )}
      {/* Satu setting multiplier global untuk semua Buy (tersimpan saat modal ditutup) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Buy:</span>
        {BUY_MULTIPLIER_OPTIONS.map((opt) => (
          <Button
            key={opt}
            size="sm"
            variant={buyMultiplier === opt ? "default" : "outline"}
            className="min-w-9 px-2 text-xs"
            onClick={() => onBuyMultiplierChange(opt)}
          >
            {opt === "max" ? "Max" : `${opt}×`}
          </Button>
        ))}
      </div>
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
                const atMax = !canBuyMore(upgrade, owned);
                const maxLevel = getMaxLevel(upgrade);
                const effectiveQ =
                  buyMultiplier === "max"
                    ? getMaxAffordable(upgrade)
                    : maxLevel === 0
                      ? buyMultiplier
                      : Math.min(buyMultiplier, maxLevel - owned);
                const cost = atMax ? 0 : getTotalCostForMany(upgrade.baseCost, owned, effectiveQ);
                const canAfford = !atMax && effectiveQ > 0 && balance >= cost;
                return (
                  <UpgradeCard
                    key={upgrade.id}
                    upgrade={upgrade}
                    owned={owned}
                    buyQuantity={buyMultiplier}
                    cost={cost}
                    canAfford={canAfford}
                    atMax={atMax}
                    onBuy={onBuy}
                    getMaxAffordable={getMaxAffordable}
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
