import { calculateHoleZeroSumPoints, calculateUniversityTournamentPoints } from '../src/utils/zeroSumEngine';
import { evaluatePuttingDecision } from '../src/utils/gameTheoryEngine';

console.log("=== 1. TEST ZERO-SUM FORMULA (NO DECIMALS) ===");
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
if (decDouble.expectedPointsIfPar === 4 && decDouble.expectedPointsIfBogey === 4 && decDouble.pointSwing === 0) {
  console.log("✅ Exact integers: Par = +4, Bogey = +4, Swing = 0!");
}

console.log("\n=== 3. TEST CASE: WE ARE PUTTING 3RD (P1=BOGEY, P2=BOGEY, P4=CLOSE PAR, P5=CLOSE PAR) ===");
const decP3 = evaluatePuttingDecision(
  3,
  'C',
  'medium_6_10ft',
  [
    { universityId: 'kasetsart', orderNumber: 1, isFinished: true, finishedScore: 'bogey', currentShotNumber: 4, pendingTargetScore: 'bogey', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
    { universityId: 'cmu', orderNumber: 2, isFinished: true, finishedScore: 'bogey', currentShotNumber: 4, pendingTargetScore: 'bogey', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
    { universityId: 'kku', orderNumber: 4, isFinished: false, finishedScore: 'par', currentShotNumber: 4, pendingTargetScore: 'par', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
    { universityId: 'psu', orderNumber: 5, isFinished: false, finishedScore: 'par', currentShotNumber: 4, pendingTargetScore: 'par', makeProbabilityPct: 90, distanceDescription: 'tap_in' },
  ]
);
console.log("Par Pts:", decP3.expectedPointsIfPar);
console.log("Bogey Pts:", decP3.expectedPointsIfBogey);
console.log("Double Pts:", decP3.expectedPointsIfDouble);
console.log("Point Swing:", decP3.pointSwing);
if (decP3.expectedPointsIfPar === 2 && decP3.expectedPointsIfBogey === -2 && decP3.expectedPointsIfDouble === -4 && decP3.pointSwing === 4) {
  console.log("✅ Exactly integers! Par = +2, Bogey = -2, Double = -4, Swing = +4 (Zero decimals!)");
} else {
  console.error("Mismatch in integer points:", decP3);
}
