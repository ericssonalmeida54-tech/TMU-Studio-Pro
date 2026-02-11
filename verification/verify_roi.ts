const roi = { costMin: 0.688, volume: 1000, invest: 5000, daysPerMonth: 22, minutesPerHour: 60 };
const savingMinPerPiece = 0.5; // Hypothetical saving

const monthlySave = savingMinPerPiece * roi.costMin * roi.volume * roi.daysPerMonth;
const annualSave = monthlySave * 12;
const payback = roi.invest / monthlySave;
const hoursSavedYear = (savingMinPerPiece * roi.volume * roi.daysPerMonth * 12) / 60;

console.log("Monthly Save:", monthlySave.toFixed(2));
console.log("Annual Save:", annualSave.toFixed(2));
console.log("Payback:", payback.toFixed(2));
console.log("Hours Saved:", hoursSavedYear.toFixed(2));

// Expected:
// Monthly: 0.5 * 0.688 * 1000 * 22 = 7568
// Annual: 7568 * 12 = 90816
// Payback: 5000 / 7568 = 0.66
// Hours: (0.5 * 1000 * 22 * 12) / 60 = 2200
