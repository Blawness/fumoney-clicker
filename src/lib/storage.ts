const STORAGE_KEY = "fumoney-clicker-save";
const BUY_MULTIPLIER_KEY = "fumoney-clicker-buy-multiplier";

export type StoredBuyMultiplier = "1" | "5" | "10" | "25" | "100" | "max";

const VALID_BUY_MULTIPLIERS: StoredBuyMultiplier[] = ["1", "5", "10", "25", "100", "max"];

export function loadBuyMultiplier(): StoredBuyMultiplier {
  if (typeof window === "undefined") return "1";
  try {
    const raw = localStorage.getItem(BUY_MULTIPLIER_KEY);
    if (raw && VALID_BUY_MULTIPLIERS.includes(raw as StoredBuyMultiplier))
      return raw as StoredBuyMultiplier;
  } catch {
    // ignore
  }
  return "1";
}

export function saveBuyMultiplier(value: StoredBuyMultiplier): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BUY_MULTIPLIER_KEY, value);
  } catch {
    // ignore
  }
}

export interface GameSave {
  balance: number;
  ipc: number;
  ips: number;
  acps: number;
  compoundMultiplier: number;
  ownedUpgrades: Record<string, number>;
  purchasedGoals: string[];
}

const DEFAULT_SAVE: GameSave = {
  balance: 0,
  ipc: 1,
  ips: 0,
  acps: 0,
  compoundMultiplier: 1,
  ownedUpgrades: {},
  purchasedGoals: [],
};

export function loadGame(): GameSave {
  if (typeof window === "undefined") return DEFAULT_SAVE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE;
    const parsed = JSON.parse(raw) as Partial<GameSave>;
    return {
      balance: typeof parsed.balance === "number" ? parsed.balance : DEFAULT_SAVE.balance,
      ipc: typeof parsed.ipc === "number" ? parsed.ipc : DEFAULT_SAVE.ipc,
      ips: typeof parsed.ips === "number" ? parsed.ips : DEFAULT_SAVE.ips,
      acps: typeof parsed.acps === "number" ? parsed.acps : DEFAULT_SAVE.acps,
      compoundMultiplier:
        typeof parsed.compoundMultiplier === "number"
          ? parsed.compoundMultiplier
          : DEFAULT_SAVE.compoundMultiplier,
      ownedUpgrades:
        parsed.ownedUpgrades && typeof parsed.ownedUpgrades === "object"
          ? parsed.ownedUpgrades
          : DEFAULT_SAVE.ownedUpgrades,
      purchasedGoals:
        Array.isArray(parsed.purchasedGoals) ? parsed.purchasedGoals : DEFAULT_SAVE.purchasedGoals,
    };
  } catch {
    return DEFAULT_SAVE;
  }
}

export function saveGame(save: GameSave): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    // ignore
  }
}
