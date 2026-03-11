import type { GameSave } from "@/lib/storage";
import { UPGRADES } from "@/data/upgrades";

/** Compute effective income per second from a save (for offline progress). */
export function getEffectiveIPSFromSave(save: GameSave): number {
  const totalIpsPercent = UPGRADES.filter((u) => u.effectType === "ips_percent").reduce(
    (sum, u) => sum + (save.ownedUpgrades[u.id] ?? 0) * u.effectValue,
    0
  );
  const ipsMultiplier = 1 + totalIpsPercent / 100;
  const incomeMultiplierPercent = UPGRADES.filter(
    (u) => u.effectType === "income_multiplier"
  ).reduce((sum, u) => sum + (save.ownedUpgrades[u.id] ?? 0) * u.effectValue, 0);
  const incomeMultiplier = 1 + incomeMultiplierPercent / 100;
  const base = save.ips * ipsMultiplier + save.acps * save.ipc;
  return base * save.compoundMultiplier * incomeMultiplier;
}

const OFFLINE_CAP_SECONDS = 24 * 60 * 60; // 24 hours

export function getOfflineEarnings(save: GameSave): { earned: number; secondsAway: number } {
  const last = save.lastSaveTimestamp ?? 0;
  if (last <= 0) return { earned: 0, secondsAway: 0 };
  const now = Date.now();
  const elapsedMs = now - last;
  const secondsAway = Math.min(elapsedMs / 1000, OFFLINE_CAP_SECONDS);
  const effectiveIPS = getEffectiveIPSFromSave(save);
  const earned = effectiveIPS * secondsAway;
  return { earned, secondsAway };
}
