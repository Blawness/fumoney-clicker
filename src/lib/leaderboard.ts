import type { ForbesEntry } from "@/data/forbesTop100";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  wealth: number;
  isPlayer: boolean;
}

/**
 * Builds offline leaderboard by merging Forbes Top 100 with the current player.
 * Sorted by wealth (totalEarned) descending. Top 101 so player is always included if outside top 100.
 */
export function buildLeaderboard(
  forbesEntries: ForbesEntry[],
  player: { name: string; wealth: number }
): LeaderboardEntry[] {
  const playerEntry: ForbesEntry = { name: player.name.trim() || "Player", wealth: player.wealth };
  const combined = [...forbesEntries, playerEntry];
  combined.sort((a, b) => b.wealth - a.wealth);

  const top = combined.slice(0, 101);
  return top.map((entry, index) => ({
    rank: index + 1,
    name: entry.name,
    wealth: entry.wealth,
    isPlayer: entry === playerEntry,
  }));
}
