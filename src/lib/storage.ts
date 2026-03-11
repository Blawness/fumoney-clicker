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

export interface GameStats {
  totalClicks: number;
  totalEarned: number;
  playTimeMs: number;
  highestCombo: number;
}

export const DEFAULT_STATS: GameStats = {
  totalClicks: 0,
  totalEarned: 0,
  playTimeMs: 0,
  highestCombo: 0,
};

export interface GameSave {
  balance: number;
  ipc: number;
  ips: number;
  acps: number;
  compoundMultiplier: number;
  ownedUpgrades: Record<string, number>;
  purchasedGoals: string[];
  /** Stats: total clicks, total earned (lifetime), play time, highest combo */
  stats?: GameStats;
  /** Unlocked achievement IDs */
  unlockedAchievements?: string[];
  /** Timestamp (ms) when save was last written – for offline progress */
  lastSaveTimestamp?: number;
  /** Rebirth: number of times reborn */
  rebirthCount?: number;
  /** Rebirth: points available to spend on permanent upgrades */
  rebirthPoints?: number;
  /** Rebirth: level per permanent upgrade id */
  ownedRebirthUpgrades?: Record<string, number>;
  /** Custom player display name */
  playerName?: string;
}

const DEFAULT_SAVE: GameSave = {
  balance: 0,
  ipc: 1,
  ips: 0,
  acps: 0,
  compoundMultiplier: 1,
  ownedUpgrades: {},
  purchasedGoals: [],
  stats: DEFAULT_STATS,
  unlockedAchievements: [],
  lastSaveTimestamp: 0,
  rebirthCount: 0,
  rebirthPoints: 0,
  ownedRebirthUpgrades: {},
  playerName: undefined,
};

function normalizeStats(parsed: Partial<GameSave>): GameStats {
  const s = parsed.stats;
  if (s && typeof s === "object")
    return {
      totalClicks: typeof s.totalClicks === "number" ? s.totalClicks : DEFAULT_STATS.totalClicks,
      totalEarned: typeof s.totalEarned === "number" ? s.totalEarned : DEFAULT_STATS.totalEarned,
      playTimeMs: typeof s.playTimeMs === "number" ? s.playTimeMs : DEFAULT_STATS.playTimeMs,
      highestCombo: typeof s.highestCombo === "number" ? s.highestCombo : DEFAULT_STATS.highestCombo,
    };
  return DEFAULT_STATS;
}

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
      stats: normalizeStats(parsed),
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements
        : DEFAULT_SAVE.unlockedAchievements!,
      lastSaveTimestamp:
        typeof parsed.lastSaveTimestamp === "number" ? parsed.lastSaveTimestamp : 0,
      rebirthCount: typeof parsed.rebirthCount === "number" ? parsed.rebirthCount : 0,
      rebirthPoints: typeof parsed.rebirthPoints === "number" ? parsed.rebirthPoints : 0,
      ownedRebirthUpgrades:
        parsed.ownedRebirthUpgrades && typeof parsed.ownedRebirthUpgrades === "object"
          ? parsed.ownedRebirthUpgrades
          : {},
      playerName:
        typeof parsed.playerName === "string" && parsed.playerName.trim() !== ""
          ? parsed.playerName.trim()
          : undefined,
    };
  } catch {
    return DEFAULT_SAVE;
  }
}

export function saveGame(save: GameSave): void {
  if (typeof window === "undefined") return;
  try {
    const toSave: GameSave = {
      ...save,
      lastSaveTimestamp: Date.now(),
      rebirthCount: save.rebirthCount ?? 0,
      rebirthPoints: save.rebirthPoints ?? 0,
      ownedRebirthUpgrades: save.ownedRebirthUpgrades ?? {},
      playerName: typeof save.playerName === "string" && save.playerName.trim() !== "" ? save.playerName.trim() : undefined,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

/** Full export payload for download / backup */
export interface ExportSave {
  version: number;
  exportedAt: number;
  save: GameSave;
}

const EXPORT_VERSION = 1;

export function exportGameToJson(save: GameSave): string {
  const payload: ExportSave = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    save: { ...save, lastSaveTimestamp: save.lastSaveTimestamp ?? Date.now() },
  };
  return JSON.stringify(payload, null, 2);
}

export function importGameFromJson(json: string): GameSave | null {
  try {
    const payload = JSON.parse(json) as ExportSave;
    if (!payload || typeof payload.save !== "object") return null;
    const s = payload.save;
    return {
      balance: typeof s.balance === "number" ? s.balance : DEFAULT_SAVE.balance,
      ipc: typeof s.ipc === "number" ? s.ipc : DEFAULT_SAVE.ipc,
      ips: typeof s.ips === "number" ? s.ips : DEFAULT_SAVE.ips,
      acps: typeof s.acps === "number" ? s.acps : DEFAULT_SAVE.acps,
      compoundMultiplier:
        typeof s.compoundMultiplier === "number" ? s.compoundMultiplier : DEFAULT_SAVE.compoundMultiplier,
      ownedUpgrades: s.ownedUpgrades && typeof s.ownedUpgrades === "object" ? s.ownedUpgrades : DEFAULT_SAVE.ownedUpgrades,
      purchasedGoals: Array.isArray(s.purchasedGoals) ? s.purchasedGoals : DEFAULT_SAVE.purchasedGoals,
      stats: normalizeStats(s),
      unlockedAchievements: Array.isArray(s.unlockedAchievements) ? s.unlockedAchievements : DEFAULT_SAVE.unlockedAchievements!,
      lastSaveTimestamp: typeof s.lastSaveTimestamp === "number" ? s.lastSaveTimestamp : 0,
      rebirthCount: typeof s.rebirthCount === "number" ? s.rebirthCount : 0,
      rebirthPoints: typeof s.rebirthPoints === "number" ? s.rebirthPoints : 0,
      ownedRebirthUpgrades: s.ownedRebirthUpgrades && typeof s.ownedRebirthUpgrades === "object" ? s.ownedRebirthUpgrades : {},
      playerName: typeof s.playerName === "string" && s.playerName.trim() !== "" ? s.playerName.trim() : undefined,
    };
  } catch {
    return null;
  }
}
