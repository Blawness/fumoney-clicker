"use client";

import { useState, useEffect, useRef } from "react";
import { TERMINAL_BLOCKS, type TerminalBlock } from "@/data/terminalLines";

const PROMPT_COLOR = "text-emerald-400";
const COMMAND_COLOR = "text-green-300";
const OUTPUT_COLOR = "text-zinc-400";
const TYPING_DELAY_MS = 45;
const TYPING_DELAY_AFTER_LINE_MS = 800;
const MAX_VISIBLE_LINES = 14;

function useTerminalTyping(blocks: TerminalBlock[]) {
  const [completedLines, setCompletedLines] = useState<{ prompt: string; command: string; output: string }[]>([]);
  const [blockIndex, setBlockIndex] = useState(0);
  const [phase, setPhase] = useState<"command" | "output">("command");
  const [charIndex, setCharIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const pauseRef = useRef(false);
  const block = blocks[blockIndex % blocks.length];
  const isCommandPhase = phase === "command";
  const currentText = isCommandPhase ? block.command : block.output;
  const displayedChars = currentText.slice(0, charIndex);

  // Cursor blink
  useEffect(() => {
    const t = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(t);
  }, []);

  // Typing advance
  useEffect(() => {
    if (pauseRef.current) return;
    if (charIndex >= currentText.length) {
      if (phase === "command") {
        setPhase("output");
        setCharIndex(0);
      } else {
        pauseRef.current = true;
        setCompletedLines((prev) => {
          const next = [...prev, { prompt: block.prompt, command: block.command, output: block.output }];
          return next.slice(-MAX_VISIBLE_LINES);
        });
        const t = setTimeout(() => {
          setBlockIndex((i) => i + 1);
          setPhase("command");
          setCharIndex(0);
          pauseRef.current = false;
        }, TYPING_DELAY_AFTER_LINE_MS);
        return () => clearTimeout(t);
      }
      return;
    }
    const jitter = Math.floor(Math.random() * 25) - 10;
    const delay = Math.max(25, TYPING_DELAY_MS + jitter);
    const t = setTimeout(() => setCharIndex((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [charIndex, phase, currentText.length, block.prompt, block.command, block.output]);

  return {
    completedLines,
    block,
    phase,
    displayedChars,
    cursorVisible,
    isCommandPhase,
  };
}

export function TerminalMock() {
  const {
    completedLines,
    block,
    phase,
    displayedChars,
    cursorVisible,
    isCommandPhase,
  } = useTerminalTyping(TERMINAL_BLOCKS);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700/80 bg-[#0a0e14] shadow-xl shadow-black/40 font-mono">
      {/* Ubuntu-style title bar */}
      <div className="flex items-center gap-2 border-b border-zinc-700/80 bg-zinc-800/60 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-red-500/90" />
          <span className="size-3 rounded-full bg-amber-500/90" />
          <span className="size-3 rounded-full bg-emerald-500/90" />
        </div>
        <span className="ml-2 text-xs text-zinc-500">player@fumoney — Terminal</span>
      </div>

      {/* Content */}
      <div className="min-h-[200px] p-3 text-sm">
        {completedLines.map((line, i) => (
          <div key={i} className="mb-0.5">
            <span className={PROMPT_COLOR}>{line.prompt}</span>
            <span className={COMMAND_COLOR}>{line.command}</span>
            <div className={`ml-0 whitespace-pre-line ${OUTPUT_COLOR}`}>{line.output}</div>
          </div>
        ))}
        <div className="mb-0.5">
          <span className={PROMPT_COLOR}>{block.prompt}</span>
          {isCommandPhase ? (
            <>
              <span className={COMMAND_COLOR}>{displayedChars}</span>
              {cursorVisible && (
                <span className="inline-block w-2.5 animate-pulse bg-emerald-400 align-middle" style={{ height: "1em" }} />
              )}
            </>
          ) : (
            <>
              <span className={COMMAND_COLOR}>{block.command}</span>
              <div className={`ml-0 whitespace-pre-line ${OUTPUT_COLOR}`}>
                {displayedChars}
                {cursorVisible && (
                  <span className="inline-block w-2.5 animate-pulse bg-zinc-500 align-middle" style={{ height: "1em" }} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
