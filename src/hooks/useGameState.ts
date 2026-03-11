"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { loadGame, saveGame, type GameSave, DEFAULT_STATS, type GameStats } from "@/lib/storage";
import { getUpgradeCost, getTotalCostForMany, canBuyMore, getMaxLevel, UPGRADES } from "@/data/upgrades";
import type { Upgrade } from "@/data/upgrades";
import { GOALS } from "@/data/goals";
import { getOfflineEarnings } from "@/lib/offlineEarnings";
import { getNewlyUnlocked } from "@/data/achievements";

const COMPOUND_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const SAVE_DEBOUNCE_MS = 400;

/** Base time window (ms) to keep combo alive. Extended by combo_window upgrade. */
const COMBO_WINDOW_BASE_MS = 1200;
/** Base bonus multiplier per combo step (e.g. 2nd hit = 1 + 0.25). Increased by combo_multiplier upgrade. */
const COMBO_STEP_BASE = 0.25;

export function useGameState() {
  const [balance, setBalance] = useState(0);
  const [ipc, setIpc] = useState(1);
  const [ips, setIps] = useState(0);
  const [acps, setAcps] = useState(0);
  const [compoundMultiplier, setCompoundMultiplier] = useState(1);
  const [ownedUpgrades, setOwnedUpgrades] = useState<Record<string, number>>({});
  const [purchasedGoals, setPurchasedGoals] = useState<string[]>([]);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [offlineEarned, setOfflineEarned] = useState(0);
  const lastClickTime = useRef(0);
  const comboRef = useRef(0);
  const comboDecayTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  // Total IPS % from Investor upgrades (e.g. 5+10+15 = 30 => 1.30x)
  const totalIpsPercent = UPGRADES.filter(
    (u) => u.effectType === "ips_percent"
  ).reduce(
    (sum, u) => sum + (ownedUpgrades[u.id] ?? 0) * u.effectValue,
    0
  );
  const ipsMultiplier = 1 + totalIpsPercent / 100;

  // Income multiplier from "Income Multiplier" upgrade (bertahap hingga max level)
  const incomeMultiplierPercent = UPGRADES.filter(
    (u) => u.effectType === "income_multiplier"
  ).reduce(
    (sum, u) => sum + (ownedUpgrades[u.id] ?? 0) * u.effectValue,
    0
  );
  const incomeMultiplier = 1 + incomeMultiplierPercent / 100;

  // Income per second: (base IPS * multiplier + auto clicks) * compound * income multiplier
  const baseIncomePerSecond = ips * ipsMultiplier + acps * ipc;
  const effectiveIncomePerSecond =
    baseIncomePerSecond * compoundMultiplier * incomeMultiplier;

  // Load once on mount + apply offline progress
  useEffect(() => {
    if (typeof window === "undefined" || initialized.current) return;
    const save = loadGame();
    const { earned: offlineAmount, secondsAway } = getOfflineEarnings(save);
    const newBalance = save.balance + offlineAmount;
    const baseStats = save.stats ?? DEFAULT_STATS;
    setBalance(newBalance);
    setIpc(save.ipc);
    setIps(save.ips);
    setAcps(save.acps);
    setCompoundMultiplier(save.compoundMultiplier);
    setOwnedUpgrades(save.ownedUpgrades);
    setPurchasedGoals(save.purchasedGoals);
    setStats({ ...baseStats, totalEarned: baseStats.totalEarned + offlineAmount });
    setUnlockedAchievements(save.unlockedAchievements ?? []);
    if (offlineAmount > 0) setOfflineEarned(offlineAmount);
    initialized.current = true;
  }, []);

  // Persist with debounce (lastSaveTimestamp set inside saveGame)
  useEffect(() => {
    if (!initialized.current) return;
    const t = setTimeout(() => {
      saveGame({
        balance,
        ipc,
        ips,
        acps,
        compoundMultiplier,
        ownedUpgrades,
        purchasedGoals,
        stats,
        unlockedAchievements,
      });
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [balance, ipc, ips, acps, compoundMultiplier, ownedUpgrades, purchasedGoals, stats, unlockedAchievements]);

  // Income tick every second
  useEffect(() => {
    if (effectiveIncomePerSecond <= 0) return;
    const interval = setInterval(() => {
      setBalance((b) => b + effectiveIncomePerSecond);
      setStats((s) => ({ ...s, totalEarned: s.totalEarned + effectiveIncomePerSecond }));
    }, 1000);
    return () => clearInterval(interval);
  }, [effectiveIncomePerSecond]);

  // Play time: +1s every second
  useEffect(() => {
    if (!initialized.current) return;
    const interval = setInterval(() => {
      setStats((s) => ({ ...s, playTimeMs: s.playTimeMs + 1000 }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compound Interest Mastery: double income every 5 minutes
  const hasCompoundUpgrade =
    (ownedUpgrades["compound-interest-mastery"] ?? 0) > 0;
  useEffect(() => {
    if (!hasCompoundUpgrade) return;
    const interval = setInterval(() => {
      setCompoundMultiplier((m) => m * 2);
    }, COMPOUND_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasCompoundUpgrade]);

  // Combo window (ms): base + upgrade bonus
  const comboWindowMs =
    COMBO_WINDOW_BASE_MS +
    (ownedUpgrades["combo-window"] ?? 0) * (UPGRADES.find((u) => u.id === "combo-window")?.effectValue ?? 150);

  // Combo step multiplier: base + upgrade bonus (e.g. 0.25 + 0.03 per level)
  const comboStepBonus =
    COMBO_STEP_BASE +
    (ownedUpgrades["combo-multiplier"] ?? 0) * ((UPGRADES.find((u) => u.id === "combo-multiplier")?.effectValue ?? 3) / 100);

  const click = useCallback(() => {
    const now = Date.now();
    const prevCombo = comboRef.current;
    const nextCombo =
      now - lastClickTime.current <= comboWindowMs && prevCombo >= 1
        ? prevCombo + 1
        : 1;
    lastClickTime.current = now;
    comboRef.current = nextCombo;
    setCombo(nextCombo);

    if (comboDecayTimeout.current) {
      clearTimeout(comboDecayTimeout.current);
      comboDecayTimeout.current = null;
    }
    comboDecayTimeout.current = setTimeout(() => {
      comboRef.current = 0;
      setCombo(0);
      comboDecayTimeout.current = null;
    }, comboWindowMs);

    const multiplier = nextCombo <= 1 ? 1 : 1 + (nextCombo - 1) * comboStepBonus;
    const reward = ipc * multiplier;
    setBalance((b) => b + reward);
    setStats((s) => ({
      ...s,
      totalClicks: s.totalClicks + 1,
      totalEarned: s.totalEarned + reward,
      highestCombo: Math.max(s.highestCombo, nextCombo),
    }));
    return { value: reward, combo: nextCombo, multiplier };
  }, [ipc, comboWindowMs, comboStepBonus]);

  const buyUpgrade = useCallback(
    (upgrade: Upgrade, quantity: number = 1) => {
      const owned = ownedUpgrades[upgrade.id] ?? 0;
      const max = getMaxLevel(upgrade);
      const maxBuy = max === 0 ? quantity : Math.min(quantity, max - owned);
      if (maxBuy <= 0) return 0;
      const cost = getTotalCostForMany(upgrade.baseCost, owned, maxBuy);
      if (balance < cost) return 0;
      setBalance((b) => b - cost);
      const newOwned = owned + maxBuy;
      setOwnedUpgrades((prev) => ({
        ...prev,
        [upgrade.id]: newOwned,
      }));
      if (upgrade.effectType === "ipc") {
        setIpc((i) => i + upgrade.effectValue * maxBuy);
      } else if (upgrade.effectType === "acps") {
        setAcps((a) => a + upgrade.effectValue * maxBuy);
      } else if (upgrade.effectType === "ips") {
        setIps((i) => i + upgrade.effectValue * maxBuy);
      }
      return maxBuy;
    },
    [balance, ownedUpgrades]
  );

  /** How many of this upgrade can be bought with current balance (capped by max level). */
  const getMaxAffordable = useCallback(
    (upgrade: Upgrade): number => {
      const owned = ownedUpgrades[upgrade.id] ?? 0;
      if (!canBuyMore(upgrade, owned)) return 0;
      const max = getMaxLevel(upgrade);
      let n = 1;
      while (true) {
        const nextN = n + 1;
        if (max > 0 && owned + nextN > max) break;
        const cost = getTotalCostForMany(upgrade.baseCost, owned, nextN);
        if (cost > balance) break;
        n = nextN;
      }
      return n;
    },
    [balance, ownedUpgrades]
  );

  // Achievement check: unlock any newly satisfied
  useEffect(() => {
    if (!initialized.current) return;
    const added = getNewlyUnlocked(unlockedAchievements, {
      totalEarned: stats.totalEarned,
      highestCombo: stats.highestCombo,
      purchasedGoals,
      ownedUpgrades,
    });
    if (added.length > 0)
      setUnlockedAchievements((prev) => [...prev, ...added]);
  }, [stats.totalEarned, stats.highestCombo, purchasedGoals, ownedUpgrades, unlockedAchievements]);

  const buyGoal = useCallback(
    (goalId: string) => {
      const goal = GOALS.find((g) => g.id === goalId);
      if (!goal || purchasedGoals.includes(goalId) || balance < goal.cost)
        return false;
      setBalance((b) => b - goal.cost);
      setPurchasedGoals((prev) => [...prev, goalId]);
      return true;
    },
    [balance, purchasedGoals]
  );

  const getNextGoal = useCallback(() => {
    const notPurchased = GOALS.filter((g) => !purchasedGoals.includes(g.id));
    return notPurchased[0] ?? null;
  }, [purchasedGoals]);

  const progressToNextGoal = useCallback(() => {
    const next = getNextGoal();
    if (!next) return { goal: null, progress: 100 };
    const progress = Math.min(100, (balance / next.cost) * 100);
    return { goal: next, progress };
  }, [balance, getNextGoal]);

  const clearOfflineBanner = useCallback(() => setOfflineEarned(0), []);

  const getCurrentSave = useCallback((): GameSave => ({
    balance,
    ipc,
    ips,
    acps,
    compoundMultiplier,
    ownedUpgrades,
    purchasedGoals,
    stats,
    unlockedAchievements,
    lastSaveTimestamp: Date.now(),
  }), [balance, ipc, ips, acps, compoundMultiplier, ownedUpgrades, purchasedGoals, stats, unlockedAchievements]);

  const replaceWithSave = useCallback((save: GameSave) => {
    setBalance(save.balance);
    setIpc(save.ipc);
    setIps(save.ips);
    setAcps(save.acps);
    setCompoundMultiplier(save.compoundMultiplier);
    setOwnedUpgrades(save.ownedUpgrades ?? {});
    setPurchasedGoals(save.purchasedGoals ?? []);
    setStats(save.stats ?? DEFAULT_STATS);
    setUnlockedAchievements(save.unlockedAchievements ?? []);
  }, []);

  return {
    balance,
    ipc,
    ips,
    acps,
    compoundMultiplier,
    ipsMultiplier,
    incomeMultiplier,
    effectiveIncomePerSecond,
    ownedUpgrades,
    purchasedGoals,
    combo,
    stats,
    unlockedAchievements,
    offlineEarned,
    clearOfflineBanner,
    getCurrentSave,
    replaceWithSave,
    click,
    buyUpgrade,
    getMaxAffordable,
    buyGoal,
    getNextGoal,
    progressToNextGoal,
  };
}
