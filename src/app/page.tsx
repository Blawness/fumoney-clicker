"use client";

import { useState, useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import { loadBuyMultiplier, saveBuyMultiplier, type StoredBuyMultiplier } from "@/lib/storage";
import { BalanceDisplay } from "@/components/BalanceDisplay";
import { ClickerButton } from "@/components/ClickerButton";
import { ProgressToGoal } from "@/components/ProgressToGoal";
import { UpgradesModal } from "@/components/UpgradesModal";
import { FreedomShop } from "@/components/FreedomShop";
import { GOALS } from "@/data/goals";
import {
  buyMultiplierFromStorage,
  buyMultiplierToStorage,
  type BuyMultiplier,
} from "@/components/UpgradesList";

export default function GamePage() {
  const [buyMultiplier, setBuyMultiplierState] = useState<BuyMultiplier>(1);

  useEffect(() => {
    setBuyMultiplierState(buyMultiplierFromStorage(loadBuyMultiplier()));
  }, []);

  const setBuyMultiplier = (value: BuyMultiplier) => {
    setBuyMultiplierState(value);
    saveBuyMultiplier(buyMultiplierToStorage(value) as StoredBuyMultiplier);
  };

  const {
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
    getMaxAffordable,
    buyGoal,
    progressToNextGoal,
  } = useGameState();

  const { goal: nextGoal, progress } = progressToNextGoal();
  const highestGoal = [...GOALS].reverse().find((g) =>
    purchasedGoals.includes(g.id)
  );

  const isFuckYouMoney = purchasedGoals.includes("fuck-you-money");

  return (
    <main
      className={`min-h-screen px-4 py-6 md:px-6 md:py-8 ${
        isFuckYouMoney
          ? "bg-gradient-to-b from-zinc-950 via-zinc-900 to-primary/5"
          : "bg-zinc-950"
      }`}
    >
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
            The Fuck You Money Clicker
          </h1>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              <UpgradesModal
                balance={balance}
                ownedUpgrades={ownedUpgrades}
                buyMultiplier={buyMultiplier}
                onBuyMultiplierChange={setBuyMultiplier}
                onBuy={buyUpgrade}
                getMaxAffordable={getMaxAffordable}
              />
            </div>
            <BalanceDisplay balance={balance} />
            <p className="text-xs text-muted-foreground">
              +{ipc} IPC · {Math.floor(effectiveIncomePerSecond)}/s
              {ipsMultiplier > 1 && ` (${ipsMultiplier.toFixed(1)}× IPS)`}
              {compoundMultiplier > 1 && ` · ${compoundMultiplier}× compound`}
              {acps > 0 && ` · ${acps} auto/s`}
            </p>
          </div>
        </header>

        {/* Status banner when a goal is reached */}
        {highestGoal && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-center text-sm text-primary">
            Unlocked: {highestGoal.label}
          </div>
        )}

        {/* Click area + progress */}
        <section className="flex flex-col items-center gap-6">
          <ClickerButton onClick={click} />
          <div className="w-full max-w-md">
            <ProgressToGoal goal={nextGoal} progress={progress} />
          </div>
        </section>

        {/* Freedom Shop */}
        <section>
          <FreedomShop
            goals={GOALS}
            balance={balance}
            purchasedGoals={purchasedGoals}
            onBuy={buyGoal}
          />
        </section>
      </div>
    </main>
  );
}
