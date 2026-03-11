"use client";

import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PlayerNameEditProps {
  playerName: string;
  onSave: (name: string) => void;
}

export function PlayerNameEdit({ playerName, onSave }: PlayerNameEditProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(playerName);

  useEffect(() => {
    setValue(playerName);
  }, [playerName, open]);

  const handleSave = () => {
    const trimmed = value.trim();
    onSave(trimmed);
    setOpen(false);
  };

  const displayName = playerName.trim() || "Set name";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-1.5 px-2 py-1 text-muted-foreground hover:text-zinc-100"
        >
          <Pencil className="size-3.5" />
          <span className="max-w-[140px] truncate">{displayName}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Player name</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Your name"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={32}
            autoFocus
          />
          <Button onClick={handleSave} size="sm">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
