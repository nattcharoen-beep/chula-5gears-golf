import { ScoreType, UniversityId, UNIVERSITIES } from '../types/golf';

export const SCORE_VALUES: Record<ScoreType, number> = {
  eagle: -2,
  birdie: -1,
  par: 0,
  bogey: 1,
  double: 2,
};

export const SCORE_LABELS: Record<ScoreType, { th: string; short: string; badge: string }> = {
  eagle: { th: 'อีเกิ้ล', short: '-2', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  birdie: { th: 'เบอร์ดี้', short: 'ดี้ (-1)', badge: 'bg-red-500/20 text-red-400 border-red-500/40' },
  par: { th: 'พาร์', short: 'พาร์ (E)', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  bogey: { th: 'โบกี้', short: 'กี้ (+1)', badge: 'bg-slate-600/30 text-slate-300 border-slate-500/40' },
  double: { th: 'ดับเบิ้ล', short: 'ดับเบิ้ล (+2)', badge: 'bg-amber-600/30 text-amber-300 border-amber-500/40' },
};

export function calculateHoleZeroSumPoints(
  scores: Record<UniversityId, ScoreType | null>
): Record<UniversityId, number> {
  const universities = Object.keys(UNIVERSITIES) as UniversityId[];
  const points: Record<UniversityId, number> = {
    chula: 0,
    kasetsart: 0,
    cmu: 0,
    kku: 0,
    psu: 0,
  };

  for (let i = 0; i < universities.length; i++) {
    const u1 = universities[i];
    const s1 = scores[u1];
    if (s1 === null) continue;

    for (let j = i + 1; j < universities.length; j++) {
      const u2 = universities[j];
      const s2 = scores[u2];
      if (s2 === null) continue;

      const val1 = SCORE_VALUES[s1];
      const val2 = SCORE_VALUES[s2];

      if (val1 < val2) {
        points[u1] += 1;
        points[u2] -= 1;
      } else if (val1 > val2) {
        points[u1] -= 1;
        points[u2] += 1;
      }
    }
  }

  return points;
}

export function calculateUniversityTournamentPoints(
  playerSummaries: {
    universityId: UniversityId;
    totalZeroSumPoints: number;
    isDq: boolean;
  }[]
): Record<UniversityId, { rank: number; rankDisplay: string; universityPoints: number }> {
  const result: Record<UniversityId, { rank: number; rankDisplay: string; universityPoints: number }> = {
    chula: { rank: 5, rankDisplay: '5', universityPoints: 1 },
    kasetsart: { rank: 5, rankDisplay: '5', universityPoints: 1 },
    cmu: { rank: 5, rankDisplay: '5', universityPoints: 1 },
    kku: { rank: 5, rankDisplay: '5', universityPoints: 1 },
    psu: { rank: 5, rankDisplay: '5', universityPoints: 1 },
  };

  const validPlayers = playerSummaries
    .filter((p) => !p.isDq)
    .sort((a, b) => b.totalZeroSumPoints - a.totalZeroSumPoints);

  const dqPlayers = playerSummaries.filter((p) => p.isDq);

  for (const dq of dqPlayers) {
    result[dq.universityId] = {
      rank: 5,
      rankDisplay: 'DQ (ปรับแพ้)',
      universityPoints: 0,
    };
  }

  const standardPoints = [5, 4, 3, 2, 1];
  let currentRankIndex = 0;
  let i = 0;

  while (i < validPlayers.length) {
    let j = i + 1;
    while (
      j < validPlayers.length &&
      validPlayers[j].totalZeroSumPoints === validPlayers[i].totalZeroSumPoints
    ) {
      j++;
    }

    const tieCount = j - i;
    let sumPts = 0;
    for (let r = currentRankIndex; r < currentRankIndex + tieCount; r++) {
      sumPts += standardPoints[r] ?? 1;
    }
    const avgPts = sumPts / tieCount;
    const rankNum = currentRankIndex + 1;
    const rankLabel = tieCount > 1 ? `T${rankNum}` : `${rankNum}`;

    for (let k = i; k < j; k++) {
      result[validPlayers[k].universityId] = {
        rank: rankNum,
        rankDisplay: rankLabel,
        universityPoints: Number(avgPts.toFixed(1)),
      };
    }

    currentRankIndex += tieCount;
    i = j;
  }

  return result;
}
