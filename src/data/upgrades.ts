export type UpgradeEffectType = "ipc" | "ips" | "acps" | "ips_percent" | "compound" | "income_multiplier";

export type UpgradeCategory = "builder" | "founder" | "investor";

export interface Upgrade {
  id: string;
  name: string;
  category: UpgradeCategory;
  effectType: UpgradeEffectType;
  effectValue: number;
  baseCost: number;
  /** Max level for upgrades that scale by level (e.g. income_multiplier). 0 = no cap. */
  maxLevel?: number;
}

/** The Builder – Increase IPC (klik) */
export const UPGRADES_BUILDER: Upgrade[] = [
  { id: "vibe-coding-ai", name: "Vibe Coding AI (Cursor/Claude)", category: "builder", effectType: "ipc", effectValue: 5, baseCost: 100 },
  { id: "fullstack-mastery", name: "Fullstack Mastery (Next.js + Prisma)", category: "builder", effectType: "ipc", effectValue: 25, baseCost: 500 },
  { id: "openrouter-api-pro", name: "OpenRouter API Pro", category: "builder", effectType: "ipc", effectValue: 100, baseCost: 2_500 },
  { id: "supercomputer-cluster", name: "Supercomputer Cluster", category: "builder", effectType: "ipc", effectValue: 1_000, baseCost: 25_000 },
  { id: "neural-link-coding", name: "Neural Link Coding", category: "builder", effectType: "ipc", effectValue: 10_000, baseCost: 250_000 },
];

/** The Founder – Increase IPS (pasif) */
export const UPGRADES_FOUNDER: Upgrade[] = [
  { id: "freelance-project", name: "Freelance Project", category: "founder", effectType: "ips", effectValue: 10, baseCost: 500 },
  { id: "vorca-studio-team", name: "Vorca Studio Team", category: "founder", effectType: "ips", effectValue: 150, baseCost: 5_000 },
  { id: "feedback-hub-saas", name: "Feedback-Hub SaaS", category: "founder", effectType: "ips", effectValue: 1_000, baseCost: 50_000 },
  { id: "gitsheet-enterprise", name: "GitSheet Enterprise", category: "founder", effectType: "ips", effectValue: 5_000, baseCost: 250_000 },
  { id: "global-tech-empire", name: "Global Tech Empire", category: "founder", effectType: "ips", effectValue: 50_000, baseCost: 2_500_000 },
];

/** The Investor – Multiplier / % bonus */
export const UPGRADES_INVESTOR: Upgrade[] = [
  { id: "income-multiplier", name: "Income Multiplier", category: "investor", effectType: "income_multiplier", effectValue: 5, baseCost: 1_000, maxLevel: 20 },
  { id: "xaut-digital-gold", name: "XAUT (Digital Gold)", category: "investor", effectType: "ips_percent", effectValue: 5, baseCost: 10_000 },
  { id: "sp500-voo", name: "S&P 500 (VOO)", category: "investor", effectType: "ips_percent", effectValue: 10, baseCost: 50_000 },
  { id: "nasdaq-qqq", name: "Nasdaq 100 (QQQ)", category: "investor", effectType: "ips_percent", effectValue: 15, baseCost: 250_000 },
  { id: "bitcoin-whale", name: "Bitcoin Whale", category: "investor", effectType: "ips_percent", effectValue: 50, baseCost: 2_000_000 },
  { id: "compound-interest-mastery", name: "Compound Interest Mastery", category: "investor", effectType: "compound", effectValue: 1, baseCost: 10_000_000 },
];

export const UPGRADES: Upgrade[] = [
  ...UPGRADES_BUILDER,
  ...UPGRADES_FOUNDER,
  ...UPGRADES_INVESTOR,
];

export const UPGRADE_CATEGORIES: { id: UpgradeCategory; title: string }[] = [
  { id: "builder", title: "The Builder" },
  { id: "founder", title: "The Founder" },
  { id: "investor", title: "The Investor" },
];

export function getUpgradeCost(baseCost: number, owned: number): number {
  return Math.floor(baseCost * Math.pow(1.15, owned));
}

/** Total cost to buy `count` copies starting from `owned` (cost for owned, owned+1, ... owned+count-1). */
export function getTotalCostForMany(
  baseCost: number,
  owned: number,
  count: number
): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += getUpgradeCost(baseCost, owned + i);
  }
  return total;
}

/** Returns max level for upgrade (or 0 = no cap). */
export function getMaxLevel(upgrade: Upgrade): number {
  return upgrade.maxLevel ?? 0;
}

/** True if this upgrade can still be bought (hasn't reached max level). */
export function canBuyMore(upgrade: Upgrade, owned: number): boolean {
  const max = getMaxLevel(upgrade);
  return max === 0 || owned < max;
}

export function getUpgradesByCategory(category: UpgradeCategory): Upgrade[] {
  return UPGRADES.filter((u) => u.category === category);
}
