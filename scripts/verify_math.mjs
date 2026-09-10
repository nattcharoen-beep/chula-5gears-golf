import { calculateHoleZeroSumPoints, calculateUniversityTournamentPoints } from '../src/utils/zeroSumEngine.js';
import { evaluatePuttingDecision } from '../src/utils/gameTheoryEngine.js';

console.log("=== 1. TEST ZERO-SUM FORMULA ===");
const hole1 = calculateHoleZeroSumPoints({
  chula: 'birdie',
  kasetsart: 'par',
  cmu: 'par',
  kku: 'bogey',
  psu: 'bogey'
});
console.log("Hole 1 Points:", hole1);
const sum1 = Object.values(hole1).reduce((a, b) => a + b, 0);
console.log("Sum:", sum1);
if (hole1.chula === 4 && hole1.kasetsart === 1 && hole1.cmu === 1 && hole1.kku === -3 && hole1.psu === -3 && sum1 === 0) {
  console.log("✅ Zero-Sum math matches user prompt exactly! (4, 1, 1, -3, -3 = 0)");
} else {
  console.error("❌ Mismatch in Zero-sum calculation!");
}

console.log("\n=== 2. TEST CASE: 4 OPPONENTS DOUBLE BOGEY ===");
const decDouble = evaluatePuttingDecision(
  3,
  'C',
  'medium_6_10ft',
  [
    { universityId: 'kasetsart', orderNumber: 1, isFinished: true, finishedScore: 'double', currentShotNumber: 5, pendingTargetScore: 'double', makeProbabilityPct: 95, distanceDescription: 'tap_in' },
    { universityId: 'cmu', orderNumber: 2, isFinished: true, finishedScore: 'double', currentShotNumber: 5, pendingTargetScore: 'double', makeProbabilityPct: 95, distanceDescription: 'tap_in' },
    { universityId: 'kku', orderNumber: 4, isFinished: true, finishedScore: 'double', currentShotNumber: 5, pendingTargetScore: 'double', makeProbabilityPct: 95, distanceDescription: 'tap_in' },
    { universityId: 'psu', orderNumber: 5, isFinished: true, finishedScore: 'double', currentShotNumber: 5, pendingTargetScore: 'double', makeProbabilityPct: 95, distanceDescription: 'tap_in' },
  ]
);
console.log("Verdict:", decDouble.verdict);
console.log("Point Swing:", decDouble.pointSwing);
console.log("Par Pts:", decDouble.expectedPointsIfPar, "Bogey Pts:", decDouble.expectedPointsIfBogey);
if (decDouble.verdict === 'DUMP_BULLET' && decDouble.pointSwing === 0) {
  console.log("✅ Correctly recommends taking Bogey to save bullet (both give +4 pts)!");
}

console.log("\n=== 3. TEST CASE: WE ARE PUTTING 3RD (P1=BOGEY, P2=BOGEY, P4=CLOSE PAR, P5=CLOSE PAR) ===");
const decP3 = evaluatePuttingDecision(
  3, // 3 bullets left
  'C',
  'medium_6_10ft',
  [
    { universityId: 'kasetsart', orderNumber: 1, isFinished: true, finishedScore: 'bogey', currentShotNumber: 4, pendingTargetScore: 'bogey', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
    { universityId: 'cmu', orderNumber: 2, isFinished: true, finishedScore: 'bogey', currentShotNumber: 4, pendingTargetScore: 'bogey', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
    { universityId: 'kku', orderNumber: 4, isFinished: false, finishedScore: 'par', currentShotNumber: 4, pendingTargetScore: 'par', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
    { universityId: 'psu', orderNumber: 5, isFinished: false, finishedScore: 'par', currentShotNumber: 4, pendingTargetScore: 'par', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
  ]
);
console.log("With 3 Bullets - Verdict:", decP3.verdict);
console.log("Point Swing:", decP3.pointSwing);
console.log("Par Pts:", decP3.expectedPointsIfPar, "Bogey Pts:", decP3.expectedPointsIfBogey);
if (decP3.verdict === 'ATTACK_PAR' && decP3.pointSwing >= 3.5) {
  console.log("✅ Correctly recommends Attack Par due to massive 4-point swing!");
}

const decP3NoBullets = evaluatePuttingDecision(
  0, // 0 bullets left (Critical DQ Risk!)
  'C',
  'medium_6_10ft',
  [
    { universityId: 'kasetsart', orderNumber: 1, isFinished: true, finishedScore: 'bogey', currentShotNumber: 4, pendingTargetScore: 'bogey', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
    { universityId: 'cmu', orderNumber: 2, isFinished: true, finishedScore: 'bogey', currentShotNumber: 4, pendingTargetScore: 'bogey', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
    { universityId: 'kku', orderNumber: 4, isFinished: false, finishedScore: 'par', currentShotNumber: 4, pendingTargetScore: 'par', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
    { universityId: 'psu', orderNumber: 5, isFinished: false, finishedScore: 'par', currentShotNumber: 4, pendingTargetScore: 'par', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
  ]
);
console.log("\nWith 0 Bullets - Verdict:", decP3NoBullets.verdict);
if (decP3NoBullets.verdict === 'SAFE_BOGEY') {
  console.log("✅ Correctly flips to Safe Bogey when bullets = 0 to protect from DQ!");
}

console.log("\n=== 4. TEST TOURNAMENT STANDINGS & DQ ===");
const standings = calculateUniversityTournamentPoints([
  { universityId: 'chula', totalZeroSumPoints: 10, isDq: false },
  { universityId: 'kasetsart', totalZeroSumPoints: 10, isDq: false },
  { universityId: 'cmu', totalZeroSumPoints: 2, isDq: false },
  { universityId: 'kku', totalZeroSumPoints: -5, isDq: false },
  { universityId: 'psu', totalZeroSumPoints: -17, isDq: false },
]);
console.log("Tied 1st Points:", standings.chula.universityPoints, "and", standings.kasetsart.universityPoints);
if (standings.chula.universityPoints === 4.5 && standings.kasetsart.universityPoints === 4.5) {
  console.log("✅ Correctly split T1 points as (5 + 4)/2 = 4.5 pts each!");
}

const standingsWithDq = calculateUniversityTournamentPoints([
  { universityId: 'chula', totalZeroSumPoints: 25, isDq: true }, // DQ!
  { universityId: 'kasetsart', totalZeroSumPoints: 10, isDq: false },
  { universityId: 'cmu', totalZeroSumPoints: 2, isDq: false },
  { universityId: 'kku', totalZeroSumPoints: -5, isDq: false },
  { universityId: 'psu', totalZeroSumPoints: -17, isDq: false },
]);
console.log("Chula DQ Points:", standingsWithDq.chula.universityPoints);
if (standingsWithDq.chula.universityPoints === 0 && standingsWithDq.kasetsart.universityPoints === 5) {
  console.log("✅ Correctly awarded 0 pts for DQ and shifted KU to 1st (5 pts)!");
}
