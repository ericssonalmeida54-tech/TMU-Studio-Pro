const data = {
  currentMotions: [
    { tmu: 10, freq: 1 },
    { tmu: 20, freq: 1 }
  ],
  proposedMotions: [
    { tmu: 10, freq: 1 }
  ],
  tolerance: 10,
  roi: { costMin: 1.0, volume: 100, daysPerMonth: 20 }
};

const factor = 1 + (data.tolerance / 100);
const curTMU = data.currentMotions.reduce((s, m) => s + m.tmu * m.freq, 0);
const proTMU = data.proposedMotions.reduce((s, m) => s + m.tmu * m.freq, 0);

const curMin = curTMU * 0.0006 * factor;
const proMin = proTMU * 0.0006 * factor;
const savingMin = curMin - proMin;
const savingMoney = savingMin * data.roi.costMin * data.roi.volume * data.roi.daysPerMonth;

console.log(`Current TMU: ${curTMU}`);
console.log(`Proposed TMU: ${proTMU}`);
console.log(`Saving Min: ${savingMin.toFixed(4)}`);
console.log(`Saving Money: ${savingMoney.toFixed(2)}`);

if (Math.abs(savingMin - ((30 - 10) * 0.0006 * 1.1)) > 0.0001) {
    console.error("Calculation Error: Saving Min mismatch");
    process.exit(1);
}

console.log("Calculations verified.");
