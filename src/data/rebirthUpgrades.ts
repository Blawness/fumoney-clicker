export type RebirthUpgradeEffectType =
  | "rebirth_ipc_percent"
  | "rebirth_ips_percent"
  | "rebirth_starting_balance"
  | "rebirth_income_multiplier";

export interface RebirthUpgrade {
  id: string;
  name: string;
  description: string;
  effectType: RebirthUpgradeEffectType;
  effectValue: number;
  baseCost: number;
  maxLevel?: number;
}

export const REBIRTH_UPGRADES: RebirthUpgrade[] = [
  {
    id: "rebirth-ipc",
    name: "Click Wisdom",
    description: "+10% IPC (permanent, applies after rebirth)",
    effectType: "rebirth_ipc_percent",
    effectValue: 10,
    baseCost: 1,
    maxLevel: 10,
  },
  {
    id: "rebirth-ips",
    name: "Passive Memory",
    description: "+10% IPS (permanent, applies after rebirth)",
    effectType: "rebirth_ips_percent",
    effectValue: 10,
    baseCost: 1,
    maxLevel: 10,
  },
  {
    id: "rebirth-income-mult",
    name: "Legacy Multiplier",
    description: "+5% all income (permanent)",
    effectType: "rebirth_income_multiplier",
    effectValue: 5,
    baseCost: 2,
    maxLevel: 20,
  },
  {
    id: "rebirth-starting-balance",
    name: "Head Start",
    description: "Start each run with 10K balance",
    effectType: "rebirth_starting_balance",
    effectValue: 10_000,
    baseCost: 3,
    maxLevel: 1,
  },
];

export function getRebirthUpgradeCost(baseCost: number, owned: number): number {
  return Math.floor(baseCost * Math.pow(1.2, owned));
}

export function getTotalRebirthCostForMany(
  baseCost: number,
  owned: number,
  count: number
): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += getRebirthUpgradeCost(baseCost, owned + i);
  }
  return total;
}

export function getRebirthMaxLevel(upgrade: RebirthUpgrade): number {
  return upgrade.maxLevel ?? 0;
}

export function canBuyMoreRebirth(upgrade: RebirthUpgrade, owned: number): boolean {
  const max = getRebirthMaxLevel(upgrade);
  return max === 0 || owned < max;
}
