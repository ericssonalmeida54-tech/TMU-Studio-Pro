import { parseCode } from '../src/utils/mtmLogic';

console.log("--- Bug Verification ---");

// 1. Walk Regex Test
const w1 = parseCode("10W");
console.log(`10W: ${w1.v} (${w1.d})`);

const w2 = parseCode("10 W");
console.log(`10 W: ${w2.v} (${w2.d})`);

const w3 = parseCode("5W-P");
console.log(`5W-P: ${w3.v} (${w3.d})`);

// 2. Process Code Test
const proc = parseCode("PROC");
console.log(`PROC: ${proc.v}, Type: ${proc.type}`);

const manual = parseCode("MANUAL");
console.log(`MANUAL: ${manual.v}, Type: ${manual.type}`);
