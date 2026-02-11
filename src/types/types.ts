export type MotionType = 'mtm' | 'process';

export interface Motion {
  id?: string;
  type?: MotionType; // Defaults to 'mtm' if undefined
  code: string;
  tmu: number;
  desc: string;
  freq: number;
  hand: 'E' | 'D' | 'C';
  // Process/Machine Time Specifics
  unit?: 'tmu' | 'sec' | 'min' | 'cmin';
  val?: number; // The raw value entered (e.g. 30 seconds)
}

export interface MotionGroup {
  id: string;
  name: string;
  motions: Motion[];
  description?: string;
  updatedAt: number;
}

export interface ROI {
  costMin: number;
  volume: number;
  invest: number;
  daysPerMonth?: number;
  minutesPerHour?: number;
  targetIncreasePct?: number;
}

export interface Study {
  id: string;
  type?: 'comparison' | 'single'; // Distinguish study types
  title: string;
  analyst?: string;
  tolerance: number;
  currentMotions: Motion[];
  proposedMotions: Motion[];
  roi: ROI;
  updatedAt: number;
  // Single Study specifics
  observedTime?: number; // Tempo Cronometrado (min)
  shiftMinutes?: number; // Jornada (min)
}
