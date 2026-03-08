export type UpgradeEffectType = "ipc" | "ips";

export interface Upgrade {
  id: string;
  name: string;
  effectType: UpgradeEffectType;
  effectValue: number;
  baseCost: number;
}

export const UPGRADES: Upgrade[] = [
  {
    id: "vibe-coding-ai",
    name: "Vibe Coding AI",
    effectType: "ipc",
    effectValue: 1,
    baseCost: 100,
  },
  {
    id: "vorca-agency",
    name: "Vorca Agency Team",
    effectType: "ips",
    effectValue: 10,
    baseCost: 1_000,
  },
  {
    id: "feedback-hub",
    name: "Feedback-Hub Automator",
    effectType: "ips",
    effectValue: 100,
    baseCost: 10_000,
  },
  {
    id: "btc-rig",
    name: "Bitcoin Mining Rig",
    effectType: "ips",
    effectValue: 1_000,
    baseCost: 100_000,
  },
  {
    id: "qqq-voo",
    name: "QQQ / VOO Dividends",
    effectType: "ips",
    effectValue: 10_000,
    baseCost: 1_000_000,
  },
];

export function getUpgradeCost(baseCost: number, owned: number): number {
  return Math.floor(baseCost * Math.pow(1.15, owned));
}
