"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import type { Goal } from "@/data/goals";

interface ProgressToGoalProps {
  goal: Goal | null;
  progress: number;
}

export function ProgressToGoal({ goal, progress }: ProgressToGoalProps) {
  if (!goal) {
    return (
      <div className="w-full space-y-2">
        <p className="text-center text-sm text-muted-foreground">
          All goals unlocked. You made it.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Next: {goal.label}</span>
        <span className="font-mono tabular-nums text-muted-foreground">
          {Math.min(100, Math.round(progress))}%
        </span>
      </div>
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Progress value={Math.min(100, progress)} className="h-3" />
      </motion.div>
    </div>
  );
}
