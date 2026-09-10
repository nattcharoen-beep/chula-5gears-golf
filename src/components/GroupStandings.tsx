import React from 'react';
import { Flight, HoleConfig, ScoreType, UniversityId, UNIVERSITIES } from '../types/golf';
import { calculateHoleZeroSumPoints, calculateUniversityTournamentPoints } from '../utils/zeroSumEngine';
import { Trophy, AlertOctagon } from 'lucide-react';

interface GroupStandingsProps {
  holes: HoleConfig[];
  scores: Record<UniversityId, (ScoreType | null)[]>;
  flight: Flight;
  handicap: number;
}

export const GroupStandings: React.FC<GroupStandingsProps> = ({
  holes,
  scores,
  flight,
  handicap,
}) => {
  const universities = Object.keys(UNIVERSITIES) as UniversityId[];

  const totalZeroSum: Record<UniversityId, number> = {
    chula: 0,
    kasetsart: 0,
    cmu: 0,
    kku: 0,
    psu: 0,
  };

  const totalGross: Record<UniversityId, number> = {
    chula: 0,
    kasetsart: 0,
    cmu: 0,
    kku: 0,
    psu: 0,
  };

  let chulaHolesPlayed = 0;

  for (let hIdx = 0; hIdx < holes.length; hIdx++) {
    const holeScores: Record<UniversityId, ScoreType | null> = {
      chula: scores.chula[hIdx],
      kasetsart: scores.kasetsart[hIdx],
      cmu: scores.cmu[hIdx],
      kku: scores.kku[hIdx],
      psu: scores.psu[hIdx],
    };
    const pts = calculateHoleZeroSumPoints(holeScores);
    for (const u of universities) {
      totalZeroSum[u] += pts[u];
      const sc = scores[u][hIdx];
      if (sc !== null) {
        if (sc === 'eagle') totalGross[u] += holes[hIdx].par - 2;
        else if (sc === 'birdie') totalGross[u] += holes[hIdx].par - 1;
        else if (sc === 'par') totalGross[u] += holes[hIdx].par;
        else if (sc === 'bogey') totalGross[u] += holes[hIdx].par + 1;
        else if (sc === 'double') totalGross[u] += holes[hIdx].par + 2;

        if (u === 'chula') chulaHolesPlayed++;
      }
    }
  }

  const coursePar = holes.reduce((acc, h) => acc + h.par, 0);
  const chulaNet = totalGross.chula - handicap;
  const isChulaDq =
    flight !== 'A' &&
    chulaHolesPlayed === 18 &&
    chulaNet < coursePar - 4;

  const playerSummaries = universities.map((u) => ({
    universityId: u,
    totalZeroSumPoints: totalZeroSum[u],
    isDq: u === 'chula' ? isChulaDq : false,
  }));

  const standings = calculateUniversityTournamentPoints(playerSummaries);

  const sorted = [...universities].sort((a, b) => {
    return standings[b].universityPoints - standings[a].universityPoints;
  });

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            ตารางสรุปคะแนนก๊วน & แต้มสะสมเข้าสถาบัน (5, 4, 3, 2, 1 แต้ม)
          </h3>
          <p className="text-xs text-slate-400">
            สถาบันที่ได้แต้มรวมสูงสุดในก๊วนได้ 5 แต้ม เสมอหารเฉลี่ย • DQ ได้ 0 แต้ม
          </p>
        </div>

        <div className="text-xs text-slate-400">
          แข่งจบครบ 18 หลุม นำคะแนนไปรวมกับอีก 28 ก๊วน
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {sorted.map((u) => {
          const uInfo = UNIVERSITIES[u];
          const st = standings[u];
          const isChula = u === 'chula';
          const isDq = isChula && isChulaDq;

          return (
            <div
              key={u}
              className={`p-3.5 rounded-xl border relative transition ${
                isDq
                  ? 'bg-red-950/40 border-red-500/60'
                  : isChula
                  ? 'bg-gradient-to-b from-pink-950/40 to-slate-900 border-pink-500 shadow-lg shadow-pink-900/20'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    st.rank === 1
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : st.rank === 2
                      ? 'bg-slate-300/20 text-slate-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDq ? 'DQ' : `อันดับ ${st.rankDisplay}`}
                </span>

                <span className="text-lg">{uInfo.flagEmoji}</span>
              </div>

              <div className="mb-3">
                <div className={`text-xs font-bold ${uInfo.textColor}`}>{uInfo.badge}</div>
                <div className="text-xs text-slate-300 truncate">{uInfo.name}</div>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 text-center mb-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  คะแนนเข้าสถาบัน
                </div>
                <div
                  className={`text-2xl font-black ${
                    isDq
                      ? 'text-red-500'
                      : isChula
                      ? 'text-pink-400'
                      : 'text-white'
                  }`}
                >
                  {st.universityPoints}
                  <span className="text-xs font-normal text-slate-400 ml-1">แต้ม</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>แต้มสะสม Zero-Sum:</span>
                <span
                  className={`font-bold ${
                    totalZeroSum[u] > 0
                      ? 'text-emerald-400'
                      : totalZeroSum[u] < 0
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }`}
                >
                  {totalZeroSum[u] > 0 ? `+${totalZeroSum[u]}` : totalZeroSum[u]}
                </span>
              </div>

              {isDq && (
                <div className="mt-2 text-[10px] text-red-400 bg-red-900/30 p-1.5 rounded border border-red-800/40 flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3 text-red-400 shrink-0" />
                  Net &lt; -4 Under Par ปรับเป็น 0 แต้ม!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
