import { parseCode, REACH_BASE, MOVE_BASE } from '../src/utils/mtmLogic';

console.log("--- MTM Logic Verification ---");

// 1. Interpolation Test (R42A)
// R40A = 11.3, R45A = 12.1
// R42A = 11.3 + (12.1 - 11.3) * (2/5) = 11.3 + 0.8 * 0.4 = 11.3 + 0.32 = 11.62
const r42 = parseCode("R42A");
console.log(`R42A: Expected ~11.62, Got ${r42.t.toFixed(2)} (${r42.v})`);

// 2. Extrapolation Test (R90A)
// R80A = 18.2, R75A = 17.3
// Diff = 0.9
// Extra = ((90-80)/5) * 0.9 = 2 * 0.9 = 1.8
// Total = 18.2 + 1.8 = 20.0
const r90 = parseCode("R90A");
console.log(`R90A: Expected ~20.0, Got ${r90.t.toFixed(2)} (${r90.v})`);

// 3. Move with Weight (M10A-5kg)
// M10A = 6.0
// 5kg -> Max 6kg range -> W=1.12, SC=4.3
// TMU = (6.0 * 1.12) + 4.3 = 6.72 + 4.3 = 11.02
const m10w5 = parseCode("M10A-5kg");
console.log(`M10A-5kg: Expected ~11.02, Got ${m10w5.t.toFixed(2)} (${m10w5.v})`);

// 4. Hand in Motion (mR10A)
// Table mR-A for 10cm = 4.9
const mr10 = parseCode("mR10A");
console.log(`mR10A: Expected 4.9, Got ${mr10.t} (${mr10.v})`);

// 5. Eye Travel (ET30/40)
// T=30, D=40 -> 15.2 * (30/40) = 15.2 * 0.75 = 11.4
const et = parseCode("ET30/40");
console.log(`ET30/40: Expected 11.4, Got ${et.t} (${et.v})`);

// 6. Leg Motion (LM20)
// 7.1 + (20-15)*0.5 = 7.1 + 2.5 = 9.6
const lm = parseCode("LM20");
console.log(`LM20: Expected 9.6, Got ${lm.t} (${lm.v})`);
