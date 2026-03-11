import type { LucideIcon } from "lucide-react";
import {
  Trophy,
  Zap,
  Target,
  Car,
  Home,
  Heart,
  TrendingUp,
  Layers,
  Building2,
  PiggyBank,
  Coins,
} from "lucide-react";
import { UPGRADES_BUILDER, UPGRADES_FOUNDER, UPGRADES_INVESTOR } from "./upgrades";

export type AchievementCondition =
  | { type: "balance"; min: number }
  | { type: "combo"; min: number }
  | { type: "goal"; goalId: string }
  | { type: "all_builder" }
  | { type: "all_founder" }
  | { type: "all_investor" };

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const ACHIEVEMENTS: (Achievement & { condition: AchievementCondition })[] = [
  { id: "first-100k", label: "First 100K", description: "Earn 100,000 total", icon: Coins, condition: { type: "balance", min: 100_000 } },
  { id: "first-1m", label: "First 1M", description: "Earn 1,000,000 total", icon: Coins, condition: { type: "balance", min: 1_000_000 } },
  { id: "first-10m", label: "First 10M", description: "Earn 10,000,000 total", icon: PiggyBank, condition: { type: "balance", min: 10_000_000 } },
  { id: "first-100m", label: "First 100M", description: "Earn 100,000,000 total", icon: PiggyBank, condition: { type: "balance", min: 100_000_000 } },
  { id: "combo-10", label: "Combo 10x", description: "Reach a 10x combo", icon: Zap, condition: { type: "combo", min: 10 } },
  { id: "combo-50", label: "Combo 50x", description: "Reach a 50x combo", icon: Zap, condition: { type: "combo", min: 50 } },
  { id: "combo-100", label: "Combo 100x", description: "Reach a 100x combo", icon: Zap, condition: { type: "combo", min: 100 } },
  { id: "goal-dream-car", label: "Dream Car", description: "Unlock Dream Car", icon: Car, condition: { type: "goal", goalId: "dream-car" } },
  { id: "goal-house", label: "South Jakarta House", description: "Unlock South Jakarta House", icon: Home, condition: { type: "goal", goalId: "south-jakarta-house" } },
  { id: "goal-wedding", label: "Wedding Fund", description: "Unlock Wedding Fund", icon: Heart, condition: { type: "goal", goalId: "wedding-fund" } },
  { id: "fuck-you-money", label: "Fuck You Money", description: "Reach Fuck You Money status", icon: Trophy, condition: { type: "goal", goalId: "fuck-you-money" } },
  { id: "all-builder-max", label: "All Builder Max", description: "Own every Builder upgrade", icon: Layers, condition: { type: "all_builder" } },
  { id: "all-founder-max", label: "All Founder Max", description: "Own every Founder upgrade", icon: Building2, condition: { type: "all_founder" } },
  { id: "all-investor-max", label: "All Investor Max", description: "Own every Investor upgrade", icon: TrendingUp, condition: { type: "all_investor" } },
];

export function checkAchievement(
  achievement: (Achievement & { condition: AchievementCondition }),
  ctx: {
    totalEarned: number;
    highestCombo: number;
    purchasedGoals: string[];
    ownedUpgrades: Record<string, number>;
  }
): boolean {
  const c = achievement.condition;
  switch (c.type) {
    case "balance":
      return ctx.totalEarned >= c.min;
    case "combo":
      return ctx.highestCombo >= c.min;
    case "goal":
      return ctx.purchasedGoals.includes(c.goalId);
    case "all_builder":
      return UPGRADES_BUILDER.every((u) => (ctx.ownedUpgrades[u.id] ?? 0) >= 1);
    case "all_founder":
      return UPGRADES_FOUNDER.every((u) => (ctx.ownedUpgrades[u.id] ?? 0) >= 1);
    case "all_investor":
      return UPGRADES_INVESTOR.every((u) => (ctx.ownedUpgrades[u.id] ?? 0) >= 1);
    default:
      return false;
  }
}

export function getNewlyUnlocked(
  currentUnlocked: string[],
  ctx: {
    totalEarned: number;
    highestCombo: number;
    purchasedGoals: string[];
    ownedUpgrades: Record<string, number>;
  }
): string[] {
  const set = new Set(currentUnlocked);
  const added: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (set.has(a.id)) continue;
    if (checkAchievement(a, ctx)) {
      set.add(a.id);
      added.push(a.id);
    }
  }
  return added;
}
