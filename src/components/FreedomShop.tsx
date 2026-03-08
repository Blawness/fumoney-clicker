"use client";

import { motion } from "framer-motion";
import { Check, Car, Home, Heart, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatIdr } from "@/lib/formatIdr";
import type { Goal } from "@/data/goals";

const GOAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "dream-car": Car,
  "south-jakarta-house": Home,
  "wedding-fund": Heart,
  "fuck-you-money": Trophy,
};

interface FreedomShopProps {
  goals: Goal[];
  balance: number;
  purchasedGoals: string[];
  onBuy: (goalId: string) => void;
}

export function FreedomShop({
  goals,
  balance,
  purchasedGoals,
  onBuy,
}: FreedomShopProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Freedom Shop</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {goals.map((goal) => {
          const purchased = purchasedGoals.includes(goal.id);
          const canAfford = balance >= goal.cost;
          const Icon = GOAL_ICONS[goal.id];

          return (
            <motion.li
              key={goal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={
                  purchased
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-card/50"
                }
              >
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="size-5 text-muted-foreground" />}
                    <span className="font-medium">{goal.label}</span>
                  </div>
                  {purchased ? (
                    <span className="flex items-center gap-1 text-sm text-primary">
                      <Check className="size-4" /> Purchased
                    </span>
                  ) : (
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!canAfford}
                        onClick={() => onBuy(goal.id)}
                      >
                        {formatIdr(goal.cost)}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
