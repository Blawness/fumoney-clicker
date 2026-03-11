"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coins, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIdr } from "@/lib/formatIdr";

interface OfflineBannerProps {
  earned: number;
  onDismiss: () => void;
}

export function OfflineBanner({ earned, onDismiss }: OfflineBannerProps) {
  return (
    <AnimatePresence>
      {earned > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3"
        >
          <span className="flex items-center gap-2 text-sm text-primary">
            <Coins className="size-4" />
            You earned <strong className="font-mono">{formatIdr(earned)}</strong> while away.
          </span>
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onDismiss} aria-label="Dismiss">
            <X className="size-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
