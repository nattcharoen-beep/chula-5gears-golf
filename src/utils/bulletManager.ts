import { Flight, HoleConfig, ScoreType } from '../types/golf';
import { SCORE_VALUES } from './zeroSumEngine';

export interface BulletStatus {
  flight: Flight;
  handicap: number;
  coursePar: number;
  holesPlayed: number;
  holesRemaining: number;
  currentGrossOverPar: number;
  currentNetToPar: number;
  minAllowedGross: number;
  bulletsInitial: number;
  bulletsRemaining: number;
  bulletsSpent: number;
  extraBufferStrokes: number;
  riskStatus: 'SAFE' | 'CAUTION' | 'CRITICAL_DQ_RISK' | 'DISQUALIFIED';
  statusColor: string;
  statusBadge: string;
  warningMessage: string;
  safeScoreTargetRemainingHoles: string;
}

export const DEFAULT_18_HOLES: HoleConfig[] = [
  { holeNumber: 1, par: 4, handicapIndex: 7 },
  { holeNumber: 2, par: 5, handicapIndex: 1 },
  { holeNumber: 3, par: 4, handicapIndex: 11 },
  { holeNumber: 4, par: 3, handicapIndex: 15 },
  { holeNumber: 5, par: 4, handicapIndex: 5 },
  { holeNumber: 6, par: 4, handicapIndex: 9 },
  { holeNumber: 7, par: 3, handicapIndex: 17 },
  { holeNumber: 8, par: 5, handicapIndex: 3 },
  { holeNumber: 9, par: 4, handicapIndex: 13 },
  { holeNumber: 10, par: 4, handicapIndex: 8 },
  { holeNumber: 11, par: 5, handicapIndex: 2 },
  { holeNumber: 12, par: 4, handicapIndex: 12 },
  { holeNumber: 13, par: 3, handicapIndex: 16 },
  { holeNumber: 14, par: 4, handicapIndex: 6 },
  { holeNumber: 15, par: 4, handicapIndex: 10 },
  { holeNumber: 16, par: 3, handicapIndex: 18 },
  { holeNumber: 17, par: 5, handicapIndex: 4 },
  { holeNumber: 18, par: 4, handicapIndex: 14 },
];

export function calculateBulletStatus(
  flight: Flight,
  handicap: number,
  scores: (ScoreType | null)[],
  holes: HoleConfig[] = DEFAULT_18_HOLES
): BulletStatus {
  const coursePar = holes.reduce((acc, h) => acc + h.par, 0);
  const minAllowedGross = coursePar + handicap - 4;

  let holesPlayed = 0;
  let currentGrossOverPar = 0;

  for (let i = 0; i < scores.length; i++) {
    const s = scores[i];
    if (s !== null) {
      holesPlayed++;
      currentGrossOverPar += SCORE_VALUES[s];
    }
  }

  const holesRemaining = 18 - holesPlayed;
  const expectedRemainingOverPar = Math.round((holesRemaining / 18) * handicap);
  const projectedFinishOverPar = currentGrossOverPar + expectedRemainingOverPar;

  const rawBullets = projectedFinishOverPar - (handicap - 4);
  const totalCushion = Math.max(0, Math.round(rawBullets));
  const bulletsRemaining = Math.max(0, Math.min(4, totalCushion));
  const extraBufferStrokes = Math.max(0, totalCushion - 4);
  const bulletsSpent = Math.max(0, 4 - bulletsRemaining);

  const currentNetToPar = currentGrossOverPar - Math.round((holesPlayed / 18) * handicap);

  let riskStatus: BulletStatus['riskStatus'] = 'SAFE';
  let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let statusBadge = 'ปลอดภัย (Safe Zone)';
  let warningMessage = 'กระสุนเหลือเพียงพอ สามารถเปิดเกมบุกยิงพาร์ได้ตามปกติ';
  let safeScoreTargetRemainingHoles = 'เล่นตามเกมปกติ';

  if (flight === 'A') {
    riskStatus = 'SAFE';
    statusBadge = 'Flight A (No DQ)';
    statusColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    warningMessage = 'Flight A ไม่มีกฎ Anti-Sandbagging สามารถยิงสกอร์ได้เต็มที่';
    safeScoreTargetRemainingHoles = 'บุกเต็มที่';
  } else {
    if (holesPlayed === 18 && currentGrossOverPar < handicap - 4) {
      riskStatus = 'DISQUALIFIED';
      statusColor = 'text-red-500 bg-red-950/80 border-red-500 animate-pulse';
      statusBadge = 'DISQUALIFIED (ถูกปรับแพ้ 0 แต้ม)';
      warningMessage = 'สกอร์สุทธิต่ำกว่าพาร์เกิน -4 Under Par! สถาบันถูกปรับเป็น 0 คะแนน';
      safeScoreTargetRemainingHoles = 'จบการแข่งขัน (DQ)';
    } else if (bulletsRemaining <= 0) {
      riskStatus = 'CRITICAL_DQ_RISK';
      statusColor = 'text-red-400 bg-red-500/20 border-red-500/50 animate-pulse';
      statusBadge = 'อันตรายสูงสุด! เสี่ยง DQ 0 แต้ม';
      warningMessage = 'กระสุนหมดเกลี้ยง! ห้ามตีต่ำกว่าโบกี้เด็ดขาดในหลุมที่เหลือ มิฉะนั้นจะถูกปรับแพ้ 0 แต้มทั้งก๊วน!';
      const targetOver = Math.max(1, Math.ceil((handicap - 4) - currentGrossOverPar));
      safeScoreTargetRemainingHoles = 'ต้องออกเฉลี่ยโบกี้หรือดับเบิ้ล (+' + targetOver + ' ใน ' + holesRemaining + ' หลุม)';
    } else if (bulletsRemaining === 1) {
      riskStatus = 'CAUTION';
      statusColor = 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      statusBadge = 'ระวัง (เหลือกระสุน 1 นัด)';
      warningMessage = 'กระสุนเหลือเพียง 1 นัด! ถ้าคู่แข่งหลุดโบกี้หรือดับเบิ้ลแล้ว ควรเคาะโบกี้เพื่อเซฟกระสุนไว้';
      safeScoreTargetRemainingHoles = 'เซฟโบกี้เมื่อเป็นไปได้ หลีกเลี่ยงพาร์ที่ไม่จำเป็น';
    } else if (extraBufferStrokes > 0) {
      riskStatus = 'SAFE';
      statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      statusBadge = `ปลอดภัยสูง (4+${extraBufferStrokes} สโตรกสะสม)`;
      warningMessage = `มีโควตากระสุนเต็ม 4 นัด และมีสโตรกสำรองพิเศษสะสมอีก +${extraBufferStrokes} สโตรก เปิดเกมบุกได้อย่างมั่นใจ`;
      safeScoreTargetRemainingHoles = 'เล่นตามเกมธรรมชาติ';
    } else {
      riskStatus = 'SAFE';
      statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      statusBadge = 'กระสุนปลอดภัย (Safe)';
      warningMessage = 'กระสุนเหลือ ' + bulletsRemaining + ' นัด สามารถสู้พาร์ได้เต็มที่เพื่อเก็บแต้มรอบวง';
      safeScoreTargetRemainingHoles = 'เล่นตามเกมธรรมชาติ';
    }
  }

  return {
    flight,
    handicap,
    coursePar,
    holesPlayed,
    holesRemaining,
    currentGrossOverPar,
    currentNetToPar,
    minAllowedGross,
    bulletsInitial: 4,
    bulletsRemaining,
    bulletsSpent,
    extraBufferStrokes,
    riskStatus,
    statusColor,
    statusBadge,
    warningMessage,
    safeScoreTargetRemainingHoles,
  };
}
