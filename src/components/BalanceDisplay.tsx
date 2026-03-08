"use client";

import { motion } from "framer-motion";
import { formatIdr } from "@/lib/formatIdr";

interface BalanceDisplayProps {
  balance: number;
}

export function BalanceDisplay({ balance }: BalanceDisplayProps) {
  return (
    <motion.span
      key={balance}
      initial={{ scale: 1.05 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="tabular-nums font-mono text-xl font-semibold text-primary md:text-2xl"
    >
      {formatIdr(balance)}
    </motion.span>
  );
}
