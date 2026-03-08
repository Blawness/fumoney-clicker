"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { loadGame, saveGame, type GameSave } from "@/lib/storage";
import { getUpgradeCost, UPGRADES } from "@/data/upgrades";
import type { Upgrade } from "@/data/upgrades";
import { GOALS } from "@/data/goals";

const COMPOUND_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const SAVE_DEBOUNCE_MS = 400;

export function useGameState() {
  const [balance, setBalance] = useState(0);
  const [ipc, setIpc] = useState(1);
  const [ips, setIps] = useState(0);
  const [acps, setAcps] = useState(0);
  const [compoundMultiplier, setCompoundMultiplier] = useState(1);
  const [ownedUpgrades, setOwnedUpgrades] = useState<Record<string, number>>({});
  const [purchasedGoals, setPurchasedGoals] = useState<string[]>([]);
  const initialized = useRef(false);

  // Total IPS % from Investor upgrades (e.g. 5+10+15 = 30 => 1.30x)
  const totalIpsPercent = UPGRADES.filter(
    (u) => u.effectType === "ips_percent"
  ).reduce(
    (sum, u) => sum + (ownedUpgrades[u.id] ?? 0) * u.effectValue,
    0
  );
  const ipsMultiplier = 1 + totalIpsPercent / 100;

  // Income per second: (base IPS * multiplier + auto clicks) * compound
  const baseIncomePerSecond = ips * ipsMultiplier + acps * ipc;
  const effectiveIncomePerSecond = baseIncomePerSecond * compoundMultiplier;

  // Load once on mount
  useEffect(() => {
    if (typeof window === "undefined" || initialized.current) return;
    const save = loadGame();
    setBalance(save.balance);
    setIpc(save.ipc);
    setIps(save.ips);
    setAcps(save.acps);
    setCompoundMultiplier(save.compoundMultiplier);
    setOwnedUpgrades(save.ownedUpgrades);
    setPurchasedGoals(save.purchasedGoals);
    initialized.current = true;
  }, []);

  // Persist with debounce
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
      });
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [balance, ipc, ips, acps, compoundMultiplier, ownedUpgrades, purchasedGoals]);

  // Income tick every second
  useEffect(() => {
    if (effectiveIncomePerSecond <= 0) return;
    const interval = setInterval(() => {
      setBalance((b) => b + effectiveIncomePerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [effectiveIncomePerSecond]);

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

  const click = useCallback(() => {
    setBalance((b) => b + ipc);
    return ipc;
  }, [ipc]);

  const buyUpgrade = useCallback(
    (upgrade: Upgrade) => {
      const owned = ownedUpgrades[upgrade.id] ?? 0;
      const cost = getUpgradeCost(upgrade.baseCost, owned);
      if (balance < cost) return false;
      setBalance((b) => b - cost);
      setOwnedUpgrades((prev) => ({
        ...prev,
        [upgrade.id]: (prev[upgrade.id] ?? 0) + 1,
      }));
      if (upgrade.effectType === "ipc") {
        setIpc((i) => i + upgrade.effectValue);
      } else if (upgrade.effectType === "acps") {
        setAcps((a) => a + upgrade.effectValue);
      } else if (upgrade.effectType === "ips") {
        setIps((i) => i + upgrade.effectValue);
      }
      // ips_percent and compound: no direct state, computed from ownedUpgrades
      return true;
    },
    [balance, ownedUpgrades]
  );

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

  return {
    balance,
    ipc,
    ips,
    acps,
    compoundMultiplier,
    ipsMultiplier,
    effectiveIncomePerSecond,
    ownedUpgrades,
    purchasedGoals,
    click,
    buyUpgrade,
    buyGoal,
    getNextGoal,
    progressToNextGoal,
  };
}
