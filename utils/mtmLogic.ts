export const REACH_BASE: any = {
  2: [2.0, 2.0, 2.0, 2.0, 1.6],
  6: [4.3, 5.8, 7.3, 5.0, 3.7],
  10: [6.1, 7.3, 8.7, 6.7, 4.8],
  20: [7.8, 9.4, 10.8, 8.6, 6.5],
  30: [9.5, 11.4, 12.9, 10.1, 8.1],
  40: [11.0, 13.2, 14.9, 11.5, 9.6],
  50: [13.0, 15.5, 17.5, 13.5, 11.3],
  80: [16.8, 20.1, 22.5, 17.7, 14.5]
};

export const MOVE_BASE: any = {
  2: [2.0, 2.0, 2.0],
  6: [4.2, 5.7, 7.3],
  10: [6.8, 8.1, 9.7],
  20: [9.7, 11.3, 12.8],
  30: [11.8, 13.4, 15.2],
  40: [13.4, 15.2, 17.3],
  50: [15.2, 17.3, 19.1],
  80: [20.0, 22.1, 23.8]
};

export const TURN_DATA: any = {
  30: [2.8, 4.4, 8.4],
  45: [3.5, 5.5, 10.5],
  60: [4.1, 6.5, 12.3],
  90: [5.4, 8.5, 16.2],
  120: [6.8, 10.6, 20.2],
  150: [8.1, 12.7, 24.3],
  180: [9.4, 14.8, 28.2]
};

export const POS_DATA: any = {
  'P1S': {E: 5.6, D: 11.2},
  'P1SS': {E: 9.1, D: 14.7},
  'P1NS': {E: 10.4, D: 16.0},
  'P2S': {E: 16.2, D: 21.8},
  'P2SS': {E: 19.7, D: 25.3},
  'P2NS': {E: 21.0, D: 26.6},
  'P3S': {E: 43.0, D: 48.6},
  'P3SS': {E: 46.5, D: 52.1},
  'P3NS': {E: 47.8, D: 53.4}
};

export const DIS_DATA: any = {
  '1': {E: 4.0, D: 5.7},
  '2': {E: 7.5, D: 11.8},
  '3': {E: 22.9, D: 34.7}
};

export const STAT: any = {
  // Grasp
  'G1A': {t: 2.0, d: 'Pegar objeto isolado fácil'},
  'G1B': {t: 3.5, d: 'Pegar objeto muito pequeno'},
  'G1C1': {t: 7.3, d: 'Pegar (interferência) diam>12mm'},
  'G1C2': {t: 8.7, d: 'Pegar (interferência) diam 6-12mm'},
  'G1C3': {t: 10.8, d: 'Pegar (interferência) diam <6mm'},
  'G2': {t: 5.6, d: 'Re-pegar'},
  'G3': {t: 5.6, d: 'Transferência de pega'},
  'G4A': {t: 7.3, d: 'Pegar em pilha >25x25x25mm'},
  'G4B': {t: 9.1, d: 'Pegar em pilha 6x6x3mm a 25x25x25mm'},
  'G4C': {t: 12.9, d: 'Pegar em pilha <6x6x3mm'},
  'G5': {t: 0, d: 'Tocar/Contato'},

  // Release
  'RL1': {t: 2.0, d: 'Soltar normal (abrir dedos)'},
  'RL2': {t: 0, d: 'Soltar contato'},

  // Eye
  'ET': {t: 15.2, d: 'Mover Olhos (30°/40cm)'},
  'EF': {t: 7.3, d: 'Focar Olhos'},

  // Pressure
  'APA': {t: 10.6, d: 'Premir (Simples)'},
  'APB': {t: 16.2, d: 'Premir (Com Re-pegar)'},

  // Body
  'FM': {t: 8.5, d: 'Movimento do Pé (<30cm)'},
  'FMP': {t: 19.1, d: 'Movimento do Pé (C/ pressão)'},
  'LM': {t: 7.1, d: 'Movimento da Perna (<15cm)'},
  'W-P': {t: 15.0, d: 'Andar por Passo'},
  'W-PO': {t: 17.0, d: 'Andar (Obstruído) por Passo'},
  'SIT': {t: 34.7, d: 'Sentar'},
  'STD': {t: 43.4, d: 'Levantar (de Sentado)'},
  'B': {t: 29.0, d: 'Curvar Corpo'},
  'AB': {t: 31.9, d: 'Levantar de Curvado'},
  'S': {t: 29.0, d: 'Agachar'},
  'AS': {t: 31.9, d: 'Levantar de Agachado'},
  'KOK': {t: 29.0, d: 'Ajoelhar (um joelho)'},
  'AKOK': {t: 31.9, d: 'Levantar (de um joelho)'},
  'KBK': {t: 69.4, d: 'Ajoelhar (dois joelhos)'},
  'AKBK': {t: 76.7, d: 'Levantar (de dois joelhos)'},
  'TBC1': {t: 18.6, d: 'Girar Corpo (Case 1)'},
  'TBC2': {t: 37.2, d: 'Girar Corpo (Case 2)'}
};

export function parseCode(code: string): { v: boolean; t: number; d: string; type?: string } {
    if (!code) return { v: false, t: 0, d: '' };
    const c = code.toUpperCase().trim();

    // BODY
    if (STAT[c]) {
        return { v: true, t: STAT[c].t, d: STAT[c].d, type: 'body' };
    }
    // Walk (WxP)
    const walkMatch = c.match(/^(\d+)(W-P|W-PO)$/);
    if (walkMatch) {
        const steps = parseInt(walkMatch[1]);
        const type = walkMatch[2];
        return { v: true, t: steps * STAT[type].t, d: `Andar ${steps} passos (${type === 'W-P' ? 'Livre' : 'Obs'})`, type: 'body' };
    }

    // REACH (R)
    // Ex: R30A, R10B
    const rMatch = c.match(/^R(\d+)([ABCDE])$/);
    if (rMatch) {
        const dist = parseInt(rMatch[1]);
        const type = rMatch[2]; // A, B, C, D, E
        // Find closest dist
        const dists = Object.keys(REACH_BASE).map(Number).sort((a,b)=>a-b);
        let d = dists.find(x => x >= dist) || 80;
        if (dist > 80) d = 80; // Clamp max

        const idxMap: any = { A: 0, B: 1, C: 2, D: 2, E: 4 }; // C & D are same column in basic MTM-1 table logic usually, but let's check standard.
        // Standard: Col A, B, C/D, E.
        // Wait, C and D are usually distinct in some charts but often grouped.
        // My REACH_BASE has 5 cols. Let's assume A=0, B=1, C=2, D=3, E=4.
        // If my table in App.tsx had A, B, C/D, E -> that's 4 cols.
        // Let's check REACH_BASE definition above.
        // 2: [2.0, 2.0, 2.0, 2.0, 1.6] -> 5 values.
        // So A=0, B=1, C=2, D=3, E=4.

        const val = REACH_BASE[d][idxMap[type] ?? 0];
        // Add extra if dist is interpolated? For now simple lookup.
        // Actually, MTM is often interpolated.
        // For "Pro" version, let's keep it simple lookup or nearest.

        const descMap: any = {
            A: "Alcançar objeto fixo",
            B: "Alcançar objeto variável",
            C: "Alcançar misturado",
            D: "Alcançar muito pequeno",
            E: "Alcançar p/ equilíbrio"
        };

        return { v: true, t: val, d: `${descMap[type]} (${dist}cm)` };
    }

    // MOVE (M)
    // Ex: M30A, M10C
    // Check weight: M10C5 (Move 10 C 5kg) - Not implemented in regex yet.
    // Let's stick to basic M[dist][Case].
    const mMatch = c.match(/^M(\d+)([ABC])$/);
    if (mMatch) {
        const dist = parseInt(mMatch[1]);
        const type = mMatch[2];
        const dists = Object.keys(MOVE_BASE).map(Number).sort((a,b)=>a-b);
        let d = dists.find(x => x >= dist) || 80;

        const idxMap: any = { A: 0, B: 1, C: 2 };
        const val = MOVE_BASE[d][idxMap[type]];

        const descMap: any = {
            A: "Mover para outra mão/encosto",
            B: "Mover para local aproximado",
            C: "Mover para local exato"
        };

        return { v: true, t: val, d: `${descMap[type]} (${dist}cm)` };
    }

    // TURN (T)
    // Ex: T90S
    const tMatch = c.match(/^T(\d+)([SML])$/);
    if (tMatch) {
        const deg = parseInt(tMatch[1]);
        const res = tMatch[2];
        const degs = Object.keys(TURN_DATA).map(Number).sort((a,b)=>a-b);
        let d = degs.find(x => x >= deg) || 180;

        const idxMap: any = { S: 0, M: 1, L: 2 };
        const val = TURN_DATA[d][idxMap[res]];

        const descMap: any = { S: "Pequena", M: "Média", L: "Grande" };
        return { v: true, t: val, d: `Girar ${deg}° (Resist. ${descMap[res]})` };
    }

    // POSITION (P)
    // Ex: P1SS, P2NSE (Wait, Easy/Diff is usually handled too).
    // Let's assume P[123][S/SS/NS][E/D]
    const pMatch = c.match(/^P([123])(S|SS|NS)([ED])$/);
    if (pMatch) {
        const cls = pMatch[1];
        const sym = pMatch[2];
        const h = pMatch[3];
        const key = `P${cls}${sym}`;
        const val = POS_DATA[key] ? POS_DATA[key][h] : 0;

        const symMap: any = { S: "Simétrico", SS: "Semi-Sim.", NS: "Não-Sim." };
        const hMap: any = { E: "Fácil", D: "Difícil" };

        return { v: true, t: val, d: `Posicionar P${cls} ${symMap[sym]} (${hMap[h]})` };
    }

    // DISENGAGE (D)
    // Ex: D1E
    const dMatch = c.match(/^D([123])([ED])$/);
    if (dMatch) {
        const cls = dMatch[1];
        const h = dMatch[2];
        const val = DIS_DATA[cls] ? DIS_DATA[cls][h] : 0;
        return { v: true, t: val, d: `Separar D${cls} (${h === 'E' ? 'Fácil' : 'Difícil'})` };
    }

    return { v: false, t: 0, d: "Código Inválido" };
}
