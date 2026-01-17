export interface Motion {
  code: string;
  tmu: number;
  desc: string;
  freq: number;
  hand: 'E' | 'D' | 'C';
}

export interface ROI {
  costMin: number;
  volume: number;
  invest: number;
  daysPerMonth?: number;
  minutesPerHour?: number; // Config: Effective minutes per hour (default 60)
  targetIncreasePct?: number; // Config: Target production increase %
}

export interface Study {
  id: string;
  title: string;
  analyst?: string; // New field for Analyst Name
  tolerance: number;
  currentMotions: Motion[];
  proposedMotions: Motion[];
  roi: ROI;
  updatedAt: number;
}
