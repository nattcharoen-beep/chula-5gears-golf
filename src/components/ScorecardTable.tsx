import React, { useState } from 'react';
import {
  HoleConfig,
  ScoreType,
  UniversityId,
  UNIVERSITIES,
} from '../types/golf';
import { calculateHoleZeroSumPoints, SCORE_VALUES } from '../utils/zeroSumEngine';

interface ScorecardTableProps {
  holes: HoleConfig[];
  scores: Record<UniversityId, (ScoreType | null)[]>;
  onUpdateScore: (universityId: UniversityId, holeIndex: number, score: ScoreType | null) => void;
  currentHole: number;
  onSelectHole: (hole: number) => void;
}

export const ScorecardTable: React.FC<ScorecardTableProps> = ({
  holes,
  scores,
  onUpdateScore,
  currentHole,
  onSelectHole,
}) => {
  const [activeTab, setActiveTab] = useState<'front9' | 'back9' | 'all'>('all');
  const universities = Object.keys(UNIVERSITIES) as UniversityId[];

  const holePoints: Record<UniversityId, number>[] = holes.map((_, hIdx) => {
    const holeScores: Record<UniversityId, ScoreType | null> = {
      chula: scores.chula[hIdx],
      kasetsart: scores.kasetsart[hIdx],
      cmu: scores.cmu[hIdx],
      kku: scores.kku[hIdx],
      psu: scores.psu[hIdx],
    };
    return calculateHoleZeroSumPoints(holeScores);
  });

  const totalPoints: Record<UniversityId, number> = {
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

  for (let hIdx = 0; hIdx < holes.length; hIdx++) {
    for (const u of universities) {
      totalPoints[u] += holePoints[hIdx][u];
      const sc = scores[u][hIdx];
      if (sc !== null) {
        totalGross[u] += holes[hIdx].par + SCORE_VALUES[sc];
      }
    }
  }

  const displayedHoles =
    activeTab === 'front9'
      ? holes.slice(0, 9)
      : activeTab === 'back9'
      ? holes.slice(9, 18)
      : holes;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-base">📋</span> สกอร์การ์ด 18 หลุม (Zero-Sum Match Play)
          </h3>
          <p className="text-xs text-slate-400">
            แต้มรายหลุมคำนวณแบบ Head-to-Head รอบวง (-4 ถึง +4 แต้ม, ผลรวมทั้งก๊วน = 0 เสมอ)
          </p>
        </div>

        <div className="flex p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              activeTab === 'all'
                ? 'bg-pink-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ครบ 18 หลุม
          </button>
          <button
            onClick={() => setActiveTab('front9')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              activeTab === 'front9'
                ? 'bg-pink-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            หลุม 1 - 9
          </button>
          <button
            onClick={() => setActiveTab('back9')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              activeTab === 'back9'
                ? 'bg-pink-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            หลุม 10 - 18
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <th className="p-2.5 text-left sticky left-0 z-10 bg-slate-950 min-w-[120px]">
                สถาบัน
              </th>
              {displayedHoles.map((h) => (
                <th
                  key={h.holeNumber}
                  onClick={() => onSelectHole(h.holeNumber)}
                  className={`p-2 min-w-[48px] cursor-pointer transition hover:bg-slate-800/60 ${
                    currentHole === h.holeNumber ? 'bg-pink-950/40 text-pink-400 font-black' : ''
                  }`}
                >
                  <div>H{h.holeNumber}</div>
                  <div className="text-[10px] text-slate-500 font-normal">P{h.par}</div>
                </th>
              ))}
              <th className="p-2.5 bg-slate-950 min-w-[70px] text-pink-400 font-bold">
                แต้มรวม
              </th>
              <th className="p-2.5 bg-slate-950 min-w-[60px] text-slate-400 font-normal">
                Gross
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {universities.map((u) => {
              const uInfo = UNIVERSITIES[u];
              const isChula = u === 'chula';
              return (
                <tr
                  key={u}
                  className={`transition ${
                    isChula
                      ? 'bg-pink-950/20 font-semibold'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <td
                    className={`p-2.5 text-left sticky left-0 z-10 flex items-center gap-1.5 ${
                      isChula ? 'bg-slate-900 text-pink-300 font-bold' : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    <span>{uInfo.flagEmoji}</span>
                    <span>{uInfo.badge}</span>
                  </td>

                  {displayedHoles.map((h) => {
                    const hIdx = h.holeNumber - 1;
                    const sc = scores[u][hIdx];
                    const pts = holePoints[hIdx][u];
                    const isCurrent = currentHole === h.holeNumber;

                    return (
                      <td
                        key={h.holeNumber}
                        className={`p-1 border-r border-slate-800/40 ${
                          isCurrent ? 'bg-pink-950/30' : ''
                        }`}
                      >
                        <select
                          value={sc ?? ''}
                          onChange={(e) =>
                            onUpdateScore(
                              u,
                              hIdx,
                              e.target.value === '' ? null : (e.target.value as ScoreType)
                            )
                          }
                          style={{ colorScheme: 'dark' }}
                          className={`w-full py-1 text-center rounded text-[11px] font-black focus:outline-none transition border cursor-pointer ${
                            sc === 'birdie'
                              ? 'bg-red-950 text-red-300 border-red-500/70'
                              : sc === 'par'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/70'
                              : sc === 'bogey'
                              ? 'bg-slate-800 text-white border-slate-600'
                              : sc === 'double'
                              ? 'bg-amber-950 text-amber-300 border-amber-500/70'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <option value="" className="bg-slate-900 text-slate-400">-</option>
                          <option value="birdie" className="bg-slate-900 text-red-400 font-bold">ดี้ (-1)</option>
                          <option value="par" className="bg-slate-900 text-emerald-400 font-bold">พาร์ (E)</option>
                          <option value="bogey" className="bg-slate-900 text-white font-bold">กี้ (+1)</option>
                          <option value="double" className="bg-slate-900 text-amber-400 font-bold">ดับ (+2)</option>
                        </select>

                        {sc !== null && (
                          <div
                            className={`text-[10px] font-black mt-0.5 ${
                              pts > 0
                                ? 'text-emerald-400'
                                : pts < 0
                                ? 'text-red-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {pts > 0 ? `+${pts}` : pts}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  <td className="p-2.5 font-black text-sm">
                    <span
                      className={`px-2 py-1 rounded-md ${
                        totalPoints[u] > 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : totalPoints[u] < 0
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {totalPoints[u] > 0 ? `+${totalPoints[u]}` : totalPoints[u]}
                    </span>
                  </td>

                  <td className="p-2.5 font-semibold text-slate-300">
                    {totalGross[u] > 0 ? totalGross[u] : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
