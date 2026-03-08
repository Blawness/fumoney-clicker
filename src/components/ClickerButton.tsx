"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingText {
  id: string;
  value: number;
}

interface ClickerButtonProps {
  onClick: () => number;
  disabled?: boolean;
}

export function ClickerButton({ onClick, disabled }: ClickerButtonProps) {
  const [floats, setFloats] = useState<FloatingText[]>([]);

  const handleClick = useCallback(() => {
    const value = onClick();
    const id = `float-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setFloats((prev) => [...prev, { id, value }]);
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id));
    }, 800);
  }, [onClick]);

  return (
    <div className="relative flex flex-col items-center justify-center">
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
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-primary"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -48 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              +{float.value}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
