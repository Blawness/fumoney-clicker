export interface Goal {
  id: string;
  label: string;
  cost: number;
}

export const GOALS: Goal[] = [
  { id: "dream-car", label: "Dream Car", cost: 1e9 },
  { id: "south-jakarta-house", label: "South Jakarta House", cost: 5e9 },
  { id: "wedding-fund", label: "The Wedding Fund", cost: 10e9 },
  { id: "fuck-you-money", label: "Fuck You Money Status", cost: 100e9 },
];
