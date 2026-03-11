/**
 * Lines for the mock terminal typing animation.
 * Each block: prompt (shown immediately) + command (typed) then output (typed on next line).
 */
export interface TerminalBlock {
  prompt: string;
  command: string;
  output: string;
}

export const TERMINAL_BLOCKS: TerminalBlock[] = [
  { prompt: "player@fumoney:~$ ", command: "npm run money", output: "💰 Building wealth... Done. (+150 IPC)" },
  { prompt: "player@fumoney:~$ ", command: "git status", output: "On branch main. Your branch is ahead of 'reality' by 1 commit." },
  { prompt: "player@fumoney:~$ ", command: "./click.sh", output: "Working... 💵 Earned." },
  { prompt: "player@fumoney:~$ ", command: "cat goals.txt", output: "1. Dream Car ✓\n2. South Jakarta House\n3. Fuck You Money" },
  { prompt: "player@fumoney:~$ ", command: "python3 earn.py", output: "Running... IPC: 12 | Combo: 3x" },
  { prompt: "player@fumoney:~$ ", command: "ls -la wallet/", output: "total 1.2B\nbalance.idr  upgrades.json" },
  { prompt: "player@fumoney:~$ ", command: "echo $FU_MONEY", output: "true" },
  { prompt: "player@fumoney:~$ ", command: "yarn build --rich", output: "✔ Wealth compiled successfully." },
  { prompt: "player@fumoney:~$ ", command: "tail -f income.log", output: "+500 +500 +500 (combo x5)" },
  { prompt: "player@fumoney:~$ ", command: "sudo make money", output: "Password: ****\n[OK] Permission granted." },
  { prompt: "player@fumoney:~$ ", command: "cargo run --release", output: "Compiling fuck_you_money v0.1.0\nFinished. [+1.5M/s]" },
  { prompt: "player@fumoney:~$ ", command: "node index.js", output: "Server running on port 999999999" },
  { prompt: "player@fumoney:~$ ", command: "df -h /bank", output: "Filesystem  Size  Used  Avail\n/bank        100B   42B    58B" },
  { prompt: "player@fumoney:~$ ", command: "whoami", output: "player" },
  { prompt: "player@fumoney:~$ ", command: "hostname", output: "fumoney" },
];
