"use client";

import { ArrowUpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UpgradesList, type BuyMultiplier } from "@/components/UpgradesList";
import type { Upgrade } from "@/data/upgrades";

interface UpgradesModalProps {
  balance: number;
  ownedUpgrades: Record<string, number>;
  buyMultiplier: BuyMultiplier;
  onBuyMultiplierChange: (value: BuyMultiplier) => void;
  onBuy: (upgrade: Upgrade, quantity?: number) => void;
  getMaxAffordable: (upgrade: Upgrade) => number;
}

export function UpgradesModal({
  balance,
  ownedUpgrades,
  buyMultiplier,
  onBuyMultiplierChange,
  onBuy,
  getMaxAffordable,
}: UpgradesModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className="gap-2">
          <ArrowUpCircle className="size-4" />
          Upgrades
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-2">
          <DialogTitle>Upgrades</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <UpgradesList
            balance={balance}
            ownedUpgrades={ownedUpgrades}
            buyMultiplier={buyMultiplier}
            onBuyMultiplierChange={onBuyMultiplierChange}
            onBuy={onBuy}
            getMaxAffordable={getMaxAffordable}
            hideTitle
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
