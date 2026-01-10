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
}

export interface Study {
  id: string;
  title: string;
  tolerance: number;
  currentMotions: Motion[];
  proposedMotions: Motion[];
  roi: ROI;
  updatedAt: number;
}
