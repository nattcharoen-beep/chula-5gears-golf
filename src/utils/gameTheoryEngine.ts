import {
  GameTheoryDecisionResult,
  OpponentLiveState,
  ScoreType,
  UniversityId,
} from '../types/golf';
import { calculateHoleZeroSumPoints } from './zeroSumEngine';

export function getMissedScore(target: ScoreType): ScoreType {
  switch (target) {
    case 'eagle':
      return 'birdie';
    case 'birdie':
      return 'par';
    case 'par':
      return 'bogey';
    case 'bogey':
      return 'double';
    case 'double':
      return 'double';
  }
}

/**
 * Game Theory Decision Engine using Pure Zero-Sum Integer Match Play.
 * All points per hole are strictly integers (-4 to +4). Sum across all 5 players is 0.
 */
export function evaluatePuttingDecision(
  chulaBulletsRemaining: number,
  chulaFlight: string,
  chulaPuttDifficulty: 'easy_tap_in' | 'medium_6_10ft' | 'difficult_downhill',
  opponents: OpponentLiveState[]
): GameTheoryDecisionResult {
  // 1. Determine most-likely discrete score for each opponent
  const oppScoresLikely: Record<UniversityId, ScoreType> = {
    chula: 'par',
    kasetsart: 'bogey',
    cmu: 'bogey',
    kku: 'par',
    psu: 'par',
  };

  const oppScoresBest: Record<UniversityId, ScoreType> = {
    chula: 'par',
    kasetsart: 'bogey',
    cmu: 'bogey',
    kku: 'par',
    psu: 'par',
  };

  const oppScoresMiss: Record<UniversityId, ScoreType> = {
    chula: 'par',
    kasetsart: 'bogey',
    cmu: 'bogey',
    kku: 'par',
    psu: 'par',
  };

  let hasPendingOpponents = false;

  for (const opp of opponents) {
    if (opp.isFinished) {
      oppScoresLikely[opp.universityId] = opp.finishedScore;
      oppScoresBest[opp.universityId] = opp.finishedScore;
      oppScoresMiss[opp.universityId] = opp.finishedScore;
    } else {
      hasPendingOpponents = true;
      if (opp.makeProbabilityPct >= 50) {
        oppScoresLikely[opp.universityId] = opp.pendingTargetScore;
      } else {
        oppScoresLikely[opp.universityId] = getMissedScore(opp.pendingTargetScore);
      }
      oppScoresBest[opp.universityId] = opp.pendingTargetScore;
      oppScoresMiss[opp.universityId] = getMissedScore(opp.pendingTargetScore);
    }
  }

  // Calculate exact Zero-sum integer points for each decision (Most Likely)
  const scoresIfPar = { ...oppScoresLikely, chula: 'par' as ScoreType };
  const pointsIfPar = calculateHoleZeroSumPoints(scoresIfPar).chula; // Integer -4 to +4

  const scoresIfBogey = { ...oppScoresLikely, chula: 'bogey' as ScoreType };
  const pointsIfBogey = calculateHoleZeroSumPoints(scoresIfBogey).chula; // Integer -4 to +4

  const scoresIfDouble = { ...oppScoresLikely, chula: 'double' as ScoreType };
  const pointsIfDouble = calculateHoleZeroSumPoints(scoresIfDouble).chula; // Integer -4 to +4

  const pointSwing = pointsIfPar - pointsIfBogey; // Integer

  // Integer bullets remaining
  const intBullets = Math.round(chulaBulletsRemaining);

  let bulletStatus: GameTheoryDecisionResult['bulletStatus'] = 'SAFE';
  if (chulaFlight !== 'A') {
    if (intBullets <= 0) {
      bulletStatus = 'CRITICAL_DQ_RISK';
    } else if (intBullets === 1) {
      bulletStatus = 'CAUTION';
    }
  }

  let verdict: GameTheoryDecisionResult['verdict'] = 'ATTACK_PAR';
  let verdictTitle = '';
  let verdictBadge = '';
  let badgeBg = '';
  let primaryAdvice = '';
  const tacticalReasons: string[] = [];

  // =========================================================================
  // SCENARIO 1: DUMP HANDICAP (ทิ้งแคปออกดับเบิ้ลเลย!)
  // เงื่อนไข: โดนรอบวงอยู่แล้ว (พาร์/โบกี้/ดับเบิ้ล ได้แต้มเท่ากัน) หรือ โบกี้กับดับเบิ้ลได้แต้มติดลบเท่ากัน
  // เช่น คู่แข่ง 4 คนตีเบอร์ดี้หมด หรือ พาร์กับโบกี้และดับเบิ้ลได้ -4 แต้มเท่ากัน
  // =========================================================================
  if (pointsIfPar === pointsIfBogey && pointsIfDouble === pointsIfBogey && pointsIfBogey <= 0) {
    verdict = 'DUMP_HANDICAP';
    verdictTitle = '🗑️ ทิ้งแคปออกดับเบิ้ลเลย! (โดนกินรอบวงอยู่แล้ว ได้โควตากระสุนคืน)';
    verdictBadge = 'ทิ้งแคปออกดับเบิ้ล';
    badgeBg = 'bg-purple-600 text-white border-purple-400';
    primaryAdvice = `คู่แข่งหลุมนี้สกอร์ดีมาก ไม่ว่าเราจะตีพาร์ โบกี้ หรือดับเบิ้ล ก็ได้แต้มเท่ากันที่ ${pointsIfBogey} แต้ม (โดนรอบวงอยู่แล้ว)! ดังนั้นควรออกดับเบิ้ล (+2) ไปเลย เพื่อทิ้งแต้มต่อสะสม (ทิ้งแคป) ได้โควตากระสุนคืน 1-2 นัดเต็มๆ ป้องกันการโดน DQ 0 คะแนนในหลุมหลังๆ`;
    tacticalReasons.push(
      `แต้ม Match Play เท่ากัน 100%: พาร์ (${pointsIfPar}), โบกี้ (${pointsIfBogey}), ดับเบิ้ล (${pointsIfDouble}) แต้มไม่เปลี่ยน ไม่เสียแต้มเพิ่มแม้แต่แต้มเดียว`,
      'กลยุทธ์ทิ้งแคป (Dump Handicap): ออกดับเบิ้ลช่วยดัน Gross Score ให้ห่างจากเพดานอันเดอร์พาร์ คืนกระสุนให้ทีมทันที',
      'ลดความกดดัน: ไม่ต้องเร่งสู้พัตต์ที่ไม่มีผลต่อผลแพ้ชนะในหลุมนี้ เก็บสมาธิไว้สู้ในหลุมที่มี Point Swing สูง'
    );
  }
  // =========================================================================
  // SCENARIO 2: เคาะโบกี้กินรอบวง (พาร์กับโบกี้ได้แต้มบวกเท่ากัน เช่น +4 หรือ +2)
  // =========================================================================
  else if (pointSwing === 0 && pointsIfBogey > 0) {
    verdict = 'DUMP_BULLET';
    verdictTitle = '🎯 เคาะเอาโบกี้พอ (กินรอบวงชัวร์ + เซฟกระสุนแคป)';
    verdictBadge = 'เคาะโบกี้กินรอบวง';
    badgeBg = 'bg-blue-600 text-white border-blue-400';
    primaryAdvice = `ไม่ว่าจะตีพาร์หรือโบกี้ คุณจะได้แต้มสูงสุดเท่ากันที่ +${pointsIfBogey} แต้ม (กินรอบวงชัวร์)! คู่แข่งหลุดหมดแล้ว แนะนำเคาะโบกี้เก็บแต้มชนะและเซฟกระสุนแคปไว้ใช้ในหลุมยากข้างหน้า`;
    tacticalReasons.push(
      'คู่แข่งทุกคนหลุดสกอร์ไปแล้ว โบกี้ของคุณชนะรอบวงเรียบร้อย',
      `แต้มที่จะได้: ยิงพาร์ได้ +${pointsIfPar} แต้ม vs เคาะโบกี้ได้ +${pointsIfBogey} แต้ม (ส่วนต่าง = 0 แต้ม)`,
      'ประหยัดกระสุนแคปได้ 1 นัดเต็มๆ โดยไม่เสียแต้มในการแข่งขันแม้แต่แต้มเดียว'
    );
  }
  // =========================================================================
  // SCENARIO 3: CRITICAL DQ RISK (กระสุนหมด 0 นัด ห้ามทำพาร์)
  // =========================================================================
  else if (bulletStatus === 'CRITICAL_DQ_RISK') {
    if (pointsIfDouble === pointsIfBogey) {
      verdict = 'DUMP_HANDICAP';
      verdictTitle = '🗑️ ทิ้งแคปออกดับเบิ้ลทันที! (กระสุนหมด 0 นัด ต้องรีบเติมกระสุน)';
      verdictBadge = 'ทิ้งแคปเติมกระสุนด่วน';
      badgeBg = 'bg-purple-600 text-white border-purple-400';
      primaryAdvice = `กระสุนแต้มต่อเหลือ 0 นัด อยู่ในโซนอันตรายสูงสุด! การทำดับเบิ้ลได้แต้มเท่ากับโบกี้ (${pointsIfBogey} แต้ม) แนะนำออกดับเบิ้ลเพื่อเติมกระสุนคุ้มกันการโดนปรับแพ้ DQ ทันที`;
      tacticalReasons.push(
        'แต้มโบกี้และดับเบิ้ลเท่ากัน ไม่เสียแต้ม Match Play เพิ่ม',
        'การออกดับเบิ้ลจะคืนโควตากระสุน 1-2 นัด ช่วยปลดล็อกความเสี่ยง DQ หลุดรอบวง 0 แต้ม',
        'ความปลอดภัยของแต้มรวมทั้งก๊วนสำคัญกว่าสโตรกหลุมเดียว'
      );
    } else {
      verdict = 'SAFE_BOGEY';
      verdictTitle = '🛡️ เซฟโบกี้ด่วน! (ระวังหลุด DQ ปรับแพ้ 0 แต้ม)';
      verdictBadge = 'เซฟโบกี้ป้องกัน DQ';
      badgeBg = 'bg-red-600 text-white border-red-400';
      primaryAdvice = `กระสุนเหลือ 0 นัด! หากทำพาร์จะเสี่ยงถูกปรับแพ้ DQ ทันที (เสีย 5 แต้มสถาบันกลายเป็น 0) ยอมรับผลโบกี้เพื่อปกป้องคะแนนทีม`;
      tacticalReasons.push(
        'กระสุนแต้มต่ออยู่ในโซนอันตรายสูงสุด (แตะเพดาน -4 Under Par)',
        `แม้พาร์จะได้ ${pointsIfPar > 0 ? '+' : ''}${pointsIfPar} แต้ม แต่หากจบ 18 หลุมแล้วโดน DQ จุฬาฯ จะได้ 0 คะแนนทั้งก๊วน`,
        'การเคาะโบกี้ช่วยคืนกระสุนและการันตีว่าทีมจะจบได้คะแนน 3-5 แต้มตามปกติ'
      );
    }
  }
  // =========================================================================
  // SCENARIO 4: DOWNHILL 3-PUTT RISK (ระวังหลุด 3 พัตต์ออกดับเบิ้ล)
  // เกิดขึ้นเมื่อดับเบิ้ลเสียแต้มมากกว่าโบกี้ และพัตต์ลงเนินเร็ว
  // =========================================================================
  else if (chulaPuttDifficulty === 'difficult_downhill' && pointSwing <= 2 && pointsIfDouble < pointsIfBogey) {
    verdict = 'DEFEND_DOUBLE';
    verdictTitle = '⚠️ พัตต์น้ำหนักเอาโบกี้ (ระวังหลุด 3 พัตต์ออกดับเบิ้ล)';
    verdictBadge = 'พัตต์น้ำหนักห้ามหลุดดับเบิ้ล';
    badgeBg = 'bg-amber-600 text-white border-amber-400';
    primaryAdvice = `ไลน์พัตต์ลงเนินเร็ว หากเร่งสู้พาร์แล้วเลยหลุม เสี่ยงออกดับเบิ้ลซึ่งจะเสียถึง ${pointsIfDouble} แต้ม แนะนำพัตต์แตะน้ำหนักเอาโบกี้ชัวร์`;
    tacticalReasons.push(
      `ถ้าออกดับเบิ้ลแต้มจะรูดลงไปที่ ${pointsIfDouble} แต้ม (เสียหนักมาก)`,
      'กระสุนเหลือจำกัด ไม่ควรเสี่ยงกับพัตต์ที่โอกาส 3 พัตต์สูง',
      'การเก็บโบกี้ชัวร์ช่วยจำกัดความเสียหายไว้ที่คาดเดาได้'
    );
  }
  // =========================================================================
  // SCENARIO 5: STANDARD ATTACK PAR (สู้พาร์เต็มตัว)
  // =========================================================================
  else {
    verdict = 'ATTACK_PAR';
    verdictTitle = '🔥 สู้พาร์เต็มตัว! (Point Swing สูง คุ้มค่าแลกกระสุน)';
    verdictBadge = 'สู้พาร์เต็มตัว';
    badgeBg = 'bg-emerald-600 text-white border-emerald-400';
    primaryAdvice = `คู่แข่งด้านหลังมีโอกาสทำแต้มดี การยอมโบกี้จะทำให้แต้มหล่นไปที่ ${pointsIfBogey} แต้ม แต่ถ้าพัตต์พาร์ลงจะคว้า ${pointsIfPar > 0 ? '+' : ''}${pointsIfPar} แต้ม ส่วนต่างสูงถึง ${pointSwing} แต้มเต็ม! คุ้มค่ามากที่จะสู้`;
    tacticalReasons.push(
      `Point Swing ในหลุมนี้สูงถึง ${pointSwing} แต้มเต็ม (ส่วนต่างระหว่างพาร์กับโบกี้)`,
      `สถานะกระสุนเหลือ ${intBullets} นัด ปลอดภัย คุ้มค่ามากที่จะใช้กระสุน 1 นัดเพื่อแลกกับแต้มในหลุมนี้`,
      pointsIfDouble === pointsIfBogey
        ? 'หากพัตต์พาร์ไม่ลง แล้วหลุดดับเบิ้ล แต้มยังเท่ากับโบกี้ จึงสามารถพัตต์สู้พาร์ได้เต็มที่ไร้กังวล'
        : 'ตั้งใจคุมน้ำหนักพัตต์พาร์ให้ถึงหลุม'
    );
  }

  // Discrete scenario breakdown (all integer points)
  const scenarioBreakdown: GameTheoryDecisionResult['scenarioBreakdown'] = [];

  if (!hasPendingOpponents) {
    scenarioBreakdown.push({
      scenario: 'คู่แข่งทั้ง 4 คนจบหลุมแล้ว (ทราบผลแน่นอน 100%)',
      probabilityPct: 100,
      chulaParPoints: pointsIfPar,
      chulaBogeyPoints: pointsIfBogey,
      netSwing: pointSwing,
    });
  } else {
    // Scenario 1: Likely
    scenarioBreakdown.push({
      scenario: 'กรณี 1: คู่แข่งตีตามการประเมินสด (Most Likely)',
      probabilityPct: 60,
      chulaParPoints: pointsIfPar,
      chulaBogeyPoints: pointsIfBogey,
      netSwing: pointSwing,
    });

    // Scenario 2: Opponents Best
    const bestParPts = calculateHoleZeroSumPoints({ ...oppScoresBest, chula: 'par' }).chula;
    const bestBogeyPts = calculateHoleZeroSumPoints({ ...oppScoresBest, chula: 'bogey' }).chula;
    scenarioBreakdown.push({
      scenario: 'กรณี 2: คู่แข่งด้านหลังพัตต์ลงตามเป้าทุกคน (Opponents Best)',
      probabilityPct: 20,
      chulaParPoints: bestParPts,
      chulaBogeyPoints: bestBogeyPts,
      netSwing: bestParPts - bestBogeyPts,
    });

    // Scenario 3: Opponents Miss
    const missParPts = calculateHoleZeroSumPoints({ ...oppScoresMiss, chula: 'par' }).chula;
    const missBogeyPts = calculateHoleZeroSumPoints({ ...oppScoresMiss, chula: 'bogey' }).chula;
    scenarioBreakdown.push({
      scenario: 'กรณี 3: คู่แข่งด้านหลังพลาดทุกลูก (+1 สโตรก) (Opponents Miss)',
      probabilityPct: 20,
      chulaParPoints: missParPts,
      chulaBogeyPoints: missBogeyPts,
      netSwing: missParPts - missBogeyPts,
    });
  }

  return {
    verdict,
    verdictTitle,
    verdictBadge,
    badgeBg,
    primaryAdvice,
    pointSwing,
    expectedPointsIfPar: pointsIfPar,
    expectedPointsIfBogey: pointsIfBogey,
    expectedPointsIfDouble: pointsIfDouble,
    bulletCostIfPar: 1,
    bulletRefundIfBogey: 0,
    bulletStatus,
    chulaBulletsRemaining: intBullets,
    tacticalReasons,
    scenarioBreakdown,
  };
}
