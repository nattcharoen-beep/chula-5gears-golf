import {
  GameTheoryDecisionResult,
  OpponentLiveState,
  ScoreType,
  UniversityId,
  UNIVERSITIES,
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
  opponents: OpponentLiveState[],
  chulaTargetScore: ScoreType = 'par'
): GameTheoryDecisionResult {
  const isFlightA = chulaFlight === 'A';

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
  const birdieOpponents: string[] = [];

  for (const opp of opponents) {
    if (opp.isFinished) {
      oppScoresLikely[opp.universityId] = opp.finishedScore;
      oppScoresBest[opp.universityId] = opp.finishedScore;
      oppScoresMiss[opp.universityId] = opp.finishedScore;

      if (opp.finishedScore === 'birdie' || opp.finishedScore === 'eagle') {
        birdieOpponents.push(UNIVERSITIES[opp.universityId].badge);
      }
    } else {
      hasPendingOpponents = true;
      const likely =
        opp.makeProbabilityPct >= 50
          ? opp.pendingTargetScore
          : getMissedScore(opp.pendingTargetScore);

      oppScoresLikely[opp.universityId] = likely;
      oppScoresBest[opp.universityId] = opp.pendingTargetScore;
      oppScoresMiss[opp.universityId] = getMissedScore(opp.pendingTargetScore);

      if (opp.pendingTargetScore === 'birdie' || opp.pendingTargetScore === 'eagle') {
        if (opp.makeProbabilityPct >= 50) {
          birdieOpponents.push(UNIVERSITIES[opp.universityId].badge);
        }
      }
    }
  }

  // Calculate exact Zero-sum integer points for each discrete outcome
  const scoresIfEagle = { ...oppScoresLikely, chula: 'eagle' as ScoreType };
  const pointsIfEagle = calculateHoleZeroSumPoints(scoresIfEagle).chula; // Integer -4 to +4

  const scoresIfBirdie = { ...oppScoresLikely, chula: 'birdie' as ScoreType };
  const pointsIfBirdie = calculateHoleZeroSumPoints(scoresIfBirdie).chula; // Integer -4 to +4

  const scoresIfPar = { ...oppScoresLikely, chula: 'par' as ScoreType };
  const pointsIfPar = calculateHoleZeroSumPoints(scoresIfPar).chula; // Integer -4 to +4

  const scoresIfBogey = { ...oppScoresLikely, chula: 'bogey' as ScoreType };
  const pointsIfBogey = calculateHoleZeroSumPoints(scoresIfBogey).chula; // Integer -4 to +4

  const scoresIfDouble = { ...oppScoresLikely, chula: 'double' as ScoreType };
  const pointsIfDouble = calculateHoleZeroSumPoints(scoresIfDouble).chula; // Integer -4 to +4

  let pointSwing = pointsIfPar - pointsIfBogey; // Standard swing between Par and Bogey

  // Integer bullets remaining
  const intBullets = Math.round(chulaBulletsRemaining);

  let bulletStatus: GameTheoryDecisionResult['bulletStatus'] = 'SAFE';
  if (!isFlightA) {
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
  // SCENARIO 0: HUNT EAGLE (ลุยอีเกิ้ลเต็มตัว! เมื่อเลือกช็อตลุ้นอีเกิ้ล)
  // =========================================================================
  if (chulaTargetScore === 'eagle') {
    verdict = 'HUNT_EAGLE';
    pointSwing = pointsIfEagle - pointsIfBirdie;
    badgeBg = 'bg-amber-500 text-black border-amber-300 font-black';
    verdictBadge = 'ลุยอีเกิ้ลเต็มตัว';
    verdictTitle = `🦅 ลุยอีเกิ้ลเต็มตัว! (โอกาสคว้าแต้มสูงสุด +${pointsIfEagle} แต้ม)`;
    primaryAdvice = `โอกาสทองพัตต์ทำอีเกิ้ล! หากพัตต์ลงจะคว้าแต้มขาดถึง +${pointsIfEagle} แต้ม นำโด่งรอบวง ${
      isFlightA ? 'ในไฟลท์ A เล่นสแครตช์บุกได้ 100% ไร้กฎ DQ' : 'โควตากระสุนปลอดภัย สู้ได้เต็มที่'
    }`;
    tacticalReasons.push(
      `พัตต์อีเกิ้ลลงการันตีแต้มสูงสุด +${pointsIfEagle} แต้ม ชนะรอบวงแบบเด็ดขาด`,
      `หากพลาดเก็บเบอร์ดี้ยังคงได้แต้มสูง (${pointsIfBirdie > 0 ? '+' : ''}${pointsIfBirdie} แต้ม)`,
      isFlightA
        ? 'ไฟลท์ A (สแครตช์): เล่นเหมือนไม่มีแคป บุกอีเกิ้ลได้เต็มเหนี่ยว'
        : 'สถานะกระสุนปลอดภัย สามารถเปิดเกมบุกแลกแต้มได้'
    );
  }
  // =========================================================================
  // SCENARIO 1: HUNT BIRDIE (ลุยเบอร์ดี้เต็มตัว!)
  // เกิดขึ้นเมื่อ: ผู้เล่นเลือกพัตต์ลุ้นเบอร์ดี้โดยเฉพาะ
  // =========================================================================
  else if (chulaTargetScore === 'birdie') {
    verdict = 'HUNT_BIRDIE';
    pointSwing = pointsIfBirdie - pointsIfPar; // Swing ระหว่างเบอร์ดี้กับพาร์
    badgeBg = 'bg-red-600 text-white border-red-400';

    if (isFlightA) {
      verdictBadge = 'ลุยเบอร์ดี้สแครตช์';
      if (birdieOpponents.length > 0) {
        verdictTitle = `🦅 ลุยเบอร์ดี้เต็มตัว! (คู่แข่งดี้ ${birdieOpponents.length} คน ต้องดี้สู้เพื่อแต้มบวก)`;
        primaryAdvice = `คู่แข่งหลุมนี้ออกเบอร์ดี้ไปแล้ว (${birdieOpponents.join(
          ', '
        )}) หากเราออกเพียงพาร์แต้มจะติดลบ (${pointsIfPar} แต้ม) ต้องพัตต์เบอร์ดี้ให้ลงเพื่อพลิกกลับมาคว้า +${pointsIfBirdie} แต้ม (Point Swing สูงถึง +${pointSwing} แต้ม!) ในไฟลท์ A เล่นสแครตช์เพียวๆ ไม่มีแคป ไม่มีกฎ DQ บุกดี้ได้เต็มที่!`;
      } else {
        verdictTitle = `🦅 ลุยเบอร์ดี้เต็มตัว! (โอกาสคว้าแต้มขาด +${pointsIfBirdie} แต้ม)`;
        primaryAdvice = `โอกาสทองในการพัตต์ทำเบอร์ดี้! หากพัตต์ลงจะคว้าแต้มสูงถึง +${pointsIfBirdie} แต้ม นำโด่งรอบวง ในไฟลท์ A เล่นสแครตช์เพียวๆ บุกได้เต็มข้อ`;
      }

      tacticalReasons.push(
        birdieOpponents.length > 0
          ? `คู่แข่งทำเบอร์ดี้ (${birdieOpponents.join(
              ', '
            )}): หากเราทำพาร์จะแพ้ เสียแต้ม ${pointsIfPar} แต้ม`
          : `พัตต์เบอร์ดี้ลงจะคว้า +${pointsIfBirdie} แต้ม ชนะรอบวงแบบเด็ดขาด`,
        `หากพัตต์เบอร์ดี้ลง: จะพลิกมาชนะ/เสมอ คว้าแต้ม +${pointsIfBirdie} แต้ม (Point Swing +${pointSwing} แต้มเต็ม)`,
        'ไฟลท์ A (สแครตช์): เล่นเหมือนไม่มีแคป ไม่มีโควตากระสุนที่ต้องประหยัด ไม่มีความเสี่ยง DQ บุกเบอร์ดี้ได้ 100%'
      );
    } else {
      // Flight B, C, D
      verdictBadge = 'ลุยเบอร์ดี้เต็มตัว';
      verdictTitle = `🦅 ลุยเบอร์ดี้เต็มตัว! (${
        birdieOpponents.length > 0 ? `คู่แข่งดี้ ${birdieOpponents.length} คน ` : ''
      }ต้องดี้เพื่อแต้มบวก)`;
      primaryAdvice =
        birdieOpponents.length > 0
          ? `คู่แข่งทำเบอร์ดี้ไปแล้ว (${birdieOpponents.join(
              ', '
            )}) หากออกเพียงพาร์แต้มจะหล่นไปที่ ${pointsIfPar} แต้ม ต้องเร่งพัตต์เบอร์ดี้ให้ลงเพื่อคว้า +${pointsIfBirdie} แต้ม (Point Swing +${pointSwing} แต้ม) โควตากระสุนยังปลอดภัย แนะนำสู้เบอร์ดี้!`
          : `โอกาสทองพัตต์เบอร์ดี้เพื่อคว้าแต้มสูงสุด +${pointsIfBirdie} แต้ม โควตากระสุนปลอดภัย สู้ได้เต็มที่`;

      tacticalReasons.push(
        `Point Swing ระหว่างเบอร์ดี้กับพาร์สูงถึง +${pointSwing} แต้มเต็ม`,
        `สถานะกระสุนเหลือ ${intBullets} นัด ปลอดภัย คุ้มค่ามากที่จะเปิดเกมบุกเบอร์ดี้แลกแต้ม`,
        pointsIfDouble === pointsIfBogey
          ? 'หากพลาดพาร์แล้วหลุดดับเบิ้ล แต้มยังเท่ากับโบกี้ สู้ได้อย่างไร้กังวล'
          : 'ตั้งใจคุมน้ำหนักพัตต์ให้อยู่ในระยะเก็บพาร์'
      );
    }
  }
  // =========================================================================
  // SCENARIO 2: DEFEND DOUBLE / BOGEY TARGET (เมื่อผู้เล่นเลือกลุ้นโบกี้)
  // =========================================================================
  else if (chulaTargetScore === 'bogey') {
    pointSwing = pointsIfBogey - pointsIfDouble;
    verdict = 'DEFEND_DOUBLE';
    verdictBadge = 'เซฟโบกี้ชัวร์';
    badgeBg = 'bg-slate-700 text-white border-slate-500';
    verdictTitle = '🛡️ เคาะเอาโบกี้ชัวร์ (ระวังอย่าให้หลุดดับเบิ้ล)';
    primaryAdvice = `ช็อตนี้เป็นพัตต์ลุ้นโบกี้ แนะนำคุมน้ำหนักพัตต์เก็บโบกี้ชัวร์ (${pointsIfBogey > 0 ? '+' : ''}${pointsIfBogey} แต้ม) ระวังอย่าให้หลุด 3 พัตต์ออกดับเบิ้ล (${pointsIfDouble} แต้ม) ซึ่งจะทำให้เสียแต้ม Match Play เพิ่มอีก ${pointSwing} แต้ม!`;
    tacticalReasons.push(
      `แต้มโบกี้: ${pointsIfBogey > 0 ? '+' : ''}${pointsIfBogey} แต้ม vs ดับเบิ้ล: ${pointsIfDouble} แต้ม (Swing ${pointSwing} แต้ม)`,
      'เน้นแตะน้ำหนักให้ลูกหยุดข้างปากหลุมเพื่อเก็บแท็ปอินโบกี้ ป้องกันแต้มหลุด'
    );
  }
  // =========================================================================
  // SCENARIO 3: DUMP HANDICAP (ทิ้งแคปออกดับเบิ้ลเลย!)
  // เฉพาะ Flight B, C, D เท่านั้น! (Flight A ไม่มีแคปให้ทิ้ง)
  // =========================================================================
  else if (
    !isFlightA &&
    pointsIfPar === pointsIfBogey &&
    pointsIfDouble === pointsIfBogey &&
    pointsIfBogey <= 0
  ) {
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
  // SCENARIO 3B: กรณีแต้มเท่ากันทุกสกอร์ใน Flight A (ไม่เรียกว่าทิ้งแคป)
  // =========================================================================
  else if (
    isFlightA &&
    pointsIfPar === pointsIfBogey &&
    pointsIfDouble === pointsIfBogey
  ) {
    verdict = 'ATTACK_PAR';
    verdictTitle = '🛡️ แต้มเท่ากันทุกสกอร์ (เล่นชิลๆ ไม่เสียแต้มเพิ่ม)';
    verdictBadge = 'แต้มเท่ากันทุกผล';
    badgeBg = 'bg-slate-700 text-white border-slate-500';
    primaryAdvice = `ไม่ว่าเราจะออกพาร์ โบกี้ หรือดับเบิ้ล หลุมนี้ได้แต้มเท่ากันที่ ${pointsIfBogey} แต้ม เล่นอย่างผ่อนคลาย ไม่มีความกดดันเรื่องสโตรกในหลุมนี้`;
    tacticalReasons.push(
      `แต้ม Match Play เท่ากันทุกกรณี: พาร์ (${pointsIfPar}), โบกี้ (${pointsIfBogey}), ดับเบิ้ล (${pointsIfDouble})`,
      'ไฟลท์ A ไม่มีกฎ DQ หรือกระสุนแต้มต่อ เล่นตามเกมธรรมชาติ',
      'เก็บสมาธิไว้สู้เต็มตัวในหลุมถัดไป'
    );
  }
  // =========================================================================
  // SCENARIO 4: เคาะโบกี้กินรอบวง (พาร์กับโบกี้ได้แต้มบวกเท่ากัน เช่น +4 หรือ +2)
  // =========================================================================
  else if (pointSwing === 0 && pointsIfBogey > 0) {
    verdict = 'DUMP_BULLET';
    badgeBg = 'bg-blue-600 text-white border-blue-400';

    if (isFlightA) {
      verdictTitle = '🎯 เคาะเอาโบกี้พอ (กินรอบวงชัวร์)';
      verdictBadge = 'เคาะโบกี้กินรอบวง';
      primaryAdvice = `ไม่ว่าจะตีพาร์หรือโบกี้ คุณจะได้แต้มสูงสุดเท่ากันที่ +${pointsIfBogey} แต้ม (กินรอบวงชัวร์)! คู่แข่งหลุดหมดแล้ว แนะนำเคาะโบกี้เก็บแต้มชนะแบบไร้ความเสี่ยง`;
      tacticalReasons.push(
        'คู่แข่งทุกคนหลุดสกอร์ไปแล้ว โบกี้ของคุณชนะรอบวงเรียบร้อย',
        `แต้มที่จะได้: ยิงพาร์ได้ +${pointsIfPar} แต้ม vs เคาะโบกี้ได้ +${pointsIfBogey} แต้ม (ส่วนต่าง = 0 แต้ม)`,
        'การันตีแต้มเต็มให้ทีมจุฬาฯ โดยไม่ต้องเสี่ยงพัตต์ยาก'
      );
    } else {
      verdictTitle = '🎯 เคาะเอาโบกี้พอ (กินรอบวงชัวร์ + เซฟกระสุนแคป)';
      verdictBadge = 'เคาะโบกี้กินรอบวง';
      primaryAdvice = `ไม่ว่าจะตีพาร์หรือโบกี้ คุณจะได้แต้มสูงสุดเท่ากันที่ +${pointsIfBogey} แต้ม (กินรอบวงชัวร์)! คู่แข่งหลุดหมดแล้ว แนะนำเคาะโบกี้เก็บแต้มชนะและเซฟกระสุนแคปไว้ใช้ในหลุมยากข้างหน้า`;
      tacticalReasons.push(
        'คู่แข่งทุกคนหลุดสกอร์ไปแล้ว โบกี้ของคุณชนะรอบวงเรียบร้อย',
        `แต้มที่จะได้: ยิงพาร์ได้ +${pointsIfPar} แต้ม vs เคาะโบกี้ได้ +${pointsIfBogey} แต้ม (ส่วนต่าง = 0 แต้ม)`,
        'ประหยัดกระสุนแคปได้ 1 นัดเต็มๆ โดยไม่เสียแต้มในการแข่งขันแม้แต่แต้มเดียว'
      );
    }
  }
  // =========================================================================
  // SCENARIO 5: CRITICAL DQ RISK (Flight B, C, D เท่านั้น เมื่อกระสุนหมด 0 นัด)
  // =========================================================================
  else if (!isFlightA && bulletStatus === 'CRITICAL_DQ_RISK') {
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
        `แม้พาร์จะได้ ${
          pointsIfPar > 0 ? '+' : ''
        }${pointsIfPar} แต้ม แต่หากจบ 18 หลุมแล้วโดน DQ จุฬาฯ จะได้ 0 คะแนนทั้งก๊วน`,
        'การเคาะโบกี้ช่วยคืนกระสุนและการันตีว่าทีมจะจบได้คะแนน 3-5 แต้มตามปกติ'
      );
    }
  }
  // =========================================================================
  // SCENARIO 6: DOWNHILL 3-PUTT RISK (ระวังหลุด 3 พัตต์ออกดับเบิ้ล)
  // =========================================================================
  else if (
    chulaPuttDifficulty === 'difficult_downhill' &&
    pointSwing <= 2 &&
    pointsIfDouble < pointsIfBogey
  ) {
    verdict = 'DEFEND_DOUBLE';
    verdictTitle = '⚠️ พัตต์น้ำหนักเอาโบกี้ (ระวังหลุด 3 พัตต์ออกดับเบิ้ล)';
    verdictBadge = 'พัตต์น้ำหนักห้ามหลุดดับเบิ้ล';
    badgeBg = 'bg-amber-600 text-white border-amber-400';
    primaryAdvice = `ไลน์พัตต์ลงเนินเร็ว หากเร่งสู้พาร์แล้วเลยหลุม เสี่ยงออกดับเบิ้ลซึ่งจะเสียถึง ${pointsIfDouble} แต้ม แนะนำพัตต์แตะน้ำหนักเอาโบกี้ชัวร์`;
    tacticalReasons.push(
      `ถ้าออกดับเบิ้ลแต้มจะรูดลงไปที่ ${pointsIfDouble} แต้ม (เสียหนักมาก)`,
      isFlightA
        ? 'ในไฟลท์ A ไม่ควรเสี่ยงกับพัตต์ที่โอกาส 3 พัตต์สูงจนเสียสโตรก'
        : 'กระสุนเหลือจำกัด ไม่ควรเสี่ยงกับพัตต์ที่โอกาส 3 พัตต์สูง',
      'การเก็บโบกี้ชัวร์ช่วยจำกัดความเสียหายไว้ที่คาดเดาได้'
    );
  }
  // =========================================================================
  // SCENARIO 7: STANDARD ATTACK PAR (สู้พาร์เต็มตัว เมื่อเลือกช็อตลุ้นพาร์)
  // =========================================================================
  else {
    verdict = 'ATTACK_PAR';
    badgeBg = 'bg-emerald-600 text-white border-emerald-400';

    if (isFlightA) {
      verdictTitle = '🔥 สู้พาร์เต็มตัว! (Point Swing สูง ลุยสแครตช์เต็มที่)';
      verdictBadge = 'สู้พาร์สแครตช์';
      if (birdieOpponents.length > 0) {
        primaryAdvice = `คู่แข่งหลุมนี้ออกเบอร์ดี้ไปแล้ว (${birdieOpponents.join(
          ', '
        )}) หากเราเก็บพาร์ได้แต้มจะอยู่ที่ ${pointsIfPar} แต้ม แต่ถ้าพลาดโบกี้แต้มจะรูดไปถึง ${pointsIfBogey} แต้ม! ต้องสู้พาร์เต็มตัวเพื่อหยุดแต้มไหล (💡 หากช็อตนี้ของจุฬาฯ มีโอกาสลุ้นเบอร์ดี้ ให้แตะปุ่ม [🔴 ลุ้นเบอร์ดี้] ด้านบนเพื่อลุยแต้มบวก +${pointsIfBirdie} แต้ม!)`;
      } else {
        primaryAdvice = `พัตต์พาร์ลงจะคว้า ${
          pointsIfPar > 0 ? '+' : ''
        }${pointsIfPar} แต้ม แต่ถ้ายอมโบกี้แต้มจะหล่นไปที่ ${pointsIfBogey} แต้ม ส่วนต่างสูงถึง ${pointSwing} แต้มเต็ม! ในไฟลท์ A เล่นสแครตช์เพียวๆ ไม่มีแต้มต่อ ไม่มีกฎ DQ สู้พาร์ได้เต็มกำลัง`;
      }
      tacticalReasons.push(
        `Point Swing ในหลุมนี้สูงถึง ${pointSwing} แต้มเต็ม (ส่วนต่างระหว่างพาร์กับโบกี้)`,
        'ไฟลท์ A (สแครตช์): เล่น Gross สด ไม่มีแคป ไม่โดนกฎ DQ สู้ได้อย่างมั่นใจ 100%',
        pointsIfDouble === pointsIfBogey
          ? 'หากพัตต์พาร์ไม่ลง แล้วหลุดดับเบิ้ล แต้มยังเท่ากับโบกี้ จึงสามารถพัตต์สู้พาร์ได้เต็มที่ไร้กังวล'
          : 'ตั้งใจคุมน้ำหนักพัตต์พาร์ให้ถึงหลุม'
      );
    } else {
      verdictTitle = '🔥 สู้พาร์เต็มตัว! (Point Swing สูง คุ้มค่าแลกกระสุน)';
      verdictBadge = 'สู้พาร์เต็มตัว';
      if (birdieOpponents.length > 0) {
        primaryAdvice = `คู่แข่งหลุมนี้ออกเบอร์ดี้ไปแล้ว (${birdieOpponents.join(
          ', '
        )}) หากเราเก็บพาร์ได้แต้มจะอยู่ที่ ${pointsIfPar} แต้ม แต่ถ้าพลาดโบกี้แต้มจะรูดไปถึง ${pointsIfBogey} แต้ม! ต้องสู้พาร์เต็มตัวเพื่อหยุดแต้มไหล (💡 หากช็อตนี้ของจุฬาฯ มีโอกาสลุ้นเบอร์ดี้ ให้แตะปุ่ม [🔴 ลุ้นเบอร์ดี้] ด้านบนเพื่อลุยแต้มบวก +${pointsIfBirdie} แต้ม!)`;
      } else {
        primaryAdvice = `คู่แข่งด้านหลังมีโอกาสทำแต้มดี การยอมโบกี้จะทำให้แต้มหล่นไปที่ ${pointsIfBogey} แต้ม แต่ถ้าพัตต์พาร์ลงจะคว้า ${
          pointsIfPar > 0 ? '+' : ''
        }${pointsIfPar} แต้ม ส่วนต่างสูงถึง ${pointSwing} แต้มเต็ม! คุ้มค่ามากที่จะสู้`;
      }
      tacticalReasons.push(
        `Point Swing ในหลุมนี้สูงถึง ${pointSwing} แต้มเต็ม (ส่วนต่างระหว่างพาร์กับโบกี้)`,
        `สถานะกระสุนเหลือ ${intBullets} นัด ปลอดภัย คุ้มค่ามากที่จะใช้กระสุน 1 นัดเพื่อแลกกับแต้มในหลุมนี้`,
        pointsIfDouble === pointsIfBogey
          ? 'หากพัตต์พาร์ไม่ลง แล้วหลุดดับเบิ้ล แต้มยังเท่ากับโบกี้ จึงสามารถพัตต์สู้พาร์ได้เต็มที่ไร้กังวล'
          : 'ตั้งใจคุมน้ำหนักพัตต์พาร์ให้ถึงหลุม'
      );
    }
  }

  // Discrete scenario breakdown (all integer points)
  const scenarioBreakdown: GameTheoryDecisionResult['scenarioBreakdown'] = [];

  if (!hasPendingOpponents) {
    scenarioBreakdown.push({
      scenario: 'คู่แข่งทั้ง 4 คนจบหลุมแล้ว (ทราบผลแน่นอน 100%)',
      probabilityPct: 100,
      chulaEaglePoints: pointsIfEagle,
      chulaBirdiePoints: pointsIfBirdie,
      chulaParPoints: pointsIfPar,
      chulaBogeyPoints: pointsIfBogey,
      netSwing: pointSwing,
    });
  } else {
    // Scenario 1: Likely
    scenarioBreakdown.push({
      scenario: 'กรณี 1: คู่แข่งตีตามการประเมินสด (Most Likely)',
      probabilityPct: 60,
      chulaEaglePoints: pointsIfEagle,
      chulaBirdiePoints: pointsIfBirdie,
      chulaParPoints: pointsIfPar,
      chulaBogeyPoints: pointsIfBogey,
      netSwing: pointSwing,
    });

    // Scenario 2: Opponents Best
    const bestEaglePts = calculateHoleZeroSumPoints({ ...oppScoresBest, chula: 'eagle' }).chula;
    const bestBirdiePts = calculateHoleZeroSumPoints({ ...oppScoresBest, chula: 'birdie' }).chula;
    const bestParPts = calculateHoleZeroSumPoints({ ...oppScoresBest, chula: 'par' }).chula;
    const bestBogeyPts = calculateHoleZeroSumPoints({ ...oppScoresBest, chula: 'bogey' }).chula;
    const bestDoublePts = calculateHoleZeroSumPoints({ ...oppScoresBest, chula: 'double' }).chula;

    let swingScenario2 = bestParPts - bestBogeyPts;
    if (verdict === 'HUNT_EAGLE') swingScenario2 = bestEaglePts - bestBirdiePts;
    else if (verdict === 'HUNT_BIRDIE') swingScenario2 = bestBirdiePts - bestParPts;
    else if (chulaTargetScore === 'bogey') swingScenario2 = bestBogeyPts - bestDoublePts;

    scenarioBreakdown.push({
      scenario: 'กรณี 2: คู่แข่งด้านหลังพัตต์ลงตามเป้าทุกคน (Opponents Best)',
      probabilityPct: 20,
      chulaEaglePoints: bestEaglePts,
      chulaBirdiePoints: bestBirdiePts,
      chulaParPoints: bestParPts,
      chulaBogeyPoints: bestBogeyPts,
      netSwing: swingScenario2,
    });

    // Scenario 3: Opponents Miss
    const missEaglePts = calculateHoleZeroSumPoints({ ...oppScoresMiss, chula: 'eagle' }).chula;
    const missBirdiePts = calculateHoleZeroSumPoints({ ...oppScoresMiss, chula: 'birdie' }).chula;
    const missParPts = calculateHoleZeroSumPoints({ ...oppScoresMiss, chula: 'par' }).chula;
    const missBogeyPts = calculateHoleZeroSumPoints({ ...oppScoresMiss, chula: 'bogey' }).chula;
    const missDoublePts = calculateHoleZeroSumPoints({ ...oppScoresMiss, chula: 'double' }).chula;

    let swingScenario3 = missParPts - missBogeyPts;
    if (verdict === 'HUNT_EAGLE') swingScenario3 = missEaglePts - missBirdiePts;
    else if (verdict === 'HUNT_BIRDIE') swingScenario3 = missBirdiePts - missParPts;
    else if (chulaTargetScore === 'bogey') swingScenario3 = missBogeyPts - missDoublePts;

    scenarioBreakdown.push({
      scenario: 'กรณี 3: คู่แข่งด้านหลังพลาดทุกลูก (+1 สโตรก) (Opponents Miss)',
      probabilityPct: 20,
      chulaEaglePoints: missEaglePts,
      chulaBirdiePoints: missBirdiePts,
      chulaParPoints: missParPts,
      chulaBogeyPoints: missBogeyPts,
      netSwing: swingScenario3,
    });
  }

  return {
    verdict,
    verdictTitle,
    verdictBadge,
    badgeBg,
    primaryAdvice,
    pointSwing,
    expectedPointsIfEagle: pointsIfEagle,
    expectedPointsIfBirdie: pointsIfBirdie,
    expectedPointsIfPar: pointsIfPar,
    expectedPointsIfBogey: pointsIfBogey,
    expectedPointsIfDouble: pointsIfDouble,
    bulletCostIfPar: isFlightA ? 0 : 1,
    bulletRefundIfBogey: 0,
    bulletStatus,
    chulaBulletsRemaining: intBullets,
    tacticalReasons,
    scenarioBreakdown,
  };
}
