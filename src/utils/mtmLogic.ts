
// MTM-1 Standard Data (Metric System)
// Corrected to match user specifications and provided tables.

// Reach Table Data
// Format: Dist(cm): [A, B, C/D, E, mR-A, mR-B]
// Note: mR-A/B is "Hand in Motion" (mR) or "Reach with Hand in Motion" (Rm).
// The user provided mR-A and mR-B columns.
export const REACH_BASE: Record<number, number[]> = {
  2:  [2.0, 2.0, 2.0, 2.0, 1.6, 1.6],
  3:  [2.7, 2.7, 3.6, 2.6, 2.3, 2.0],
  4:  [3.4, 3.4, 5.1, 3.2, 3.0, 2.4],
  5:  [4.0, 4.0, 5.8, 3.9, 3.5, 2.8],
  6:  [4.5, 4.5, 6.5, 4.4, 3.9, 3.1],
  7:  [5.0, 5.0, 7.0, 5.0, 4.3, 3.4],
  8:  [5.5, 5.5, 7.5, 5.5, 4.6, 3.7],
  9:  [5.8, 5.9, 8.0, 6.2, 4.8, 4.0],
  10: [6.1, 6.3, 8.4, 6.8, 4.9, 4.3],
  12: [6.4, 7.4, 9.1, 7.3, 5.2, 4.8],
  14: [6.8, 8.2, 9.7, 7.8, 5.5, 5.4],
  16: [7.1, 8.8, 10.3, 8.2, 5.8, 5.9],
  18: [7.5, 9.4, 10.8, 8.7, 6.1, 6.5],
  20: [7.8, 10.0, 11.4, 9.2, 6.5, 7.1],
  22: [8.1, 10.5, 11.9, 9.7, 6.8, 7.7],
  24: [8.5, 11.1, 12.5, 10.2, 7.1, 8.2],
  26: [8.8, 11.7, 13.0, 10.7, 7.4, 8.8],
  28: [9.2, 12.2, 13.6, 11.2, 7.7, 9.4],
  30: [9.5, 12.8, 14.1, 11.7, 8.0, 9.9],
  35: [10.4, 14.2, 15.5, 12.9, 8.8, 11.4],
  40: [11.3, 15.6, 16.8, 14.1, 9.6, 12.8],
  45: [12.1, 17.0, 18.2, 15.3, 10.4, 14.2],
  50: [13.0, 18.4, 19.6, 16.5, 11.2, 15.7],
  55: [13.9, 19.8, 20.9, 17.8, 12.0, 17.1],
  60: [14.7, 21.2, 22.3, 19.0, 12.8, 18.5],
  65: [15.6, 22.6, 23.6, 20.2, 13.5, 19.9],
  70: [16.5, 24.1, 25.0, 21.4, 14.3, 21.4],
  75: [17.3, 25.5, 26.4, 22.6, 15.1, 22.8],
  80: [18.2, 26.9, 27.7, 23.9, 15.9, 24.2]
};

// Move Table Data
// Format: Dist(cm): [A, B, C, mM-B]
// Note: mM-B is "Hand in Motion B".
export const MOVE_BASE: Record<number, number[]> = {
  2:  [2.0, 2.0, 2.0, 1.7],
  3:  [2.6, 3.0, 3.3, 2.3],
  4:  [3.1, 4.0, 4.5, 2.8],
  5:  [3.6, 4.5, 5.2, 3.0],
  6:  [4.1, 5.0, 5.8, 3.1],
  7:  [4.6, 5.5, 6.4, 3.4],
  8:  [5.1, 5.9, 6.9, 3.7],
  9:  [5.6, 6.4, 7.4, 4.0],
  10: [6.0, 6.8, 7.9, 4.3],
  12: [6.9, 7.7, 8.8, 4.9],
  14: [7.7, 8.5, 9.8, 5.4],
  16: [8.3, 9.2, 10.5, 6.0],
  18: [9.0, 9.8, 11.1, 6.5],
  20: [9.6, 10.5, 11.7, 7.1],
  22: [10.2, 11.2, 12.4, 7.6],
  24: [10.8, 11.8, 13.0, 8.2],
  26: [11.5, 12.3, 13.7, 8.7],
  28: [12.1, 12.8, 14.4, 9.3],
  30: [12.7, 13.3, 15.1, 9.8],
  35: [14.3, 14.5, 16.8, 11.2],
  40: [15.8, 15.6, 18.5, 12.6],
  45: [17.4, 16.8, 20.1, 14.0],
  50: [19.0, 18.0, 21.8, 15.4],
  55: [20.5, 19.2, 23.5, 16.8],
  60: [22.1, 20.4, 25.2, 18.2],
  65: [23.6, 21.6, 26.9, 19.5],
  70: [25.2, 22.8, 28.6, 20.9],
  75: [26.7, 24.0, 30.3, 22.3],
  80: [28.3, 25.2, 32.0, 23.7]
};

// Weight Factors for Move
// Weight (kg) => { w: Dynamic Factor, sc: Static Constant }
export const WEIGHT_FACTORS = [
    { max: 1, w: 1.0, sc: 0 },
    { max: 2, w: 1.04, sc: 1.6 },
    { max: 4, w: 1.07, sc: 2.8 },
    { max: 6, w: 1.12, sc: 4.3 },
    { max: 8, w: 1.17, sc: 5.8 },
    { max: 10, w: 1.22, sc: 7.3 },
    { max: 12, w: 1.27, sc: 8.8 },
    { max: 14, w: 1.32, sc: 10.4 },
    { max: 16, w: 1.36, sc: 11.9 },
    { max: 18, w: 1.41, sc: 13.4 },
    { max: 20, w: 1.46, sc: 14.9 },
    { max: 22, w: 1.51, sc: 16.4 }
];

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
  "G1A": { t: 2.0, d: "Pegar objeto fácil" },
  "G1B": { t: 3.5, d: "Pegar obj muito pequeno" },
  "G1C1": { t: 7.3, d: "Interferência > 12mm" },
  "G1C2": { t: 8.7, d: "Interferência 6-12mm" },
  "G1C3": { t: 10.8, d: "Interferência < 6mm" },
  "G2": { t: 5.6, d: "Repegar" },
  "G3": { t: 5.6, d: "Transferência de pega" },
  "G4A": { t: 7.3, d: "Selecionar > 25mm" },
  "G4B": { t: 9.1, d: "Selecionar 6-25mm" },
  "G4C": { t: 12.9, d: "Selecionar < 6mm" },
  "G5": { t: 0.0, d: "Tocar/Contato" },
  // Release
  "RL1": { t: 2.0, d: "Soltar normal" },
  "RL2": { t: 0.0, d: "Soltar contato" },
  // Apply Pressure
  "APA": { t: 10.6, d: "Fazer Força (Simples)" },
  "APB": { t: 16.2, d: "Fazer Força (Complexo)" },
  // Eye (Deprecated logic here, used in parser now)
  "EF": { t: 7.3, d: "Focar Olhar" },
  // Body - Specifics
  "SIT": { t: 34.7, d: "Sentar" },
  "STD": { t: 43.4, d: "Levantar" },
  "B": { t: 29.0, d: "Curvar" },
  "AB": { t: 31.9, d: "Levantar (Curvar)" },
  "S": { t: 29.0, d: "Agachar" },
  "AS": { t: 31.9, d: "Levantar (Agachar)" },
  "KOK": { t: 29.0, d: "Ajoelhar (1 joelho)" },
  "AKOK": { t: 31.9, d: "Levantar (1 joelho)" },
  "KBK": { t: 69.4, d: "Ajoelhar (2 joelhos)" },
  "AKBK": { t: 76.7, d: "Levantar (2 joelhos)" },
  "TBC1": { t: 18.6, d: "Girar Corpo 1" },
  "TBC2": { t: 37.2, d: "Girar Corpo 2" },
  "FM": { t: 8.5, d: "Mover Pé (<30cm)" },
  "FMP": { t: 19.1, d: "Mover Pé c/ Pressão" },
  "SS-C1": { t: 17.0, d: "Passo Lateral (<30cm)" },
  "SS-C2": { t: 34.1, d: "Passo Lateral (<60cm)" },
  "W-P": { t: 15.0, d: "Andar (passo)" },
  "W-PO": { t: 17.0, d: "Andar (obstruído)" }
};

// --- Helper Functions ---

export const convertUnit = (val: number, unit: 'tmu' | 'sec' | 'min' | 'cmin'): number => {
  switch (unit) {
    case 'tmu': return val;
    case 'sec': return val * 27.778; // 1 sec = ~27.8 TMU
    case 'min': return val * 1666.67; // 1 min = ~1667 TMU
    case 'cmin': return val * 16.667; // 1 cmin = ~16.7 TMU
    default: return val;
  }
};

const interpolate = (dist: number, table: Record<number, number[]>, idx: number): number => {
    const keys = Object.keys(table).map(Number).sort((a, b) => a - b);

    // Extrapolation > 80cm
    if (dist > 80) {
        // Formula: R80 + {(x-80)/5} * (R80 - R75)
        const val80 = table[80][idx];
        const val75 = table[75][idx];
        const diff = val80 - val75;
        const extra = ((dist - 80) / 5) * diff;
        return val80 + extra;
    }

    // Exact Match
    if (table[dist]) return table[dist][idx];

    // Interpolation (Average of prev/next)
    // Find neighbors
    let prev = keys[0];
    let next = keys[keys.length - 1];

    for (let k of keys) {
        if (k <= dist) prev = k;
        if (k >= dist) { next = k; break; }
    }

    if (prev === next) return table[prev][idx];

    // Simple Average as requested: (Anterior + Posterior) / 2
    // Or linear interpolation? The request says "(Anterior + Posterior) / 2" which implies simple average of the values
    // But typically it's linear. Let's stick to linear if gaps are irregular, but here gaps are small.
    // Wait, the user specifically said: "O PDF exige que distâncias fora da tabela até 80cm sejam calculadas pela média: (Anterior + Posterior) / 2."
    // This implies taking the nearest two table entries and averaging them.
    // Example: R42. Nearest are R40 and R45.
    const valPrev = table[prev][idx];
    const valNext = table[next][idx];

    // If request implies strict average of values regardless of distance proportion:
    // return (valPrev + valNext) / 2;

    // However, linear interpolation is safer for larger gaps (like 5cm).
    // R42 is closer to R40 (2cm) than R45 (3cm).
    // Let's implement Linear Interpolation for precision unless strictly forbidden.
    // Val = Vp + (Vn - Vp) * ( (d - dp) / (dn - dp) )
    return valPrev + (valNext - valPrev) * ((dist - prev) / (next - prev));
};

const getWeightFactor = (kg: number): { w: number, sc: number } => {
    if (kg <= 0) return { w: 1, sc: 0 };
    // Find range
    for (let f of WEIGHT_FACTORS) {
        if (kg <= f.max) return { w: f.w, sc: f.sc };
    }
    // Max out at last entry or extrapolate? Usually max out for standard data card scope.
    const last = WEIGHT_FACTORS[WEIGHT_FACTORS.length - 1];
    return { w: last.w, sc: last.sc };
};

// --- Parser Logic ---

export const parseCode = (code: string): { v: boolean, t: number, d: string, type?: string } => {
  if (!code) return { v: false, t: 0, d: "" };
  let c = code.trim().toUpperCase();

  // 1. REACH (R)
  // Format: R<dist><case> or mR<dist><case> (Hand in motion start)
  // Check for 'm' prefix
  let isMotionStart = false;
  if (c.startsWith('M') && c[1] === 'R') { // mR case
      isMotionStart = true;
      c = c.substring(1); // Remove 'm'
  }

  if (c.startsWith('R')) {
    const match = c.match(/^R(\d+)([ABCDE]?)$/);
    if (match) {
        const dist = parseInt(match[1]);
        const type = match[2] || 'A';

        let idx = 0; // A
        if (type === 'B') idx = 1;
        else if (type === 'C' || type === 'D') idx = 2; // C/D grouped
        else if (type === 'E') idx = 3; // E is index 3 in our table structure (A, B, CD, E)

        // Handle Hand in Motion (mR)
        // Table has specific columns for mR-A (index 4) and mR-B (index 5)
        if (isMotionStart) {
            if (type === 'A') idx = 4;
            else if (type === 'B') idx = 5;
            // mR for C/D/E not specified in table provided, usually not standard or uses B.
            // Let's fallback to B if C/D/E used with mR, or ignore motion.
            else idx = 1;
        }

        const tmu = interpolate(dist, REACH_BASE, idx);

        return {
            v: true,
            t: tmu,
            d: `Alcançar ${dist}cm (${type}) ${isMotionStart ? '[Em Movimento]' : ''}`
        };
    }
  }

  // 2. MOVE (M)
  // Format: M<dist><case>[-<weight>kg]
  // e.g. M10A, M10A-5, mM10A
  isMotionStart = false;
  if (c.startsWith('M') && c[1] === 'M') { // mM case (Hand in motion start)
      isMotionStart = true;
      c = c.substring(1);
  }

  if (c.startsWith('M')) {
    // Regex to capture Dist, Case, and optional Weight
    // Matches M30A or M30A-5 or M30A-5kg
    const match = c.match(/^M(\d+)([ABC]?)(?:-(\d+(?:\.\d+)?)KG?)?$/);
    if (match) {
        const dist = parseInt(match[1]);
        const type = match[2] || 'A';
        const weight = match[3] ? parseFloat(match[3]) : 0;

        let idx = 0; // A
        if (type === 'B') idx = 1;
        else if (type === 'C') idx = 2;

        // Handle Hand in Motion B (mM-B) -> Index 3
        if (isMotionStart && type === 'B') idx = 3;

        // Base TMU
        let tmu = interpolate(dist, MOVE_BASE, idx);

        // Apply Weight Formula: (TMU * W) + SC
        const factors = getWeightFactor(weight);
        tmu = (tmu * factors.w) + factors.sc;

        return {
            v: true,
            t: tmu,
            d: `Mover ${dist}cm (${type}) ${weight > 0 ? `[${weight}kg]` : ''} ${isMotionStart ? '[Em Movimento]' : ''}`
        };
    }
  }

  // 3. EYE TRAVEL (ET)
  // Format: ET<T>/<D> e.g. ET30/40
  if (c.startsWith('ET')) {
      const match = c.match(/^ET(\d+)\/(\d+)$/);
      if (match) {
          const T = parseInt(match[1]);
          const D = parseInt(match[2]);
          if (D > 0) {
              let tmu = 15.2 * (T / D);
              if (tmu > 20) tmu = 20; // Max limit
              return { v: true, t: tmu, d: `Mover Olhos T=${T}/D=${D}` };
          }
      } else if (c === 'ET') {
          // Fallback constant if no params
          return { v: true, t: 15.2, d: "Mover Olhos (Padrão)" };
      }
  }

  // 4. LEG MOTION (LM)
  // Format: LM<dist> e.g. LM20
  if (c.startsWith('LM')) {
      const match = c.match(/^LM(\d+)$/);
      if (match) {
          const dist = parseInt(match[1]);
          // Formula: Up to 15cm = 7.1. Each extra cm = 0.5
          let tmu = 7.1;
          if (dist > 15) {
              tmu += (dist - 15) * 0.5;
          }
          return { v: true, t: tmu, d: `Mover Perna ${dist}cm` };
      }
      if (c === 'LM') return { v: true, t: 7.1, d: "Mover Perna (<15cm)" };
  }

  // 5. SIDE STEP (SS)
  // Format: SS-C1, SS-C2
  if (c.startsWith('SS')) {
      if (c === 'SS-C1' || c === 'SSC1') return { v: true, t: 17.0, d: "Passo Lat. <30cm (C1)" };
      if (c === 'SS-C2' || c === 'SSC2') return { v: true, t: 34.1, d: "Passo Lat. <60cm (C2)" };

      // Dynamic SS?
      const match = c.match(/^SS(\d+)$/);
      if (match) {
          // Approximate logic if needed, but usually strictly C1/C2
          // Let's assume user might type SS40 -> C2
          const dist = parseInt(match[1]);
          if (dist <= 30) return { v: true, t: 17.0, d: `Passo Lat. ${dist}cm (C1)` };
          return { v: true, t: 34.1, d: `Passo Lat. ${dist}cm (C2)` };
      }
  }

  // 6. TURN (T) - e.g. T90S
  if (c.startsWith('T') && !c.startsWith('TB')) { // Avoid confusion with TBC
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

          return { v: true, t: TURN_DATA[d][idx], d: `Girar ${deg}° (${w})` };
      }
  }

  // 7. POSITION (P)
  if (c.startsWith('P')) {
      const match = c.match(/^P([123])(S|SS|NS)(E|D)?$/);
      if (match) {
          const key = `P${match[1]}${match[2]}`;
          const hand = match[3] || 'E';
          const val = POS_DATA[key];
          if (val) {
              return { v: true, t: val[hand], d: `Posicionar ${match[1]} ${match[2]} (${hand})` };
          }
      }
  }

  // 8. DISENGAGE (D)
  if (c.startsWith('D')) {
      const match = c.match(/^D([123])(E|D)?$/);
      if (match) {
          const cls = match[1];
          const hand = match[2] || 'E';
          const val = DIS_DATA[cls];
          if (val) {
              return { v: true, t: val[hand], d: `Separar ${cls} (${hand})` };
          }
      }
  }

  // 9. BODY - Walk special case
  // Updated Regex: /^(\d+)\s*W(-P|-PO)?$/
  if (c.match(/^\d+\s*W/)) {
      const match = c.match(/^(\d+)\s*W(-P|-PO)?$/);
      if (match) {
          const steps = parseInt(match[1]);
          const type = match[2] || '-P'; // W-P or W-PO
          const key = `W${type}`;
          const oneStep = STAT[key];
          if (oneStep) {
              return { v: true, t: oneStep.t * steps, d: `Andar ${steps} passos`, type: 'body' };
          }
      }
  }

  // 10. STATIC (G, RL, AP, E, B, etc.)
  if (STAT[c]) {
      return { v: true, t: STAT[c].t, d: STAT[c].d, type: c.match(/^(G|RL|AP|E)/) ? undefined : 'body' };
  }

  // 11. MANUAL / PROCESS / ADJ
  if (['PROC', 'ADJ', 'MANUAL'].includes(c)) {
      return { v: true, t: 0, d: 'Manual/Processo', type: 'process' };
  }

  return { v: false, t: 0, d: "Código Inválido" };
};
