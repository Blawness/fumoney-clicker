"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ComboClickResult {
  value: number;
  combo: number;
  multiplier: number;
}

interface FloatingText {
  id: string;
  value: number;
  combo: number;
  multiplier: number;
}

interface ClickerButtonProps {
  onClick: () => ComboClickResult;
  disabled?: boolean;
  /** Current combo (for display above button) */
  combo?: number;
}

export function ClickerButton({ onClick, disabled, combo = 0 }: ClickerButtonProps) {
  const [floats, setFloats] = useState<FloatingText[]>([]);

  const handleClick = useCallback(() => {
    const result = onClick();
    const id = `float-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setFloats((prev) => [...prev, { id, value: result.value, combo: result.combo, multiplier: result.multiplier }]);
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id));
    }, 1000);
  }, [onClick]);

  return (
    <div className="relative flex flex-col items-center justify-center gap-3">
      {/* Combo counter - meriah */}
      <AnimatePresence mode="wait">
        {combo > 1 && (
          <motion.div
            key={combo}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="pointer-events-none flex items-center gap-2 rounded-full border-2 border-amber-400/80 bg-amber-500/20 px-4 py-1.5 shadow-lg shadow-amber-500/25"
          >
            <span className="text-sm font-bold uppercase tracking-wider text-amber-200">
              Combo
            </span>
            <motion.span
              key={`${combo}-num`}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="text-xl font-black tabular-nums text-amber-300"
            >
              ×{combo}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative"
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          size="xl"
          className="relative min-h-[140px] min-w-[200px] text-lg md:min-h-[160px] md:min-w-[240px] md:text-xl"
          onClick={handleClick}
          disabled={disabled}
        >
          <Code2 className="mr-2 size-6 md:size-8" />
          Work / Code
        </Button>
        <AnimatePresence>
          {floats.map((float) => (
            <motion.span
              key={float.id}
              className="pointer-events-none absolute left-1/2 top-1/2 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -56, scale: float.combo > 1 ? 1.1 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span
                className={`text-center font-bold tabular-nums ${
                  float.combo > 1
                    ? "text-lg text-amber-300 drop-shadow-sm md:text-xl"
                    : "text-lg text-primary md:text-xl"
                }`}
              >
                +{Math.round(float.value)}
              </span>
              {float.combo > 1 && (
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                  ×{float.multiplier.toFixed(1)} combo!
                </span>
              )}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
