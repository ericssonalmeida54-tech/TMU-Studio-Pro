import { parseCode } from '../utils/mtmLogic';

const tests = [
  { c: 'R30A', e: 9.5, d: 'Alcançar objeto fixo (30cm)' },
  { c: 'M10C', e: 9.7, d: 'Mover para local exato (10cm)' },
  { c: 'G1A', e: 2.0, d: 'Pegar objeto isolado fácil' },
  { c: 'P1SE', e: 5.6, d: 'Posicionar P1 Simétrico (Fácil)' },
  { c: '5W-P', e: 75.0, d: 'Andar 5 passos (Livre)' },
  { c: 'INVALID', v: false }
];

let failed = 0;
tests.forEach(t => {
  const res = parseCode(t.c);
  if (t.v === false) {
     if (res.v) { console.error(`FAIL ${t.c}: Expected invalid, got valid`); failed++; }
  } else {
     if (!res.v) { console.error(`FAIL ${t.c}: Expected valid, got invalid`); failed++; }
     else if (Math.abs(res.t - t.e) > 0.1) { console.error(`FAIL ${t.c}: TMU ${res.t} != ${t.e}`); failed++; }
     else if (!res.d.includes(t.d.split('(')[0].trim())) { console.error(`FAIL ${t.c}: Desc mismatch '${res.d}' vs '${t.d}'`); failed++; }
     else { console.log(`PASS ${t.c}`); }
  }
});

if (failed > 0) process.exit(1);
console.log("All MTM tests passed");
