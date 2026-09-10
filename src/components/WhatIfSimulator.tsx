import React, { useState } from 'react';
import { HoleConfig, ScoreType, UniversityId } from '../types/golf';
import { Sparkles, ShieldCheck, AlertOctagon } from 'lucide-react';
import { SCORE_VALUES } from '../utils/zeroSumEngine';

interface WhatIfSimulatorProps {
  holes: HoleConfig[];
  scores: Record<UniversityId, (ScoreType | null)[]>;
  handicap: number;
  flight: string;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  holes,
  scores,
  handicap,
  flight,
}) => {
  const finalHoleIndices = [14, 15, 16, 17];
  const [selectedStrategy, setSelectedStrategy] = useState<'safe_bogey' | 'aggressive_par' | 'balanced'>('safe_bogey');

  const coursePar = holes.reduce((acc, h) => acc + h.par, 0);
  const minAllowedGross = coursePar + handicap - 4;

  let grossThrough14 = 0;
  for (let i = 0; i < 14; i++) {
    const sc = scores.chula[i];
    if (sc !== null) {
      grossThrough14 += holes[i].par + SCORE_VALUES[sc];
    } else {
      grossThrough14 += holes[i].par + 1;
    }
  }

  const calculateSim = (strat: 'safe_bogey' | 'aggressive_par' | 'balanced') => {
    let extraStrokes = 0;
    let expectedHolePtsGain = 0;

    finalHoleIndices.forEach((hIdx, i) => {
      const p = holes[hIdx].par;
      if (strat === 'safe_bogey') {
        extraStrokes += p + 1;
        expectedHolePtsGain += 0;
      } else if (strat === 'aggressive_par') {
        extraStrokes += p;
        expectedHolePtsGain += 2.5;
      } else {
        extraStrokes += i % 2 === 0 ? p : p + 1;
        expectedHolePtsGain += i % 2 === 0 ? 2.5 : 0;
      }
    });

    const projectedGross = grossThrough14 + extraStrokes;
    const isDq = flight !== 'A' && projectedGross < minAllowedGross;
    const cushion = projectedGross - minAllowedGross;

    return {
      projectedGross,
      isDq,
      cushion,
      expectedHolePtsGain: Math.round(expectedHolePtsGain),
    };
  };

  const simSafe = calculateSim('safe_bogey');
  const simBalanced = calculateSim('balanced');
  const simAggressive = calculateSim('aggressive_par');

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            เครื่องมือจำลองฉากทัศน์ช่วงท้ายรอบ (What-If Endgame Simulator)
          </h3>
          <p className="text-xs text-slate-400">
            วิเคราะห์ 4 หลุมสุดท้าย (หลุม 15 - 18) เลือกระหว่าง เล่นเซฟโบกี้ vs เล่นบุกพาร์ vs ผสมผสาน
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          onClick={() => setSelectedStrategy('safe_bogey')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            selectedStrategy === 'safe_bogey'
              ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-900/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              กลยุทธ์ A: เซฟโบกี้ล้วน
            </span>
            <span className="text-xs">🛡️</span>
          </div>
          <div className="text-sm font-bold text-white mb-1">
            ออกโบกี้ทั้ง 4 หลุมท้าย
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            ไม่เสี่ยงออกดับเบิ้ล รักษากระสุนแคป 100% ไม่เสี่ยงโดน DQ แน่นอน
          </p>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Gross จบประมาณ:</span>
              <span className="font-bold text-white">{simSafe.projectedGross}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">สถานะ DQ:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ปลอดภัย (ห่างเกณฑ์ +{simSafe.cushion})
              </span>
            </div>
          </div>
        </div>

        <div
          onClick={() => setSelectedStrategy('balanced')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            selectedStrategy === 'balanced'
              ? 'bg-pink-950/40 border-pink-500 shadow-md shadow-pink-900/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
              กลยุทธ์ B: สมดุลย์ (2 พาร์ 2 กี้)
            </span>
            <span className="text-xs">⚖️</span>
          </div>
          <div className="text-sm font-bold text-white mb-1">
            บุกเฉพาะหลุมที่คู่แข่งสูสี
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            เลือกยิงพาร์ 2 หลุมที่แต้มสูสี และปล่อยกี้ 2 หลุมยากเพื่อเซฟแคป
          </p>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Gross จบประมาณ:</span>
              <span className="font-bold text-white">{simBalanced.projectedGross}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">สถานะ DQ:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  simBalanced.isDq ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {simBalanced.isDq ? (
                  <AlertOctagon className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                {simBalanced.isDq
                  ? 'อันตราย DQ!'
                  : `ปลอดภัย (ห่างเกณฑ์ +${simBalanced.cushion})`}
              </span>
            </div>
          </div>
        </div>

        <div
          onClick={() => setSelectedStrategy('aggressive_par')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            selectedStrategy === 'aggressive_par'
              ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-900/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              กลยุทธ์ C: บุกยิงพาร์ทุกหลุม
            </span>
            <span className="text-xs">🔥</span>
          </div>
          <div className="text-sm font-bold text-white mb-1">
            ยิงพาร์ทั้ง 4 หลุมท้าย
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            กวาดแต้ม Zero-sum สูงสุด แต่เผากระสุนแคปจนอาจแตะเพดาน DQ
          </p>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Gross จบประมาณ:</span>
              <span className="font-bold text-white">{simAggressive.projectedGross}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">สถานะ DQ:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  simAggressive.isDq ? 'text-red-400' : 'text-amber-400'
                }`}
              >
                {simAggressive.isDq ? (
                  <AlertOctagon className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                {simAggressive.isDq
                  ? 'DQ ทันที (ได้ 0 แต้ม!)'
                  : `เสี่ยงมาก (เหลือ +${simAggressive.cushion})`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
