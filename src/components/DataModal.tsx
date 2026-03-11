"use client";

import { useRef } from "react";
import { Database, Download, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { exportGameToJson, importGameFromJson, type GameSave } from "@/lib/storage";

interface DataModalProps {
  currentSave: () => GameSave;
  onImport: (save: GameSave) => void;
}

export function DataModal({ currentSave, onImport }: DataModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const save = currentSave();
    const json = exportGameToJson(save);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fumoney-clicker-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const save = importGameFromJson(text);
      if (save) onImport(save);
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className="gap-2">
          <Database className="size-4" />
          Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="size-5" />
            Backup &amp; Restore
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExport}>
            <Download className="size-4" />
            Export save (JSON)
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleImportClick}>
            <Upload className="size-4" />
            Import save
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">
            Export backs up your progress. Import replaces current save with the file.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
