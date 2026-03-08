"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { loadGame, saveGame, type GameSave } from "@/lib/storage";
import { getUpgradeCost } from "@/data/upgrades";
import type { Upgrade } from "@/data/upgrades";
import { GOALS } from "@/data/goals";

const SAVE_DEBOUNCE_MS = 400;

export function useGameState() {
  const [balance, setBalance] = useState(0);
  const [ipc, setIpc] = useState(1);
  const [ips, setIps] = useState(0);
  const [ownedUpgrades, setOwnedUpgrades] = useState<Record<string, number>>({});
  const [purchasedGoals, setPurchasedGoals] = useState<string[]>([]);
  const initialized = useRef(false);

  // Load once on mount
  useEffect(() => {
    if (typeof window === "undefined" || initialized.current) return;
    const save = loadGame();
    setBalance(save.balance);
    setIpc(save.ipc);
    setIps(save.ips);
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
        ownedUpgrades,
        purchasedGoals,
      });
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [balance, ipc, ips, ownedUpgrades, purchasedGoals]);

  // IPS tick every second
  useEffect(() => {
    if (ips <= 0) return;
    const interval = setInterval(() => {
      setBalance((b) => b + ips);
    }, 1000);
    return () => clearInterval(interval);
  }, [ips]);

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
      } else {
        setIps((i) => i + upgrade.effectValue);
      }
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
    ownedUpgrades,
    purchasedGoals,
    click,
    buyUpgrade,
    buyGoal,
    getNextGoal,
    progressToNextGoal,
  };
}
