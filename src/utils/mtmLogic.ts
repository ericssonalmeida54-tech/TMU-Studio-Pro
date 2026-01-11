
// MTM-1 Standard Data

export const REACH_BASE: Record<number, number[]> = {
  2:  [2.0, 2.0, 2.0, 2.0, 1.6],
  4:  [3.4, 3.4, 5.1, 5.1, 3.0],
  6:  [4.3, 4.3, 5.9, 5.9, 3.8],
  8:  [5.1, 5.1, 6.7, 6.7, 4.5],
  10: [6.1, 6.3, 7.3, 7.3, 5.3],
  12: [6.4, 7.4, 8.1, 8.1, 6.1],
  14: [6.9, 8.2, 8.9, 8.9, 6.7],
  16: [7.3, 9.1, 9.7, 9.7, 7.3],
  18: [7.7, 10.0, 10.5, 10.5, 7.9],
  20: [8.1, 10.8, 11.3, 11.3, 8.5],
  22: [8.5, 11.7, 12.1, 12.1, 9.1],
  24: [8.9, 12.5, 12.9, 12.9, 9.7],
  26: [9.3, 13.3, 13.7, 13.7, 10.3],
  28: [9.7, 14.2, 14.5, 14.5, 10.9],
  30: [10.1, 15.0, 15.3, 15.3, 11.5],
  35: [11.1, 16.6, 17.3, 17.3, 13.0],
  40: [12.1, 18.2, 19.1, 19.1, 14.4],
  45: [13.1, 19.8, 20.9, 20.9, 15.8],
  50: [14.1, 21.4, 22.7, 22.7, 17.2],
  55: [15.1, 23.0, 24.5, 24.5, 18.6],
  60: [16.1, 24.6, 26.3, 26.3, 20.0],
  65: [17.1, 26.2, 28.1, 28.1, 21.4],
  70: [18.1, 27.8, 29.9, 29.9, 22.8],
  75: [19.1, 29.4, 31.7, 31.7, 24.2],
  80: [20.1, 31.0, 33.5, 33.5, 25.6]
};

export const MOVE_BASE: Record<number, number[]> = {
  2:  [2.0, 2.0, 2.0],
  4:  [3.1, 3.8, 4.3],
  6:  [4.1, 5.3, 5.5],
  8:  [5.1, 6.5, 6.7],
  10: [6.0, 7.6, 7.9],
  12: [6.9, 8.7, 9.0],
  14: [7.7, 9.7, 10.1],
  16: [8.4, 10.7, 11.1],
  18: [9.2, 11.6, 12.1],
  20: [10.0, 12.5, 13.1],
  22: [10.8, 13.4, 14.1],
  24: [11.6, 14.3, 15.1],
  26: [12.4, 15.2, 16.1],
  28: [13.2, 16.1, 17.1],
  30: [14.0, 17.0, 18.1],
  35: [15.7, 19.2, 20.4],
  40: [17.3, 21.2, 22.7],
  45: [18.9, 23.2, 25.0],
  50: [20.6, 25.3, 27.3],
  55: [22.3, 27.4, 29.6],
  60: [24.0, 29.5, 31.9],
  65: [25.7, 31.6, 34.2],
  70: [27.4, 33.7, 36.5],
  75: [29.1, 35.8, 38.8],
  80: [30.8, 37.9, 41.1]
};

export const TURN_DATA: Record<number, number[]> = {
  30:  [2.8, 4.4, 8.4],
  45:  [3.5, 5.5, 10.5],
  60:  [4.1, 6.5, 12.3],
  75:  [4.8, 7.5, 14.4],
  90:  [5.4, 8.5, 16.2],
  105: [6.1, 9.6, 18.3],
  120: [6.8, 10.6, 20.4],
  135: [7.4, 11.6, 22.2],
  150: [8.1, 12.7, 24.3],
  180: [9.4, 14.7, 28.2]
};

export const POS_DATA: any = {
    P1S: { E: 5.6, D: 11.2 },
    P1SS: { E: 9.1, D: 14.7 },
    P1NS: { E: 10.4, D: 16.0 },
    P2S: { E: 16.2, D: 21.8 },
    P2SS: { E: 19.7, D: 25.3 },
    P2NS: { E: 21.0, D: 26.6 },
    P3S: { E: 43.0, D: 48.6 },
    P3SS: { E: 46.5, D: 52.1 },
    P3NS: { E: 47.8, D: 53.4 }
};

export const DIS_DATA: any = {
    '1': { E: 4.0, D: 5.7 },
    '2': { E: 7.5, D: 11.8 },
    '3': { E: 22.9, D: 34.7 }
};

export const STAT: Record<string, { t: number, d: string }> = {
  // Grasp
  "G1A": { t: 2.0, d: "Pick up easy object" },
  "G1B": { t: 3.5, d: "Pick up very small object" },
  "G1C1": { t: 7.3, d: "Interference > 12mm" },
  "G1C2": { t: 8.7, d: "Interference 6-12mm" },
  "G1C3": { t: 10.8, d: "Interference < 6mm" },
  "G2": { t: 5.6, d: "Regrasp" },
  "G3": { t: 5.6, d: "Transfer grasp" },
  "G4A": { t: 7.3, d: "Select > 25mm" },
  "G4B": { t: 9.1, d: "Select 6-25mm" },
  "G4C": { t: 12.9, d: "Select < 6mm" },
  "G5": { t: 0.0, d: "Contact grasp" },
  // Release
  "RL1": { t: 2.0, d: "Normal release" },
  "RL2": { t: 0.0, d: "Contact release" },
  // Apply Pressure
  "APA": { t: 10.6, d: "Apply Pressure (Simple)" },
  "APB": { t: 16.2, d: "Apply Pressure (Complex)" },
  // Eye
  "ET": { t: 15.2, d: "Eye Travel" },
  "EF": { t: 7.3, d: "Eye Focus" },
  // Body
  "W-P": { t: 15.0, d: "Walk per pace" },
  "W-PO": { t: 17.0, d: "Walk obstructed" },
  "SIT": { t: 34.7, d: "Sit" },
  "STD": { t: 43.4, d: "Stand" },
  "B": { t: 29.0, d: "Bend" },
  "S": { t: 29.0, d: "Stoop" },
  "KOK": { t: 29.0, d: "Kneel on One Knee" },
  "AB": { t: 31.9, d: "Arise from Bend" },
  "AS": { t: 31.9, d: "Arise from Stoop" },
  "AKOK": { t: 31.9, d: "Arise from KOK" },
  "KBK": { t: 69.4, d: "Kneel Both Knees" },
  "AKBK": { t: 76.7, d: "Arise from KBK" },
  "TBC1": { t: 18.6, d: "Turn Body Case 1" },
  "TBC2": { t: 37.2, d: "Turn Body Case 2" },
  "FM": { t: 8.5, d: "Foot Motion" },
  "FMP": { t: 19.1, d: "Foot Motion w/ Pressure" }
};

// --- Parser Logic ---

export const parseCode = (code: string): { v: boolean, t: number, d: string, type?: string } => {
  if (!code) return { v: false, t: 0, d: "" };
  const c = code.trim().toUpperCase();

  // 1. REACH (R) - e.g. R30A, R10B
  if (c.startsWith('R')) {
    const match = c.match(/^R(\d+)([ABCDE]?)(m?)$/);
    if (match) {
        const dist = parseInt(match[1]);
        const type = match[2] || 'A';
        // Find nearest distance
        const dists = Object.keys(REACH_BASE).map(Number).sort((a, b) => a - b);
        const d = dists.reduce((prev, curr) => Math.abs(curr - dist) < Math.abs(prev - dist) ? curr : prev);

        let idx = 0; // A
        if (type === 'B') idx = 1;
        else if (type === 'C' || type === 'D') idx = 2;
        else if (type === 'E') idx = 4;

        return {
            v: true,
            t: REACH_BASE[d][idx],
            d: `Reach ${dist}cm (${type})`
        };
    }
  }

  // 2. MOVE (M) - e.g. M30A
  if (c.startsWith('M')) {
    const match = c.match(/^M(\d+)([ABC]?)(m?)$/);
    if (match) {
        const dist = parseInt(match[1]);
        const type = match[2] || 'A';
        const dists = Object.keys(MOVE_BASE).map(Number).sort((a, b) => a - b);
        const d = dists.reduce((prev, curr) => Math.abs(curr - dist) < Math.abs(prev - dist) ? curr : prev);

        let idx = 0; // A
        if (type === 'B') idx = 1;
        else if (type === 'C') idx = 2;

        return {
            v: true,
            t: MOVE_BASE[d][idx],
            d: `Move ${dist}cm (${type})`
        };
    }
  }

  // 3. TURN (T) - e.g. T90S
  if (c.startsWith('T')) {
      const match = c.match(/^T(\d+)([SML]?)$/);
      if (match) {
          const deg = parseInt(match[1]);
          const w = match[2] || 'S';
          // Nearest degree
          const degs = Object.keys(TURN_DATA).map(Number).sort((a, b) => a - b);
          const d = degs.reduce((prev, curr) => Math.abs(curr - deg) < Math.abs(prev - deg) ? curr : prev);

          let idx = 0;
          if (w === 'M') idx = 1;
          else if (w === 'L') idx = 2;

          return { v: true, t: TURN_DATA[d][idx], d: `Turn ${deg}° (${w})` };
      }
  }

  // 4. POSITION (P) - e.g. P1SE
  if (c.startsWith('P')) {
      // P 1/2/3 S/SS/NS E/D
      const match = c.match(/^P([123])(S|SS|NS)(E|D)?$/);
      if (match) {
          const key = `P${match[1]}${match[2]}`;
          const hand = match[3] || 'E';
          const val = POS_DATA[key];
          if (val) {
              return { v: true, t: val[hand], d: `Position ${match[1]} ${match[2]} (${hand})` };
          }
      }
  }

  // 5. DISENGAGE (D) - e.g. D1E
  if (c.startsWith('D')) {
      const match = c.match(/^D([123])(E|D)?$/);
      if (match) {
          const cls = match[1];
          const hand = match[2] || 'E';
          const val = DIS_DATA[cls];
          if (val) {
              return { v: true, t: val[hand], d: `Disengage ${cls} (${hand})` };
          }
      }
  }

  // 6. BODY - Walk special case
  if (c.match(/^\d+W/)) {
      const match = c.match(/^(\d+)W(-P|-PO)?$/);
      if (match) {
          const steps = parseInt(match[1]);
          const type = match[2] || '-P'; // W-P or W-PO
          const key = `W${type}`;
          const oneStep = STAT[key];
          if (oneStep) {
              return { v: true, t: oneStep.t * steps, d: `Walk ${steps} paces`, type: 'body' };
          }
      }
  }

  // 7. STATIC (G, RL, AP, E, B, etc.)
  if (STAT[c]) {
      return { v: true, t: STAT[c].t, d: STAT[c].d, type: c.match(/^(G|RL|AP|E)/) ? undefined : 'body' };
  }

  return { v: false, t: 0, d: "Invalid code" };
};
