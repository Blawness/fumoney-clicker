/** Minimum totalEarned (this run) to allow rebirth */
export const REBIRTH_THRESHOLD = 50e6; // 50M

/** totalEarned / REBIRTH_DIVISOR = rebirth points (e.g. 100M → 1 point) */
export const REBIRTH_DIVISOR = 1e8; // 100M per point

export function canRebirth(totalEarned: number): boolean {
  return totalEarned >= REBIRTH_THRESHOLD;
}

export function getRebirthPointsFromTotalEarned(totalEarned: number): number {
  if (totalEarned < REBIRTH_THRESHOLD) return 0;
  return Math.floor(totalEarned / REBIRTH_DIVISOR);
}
