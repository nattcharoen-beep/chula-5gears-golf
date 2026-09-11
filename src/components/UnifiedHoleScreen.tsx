import React, { useState, useEffect } from 'react';
import {
  HoleConfig,
  ScoreType,
  UniversityId,
  UNIVERSITIES,
  Flight,
  OpponentLiveState,
} from '../types/golf';
import { evaluatePuttingDecision } from '../utils/gameTheoryEngine';
import { BulletStatus } from '../utils/bulletManager';
import { isOverDouble, OVER_DOUBLE_OPTIONS, SCORE_LABELS, SCORE_VALUES } from '../utils/zeroSumEngine';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Shield,
  Target,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

interface UnifiedHoleScreenProps {
  currentHole: number;
  onSelectHole: (h: number) => void;
  holes: HoleConfig[];
  scores: Record<UniversityId, (ScoreType | null)[]>;
  onUpdateScore: (u: UniversityId, hIdx: number, s: ScoreType | null) => void;
  bulletStatus: BulletStatus;
  flight: Flight;
  opponentsLive: OpponentLiveState[];
  onUpdateOpponent: (holeNum: number, uId: UniversityId, patch: Partial<OpponentLiveState>) => void;
}

export const UnifiedHoleScreen: React.FC<UnifiedHoleScreenProps> = ({
  currentHole,
  onSelectHole,
  holes,
  scores,
  onUpdateScore,
  bulletStatus,
  flight,
  opponentsLive,
  onUpdateOpponent,
}) => {
  const hIdx = currentHole - 1;
  const currentHoleConfig = holes[hIdx];
  const par = currentHoleConfig.par;

  // Chula's target score & putt condition
  const [chulaTargetScore, setChulaTargetScore] = useState<ScoreType>('par');
  const [chulaPuttDifficulty, setChulaPuttDifficulty] = useState<
    'easy_tap_in' | 'medium_6_10ft' | 'difficult_downhill'
  >('medium_6_10ft');

  // Open over-double score picker drawers
  const [openOverDoubleOpp, setOpenOverDoubleOpp] = useState<Record<UniversityId, boolean>>({
    chula: false,
    kasetsart: false,
    cmu: false,
    kku: false,
    psu: false,
  });
  const [openOverDoubleChula, setOpenOverDoubleChula] = useState<boolean>(false);

  // Reset Chula's putt target & difficulty on hole navigation so state from previous hole does not bleed over
  useEffect(() => {
    setChulaTargetScore('par');
    setChulaPuttDifficulty('medium_6_10ft');
    setOpenOverDoubleChula(false);
    setOpenOverDoubleOpp({
      chula: false,
      kasetsart: false,
      cmu: false,
      kku: false,
      psu: false,
    });
  }, [currentHole]);

  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  // Run Game Theory Decision Engine (strictly integers, no decimals!)
  const decision = evaluatePuttingDecision(
    bulletStatus.bulletsRemaining,
    flight,
    chulaPuttDifficulty,
    opponentsLive,
    chulaTargetScore
  );

  // Quick save Chula's confirmed score for this hole
  const chulaCurrentScore = scores.chula[hIdx];
  const handleSetChulaScore = (sc: ScoreType) => {
    onUpdateScore('chula', hIdx, sc);
  };

  // Shot helper for "คนที่ตีหลังเรา"
  const shotOptions: { shotNum: number; target: ScoreType; label: string; scoreName: string }[] = [
    ...(par >= 5 ? [{ shotNum: par - 2, target: 'eagle' as ScoreType, label: `ช็อต ${par - 2}`, scoreName: 'อีเกิ้ล (-2)' }] : []),
    { shotNum: par - 1, target: 'birdie', label: `ช็อต ${par - 1}`, scoreName: 'ดี้ (-1)' },
    { shotNum: par, target: 'par', label: `ช็อต ${par}`, scoreName: 'พาร์ (E)' },
    { shotNum: par + 1, target: 'bogey', label: `ช็อต ${par + 1}`, scoreName: 'กี้ (+1)' },
    { shotNum: par + 2, target: 'double', label: `ช็อต ${par + 2}`, scoreName: 'ดับ (+2)' },
    { shotNum: par + 3, target: 'triple', label: `ช็อต ${par + 3}+`, scoreName: 'เกินดับ (+3+)' },
  ];

  return (
    <div className="space-y-3.5 pb-8 max-w-2xl mx-auto">
      {/* 1. HOLE NAVIGATOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-lg">
        <button
          type="button"
          onClick={() => onSelectHole(Math.max(1, currentHole - 1))}
          disabled={currentHole === 1}
          className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white font-bold flex items-center justify-center transition active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-black text-white">หลุม {currentHole}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
              Par {currentHoleConfig.par}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            แต้มต่อประจำหลุม (Index): {currentHoleConfig.handicapIndex}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectHole(Math.min(18, currentHole + 1))}
          disabled={currentHole === 18}
          className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white font-bold flex items-center justify-center transition active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* 2. STEP 1: OPPONENTS STATUS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            1. ใส่สถานะคู่แข่ง 4 สถาบัน (หลุม {currentHole})
          </h3>
          <span className="text-[11px] text-slate-400">กดจบแล้ว หรือ ตีหลังเรา</span>
        </div>

        <div className="space-y-3">
          {opponentsLive.map((opp) => {
            const uInfo = UNIVERSITIES[opp.universityId];
            return (
              <div
                key={opp.universityId}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{uInfo.flagEmoji}</span>
                    <span className={`text-xs font-bold ${uInfo.textColor}`}>
                      {uInfo.name} ({uInfo.badge})
                    </span>
                  </div>

                  <div className="flex p-0.5 bg-slate-900 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => onUpdateOpponent(currentHole, opp.universityId, { isFinished: true })}
                      className={`px-3 py-1 rounded-md font-bold transition ${
                        opp.isFinished
                          ? 'bg-slate-800 text-white shadow'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      ✓ จบแล้ว
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateOpponent(currentHole, opp.universityId, { isFinished: false })}
                      className={`px-3 py-1 rounded-md font-bold transition ${
                        !opp.isFinished
                          ? 'bg-pink-600/30 text-pink-300 border border-pink-500/40 shadow'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      ⏳ ตีหลังเรา
                    </button>
                  </div>
                </div>

                {opp.isFinished ? (
                  /* Option A: จบแล้ว */
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-5 gap-1">
                      {(['eagle', 'birdie', 'par', 'bogey', 'double'] as ScoreType[]).map((sc) => (
                        <button
                          key={sc}
                          type="button"
                          onClick={() => {
                            onUpdateOpponent(currentHole, opp.universityId, { finishedScore: sc });
                            setOpenOverDoubleOpp((prev) => ({ ...prev, [opp.universityId]: false }));
                          }}
                          className={`py-2 rounded-lg text-xs font-black transition active:scale-95 ${
                            opp.finishedScore === sc
                              ? sc === 'eagle'
                                ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-white'
                                : sc === 'birdie'
                                ? 'bg-red-600 text-white shadow-md ring-1 ring-white'
                                : sc === 'par'
                                ? 'bg-emerald-600 text-white shadow-md ring-1 ring-white'
                                : sc === 'bogey'
                                ? 'bg-slate-600 text-white shadow-md ring-1 ring-white'
                                : 'bg-amber-600 text-white shadow-md ring-1 ring-white'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {sc === 'eagle' ? 'อีเกิ้ล (-2)' : sc === 'birdie' ? 'ดี้ (-1)' : sc === 'par' ? 'พาร์ (E)' : sc === 'bogey' ? 'กี้ (+1)' : 'ดับ (+2)'}
                        </button>
                      ))}
                    </div>

                    {/* ปุ่มระบุสกอร์หากออกเกิน Double */}
                    <button
                      type="button"
                      onClick={() =>
                        setOpenOverDoubleOpp((prev) => ({
                          ...prev,
                          [opp.universityId]: !prev[opp.universityId],
                        }))
                      }
                      className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-between border active:scale-[0.99] ${
                        isOverDouble(opp.finishedScore)
                          ? 'bg-purple-950/90 border-purple-500 text-purple-200 shadow-md ring-1 ring-purple-400'
                          : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-purple-400 font-black">🟣 เกินดับเบิ้ล</span>
                        <span className="text-[11px] text-slate-300">
                          {isOverDouble(opp.finishedScore)
                            ? `(เลือกแล้ว: ${SCORE_LABELS[opp.finishedScore].th} +${SCORE_VALUES[opp.finishedScore]} / ออก ${par + SCORE_VALUES[opp.finishedScore]} สโตรก)`
                            : '(กดระบุว่าออกเท่าไหร่: +3, +4, +5...)'}
                        </span>
                      </span>
                      <span className="text-[10px] text-purple-400 font-bold">
                        {openOverDoubleOpp[opp.universityId] || isOverDouble(opp.finishedScore)
                          ? '▲ ซ่อน'
                          : '▼ กดระบุคะแนน'}
                      </span>
                    </button>

                    {/* เมนูกดระบุสกอร์ที่เกินดับเบิ้ล */}
                    {(openOverDoubleOpp[opp.universityId] || isOverDouble(opp.finishedScore)) && (
                      <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-950 rounded-xl border border-purple-500/40">
                        {OVER_DOUBLE_OPTIONS.map((opt) => {
                          const isSelected = opp.finishedScore === opt.type;
                          return (
                            <button
                              key={opt.type}
                              type="button"
                              onClick={() =>
                                onUpdateOpponent(currentHole, opp.universityId, { finishedScore: opt.type })
                              }
                              className={`py-1.5 px-1 rounded-lg text-center transition active:scale-95 flex flex-col items-center justify-center border ${
                                isSelected
                                  ? 'bg-purple-600 text-white font-black border-purple-300 shadow-md ring-1 ring-white'
                                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
                              }`}
                            >
                              <span className="text-xs font-black">+{opt.delta}</span>
                              <span className="text-[10px] font-bold">{opt.name}</span>
                              <span className="text-[9px] opacity-75">ออก {par + opt.delta}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Option B: ตีหลังเรา -> เลือกช็อตที่กำลังตี + โอกาสลง */
                  <div className="space-y-2 pt-1 border-t border-slate-900">
                    {/* กำลังจะตีช็อตที่เท่าไหร่ */}
                    <div>
                      <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
                        <span>กำลังจะตีช็อตที่ (ลุ้นสกอร์):</span>
                        <span className="text-pink-400 font-bold">
                          {opp.pendingTargetScore.toUpperCase()}
                        </span>
                      </div>
                      <div className={`grid ${par >= 5 ? 'grid-cols-6' : 'grid-cols-5'} gap-1`}>
                        {shotOptions.map((opt) => {
                          const isSelected = opp.pendingTargetScore === opt.target;
                          return (
                            <button
                              key={opt.target}
                              type="button"
                              onClick={() =>
                                onUpdateOpponent(currentHole, opp.universityId, {
                                  pendingTargetScore: opt.target,
                                  currentShotNumber: opt.shotNum,
                                })
                              }
                              className={`py-1.5 px-0.5 rounded-lg text-center transition active:scale-95 flex flex-col items-center justify-center ${
                                isSelected
                                  ? opt.target === 'eagle'
                                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-white'
                                    : opt.target === 'birdie'
                                    ? 'bg-red-600 text-white shadow-md ring-1 ring-white'
                                    : opt.target === 'par'
                                    ? 'bg-emerald-600 text-white shadow-md ring-1 ring-white'
                                    : opt.target === 'bogey'
                                    ? 'bg-slate-600 text-white shadow-md ring-1 ring-white'
                                    : opt.target === 'double'
                                    ? 'bg-amber-600 text-white shadow-md ring-1 ring-white'
                                    : 'bg-purple-600 text-white shadow-md ring-1 ring-white'
                                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                              }`}
                            >
                              <span className="text-[10px] font-bold">{opt.label}</span>
                              <span className="text-[8px] opacity-80 leading-tight">{opt.scoreName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* โอกาสลงเยอะมั้ย */}
                    <div>
                      <div className="text-[10px] text-slate-400 mb-1">
                        โอกาสพัตต์ลงเยอะมั้ย:
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateOpponent(currentHole, opp.universityId, { makeProbabilityPct: 90 })
                          }
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition active:scale-95 ${
                            opp.makeProbabilityPct >= 80
                              ? 'bg-emerald-600 text-white border border-emerald-400 shadow-md'
                              : 'bg-slate-900 text-slate-500 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          🟢 จ่อใกล้ (90%)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateOpponent(currentHole, opp.universityId, { makeProbabilityPct: 60 })
                          }
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition active:scale-95 ${
                            opp.makeProbabilityPct >= 50 && opp.makeProbabilityPct < 80
                              ? 'bg-amber-600 text-white border border-amber-400 shadow-md'
                              : 'bg-slate-900 text-slate-500 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          🟡 ระยะกลาง (60%)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateOpponent(currentHole, opp.universityId, { makeProbabilityPct: 25 })
                          }
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition active:scale-95 ${
                            opp.makeProbabilityPct < 50
                              ? 'bg-red-600 text-white border border-red-400 shadow-md'
                              : 'bg-slate-900 text-slate-500 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          🔴 ไกล/ยาก (25%)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. STEP 2: CHULA PUTT SETUP & DIFFICULTY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            2. พัตต์ของทีมจุฬาฯ (หลุม {currentHole})
          </h3>
          <span className="text-[11px] text-slate-400">เลือกลุ้นสกอร์ / ระยะพัตต์</span>
        </div>

        {/* 2.1 ช็อตนี้ของจุฬาฯ กำลังลุ้นสกอร์อะไร */}
        <div>
          <div className="text-[10px] text-slate-400 mb-1.5 flex items-center justify-between">
            <span>ช็อตพัตต์นี้กำลังลุ้น:</span>
            <span className="text-pink-400 font-bold">
              {chulaTargetScore === 'eagle'
                ? `ช็อต ${Math.max(1, par - 2)} (ลุ้นอีเกิ้ล)`
                : chulaTargetScore === 'birdie'
                ? `ช็อต ${par - 1} (ลุ้นเบอร์ดี้)`
                : chulaTargetScore === 'par'
                ? `ช็อต ${par} (ลุ้นพาร์)`
                : chulaTargetScore === 'bogey'
                ? `ช็อต ${par + 1} (ลุ้นโบกี้)`
                : `ช็อต ${par + 2} (ลุ้นดับเบิ้ล)`}
            </span>
          </div>
          <div className={`grid ${par === 5 ? 'grid-cols-5' : 'grid-cols-4'} gap-1.5`}>
            {par === 5 && (
              <button
                type="button"
                onClick={() => setChulaTargetScore('eagle')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center active:scale-95 flex flex-col items-center justify-center ${
                  chulaTargetScore === 'eagle'
                    ? 'bg-amber-500 text-slate-950 shadow-lg ring-2 ring-amber-300'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span className="text-xs font-black">🦅 อีเกิ้ล</span>
                <span className="text-[9px] opacity-80">(-2) ช็อต {Math.max(1, par - 2)}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setChulaTargetScore('birdie')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center active:scale-95 flex flex-col items-center justify-center ${
                chulaTargetScore === 'birdie'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/40 ring-2 ring-red-400'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="text-xs font-black">🔴 เบอร์ดี้</span>
              <span className="text-[9px] opacity-80">(-1) ช็อต {par - 1}</span>
            </button>
            <button
              type="button"
              onClick={() => setChulaTargetScore('par')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center active:scale-95 flex flex-col items-center justify-center ${
                chulaTargetScore === 'par'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-400'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="text-xs font-black">🟢 พาร์</span>
              <span className="text-[9px] opacity-80">(E) ช็อต {par}</span>
            </button>
            <button
              type="button"
              onClick={() => setChulaTargetScore('bogey')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center active:scale-95 flex flex-col items-center justify-center ${
                chulaTargetScore === 'bogey'
                  ? 'bg-slate-600 text-white shadow-lg ring-2 ring-slate-400'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="text-xs font-black">⚪ โบกี้</span>
              <span className="text-[9px] opacity-80">(+1) ช็อต {par + 1}</span>
            </button>
            <button
              type="button"
              onClick={() => setChulaTargetScore('double')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center active:scale-95 flex flex-col items-center justify-center ${
                chulaTargetScore === 'double'
                  ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-300'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="text-xs font-black">🟡 ดับเบิ้ล</span>
              <span className="text-[9px] opacity-80">(+2) ช็อต {par + 2}</span>
            </button>
          </div>
        </div>

        {/* 2.2 ระยะพัตต์ / ความยากของไลน์ */}
        <div>
          <div className="text-[10px] text-slate-400 mb-1.5">
            ระยะพัตต์ / ความยากของไลน์:
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setChulaPuttDifficulty('easy_tap_in')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center active:scale-95 ${
                chulaPuttDifficulty === 'easy_tap_in'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              จ่อ 1-3 ฟุต
              <div className="text-[9px] font-normal opacity-80">ลง 90%</div>
            </button>
            <button
              type="button"
              onClick={() => setChulaPuttDifficulty('medium_6_10ft')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center active:scale-95 ${
                chulaPuttDifficulty === 'medium_6_10ft'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              กลาง 5-10 ฟุต
              <div className="text-[9px] font-normal opacity-80">ลง 65%</div>
            </button>
            <button
              type="button"
              onClick={() => setChulaPuttDifficulty('difficult_downhill')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center active:scale-95 ${
                chulaPuttDifficulty === 'difficult_downhill'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              ลงเนินเร็ว
              <div className="text-[9px] font-normal opacity-80">เสี่ยง 3 พัตต์</div>
            </button>
          </div>
        </div>
      </div>

      {/* 4. INSTANT AI GAME THEORY RECOMMENDATION BANNER */}
      <div
        className={`p-4 rounded-2xl border transition shadow-xl ${
          decision.verdict === 'HUNT_EAGLE'
            ? 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-950 border-amber-500/80 shadow-amber-950/40'
            : decision.verdict === 'HUNT_BIRDIE'
            ? 'bg-gradient-to-br from-red-950/90 via-slate-900 to-slate-950 border-red-500/80 shadow-red-950/40'
            : decision.verdict === 'DUMP_HANDICAP'
            ? 'bg-gradient-to-br from-purple-950/90 via-slate-900 to-slate-950 border-purple-500/80 shadow-purple-950/40'
            : decision.verdict === 'ATTACK_PAR'
            ? (decision.expectedPointsIfPar < 0
                ? 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-950 border-amber-500/70 shadow-amber-950/30'
                : decision.expectedPointsIfPar === 0
                ? 'bg-gradient-to-br from-blue-950/90 via-slate-900 to-slate-950 border-blue-500/70 shadow-blue-950/30'
                : 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 border-emerald-500/70 shadow-emerald-950/30')
            : decision.verdict === 'DUMP_BULLET'
            ? 'bg-gradient-to-br from-blue-950/90 via-slate-900 to-slate-950 border-blue-500/70 shadow-blue-950/30'
            : decision.verdict === 'SAFE_BOGEY'
            ? 'bg-gradient-to-br from-red-950/90 via-slate-900 to-slate-950 border-red-500/70 shadow-red-950/30'
            : 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-950 border-amber-500/70 shadow-amber-950/30'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${decision.badgeBg}`}
            >
              {decision.verdictBadge}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">ความต่างลง vs พลาด:</span>
            <span className="text-pink-400 font-black">
              {Math.abs(decision.pointSwing)} แต้ม
            </span>
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white mb-1.5 flex items-center gap-1.5">
          {decision.verdict === 'HUNT_EAGLE' && <Flame className="w-5 h-5 text-amber-400 shrink-0" />}
          {decision.verdict === 'HUNT_BIRDIE' && <Flame className="w-5 h-5 text-red-400 shrink-0" />}
          {decision.verdict === 'DUMP_HANDICAP' && <RefreshCw className="w-5 h-5 text-purple-400 shrink-0" />}
          {decision.verdict === 'ATTACK_PAR' && (
            decision.expectedPointsIfPar < 0 ? (
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            ) : decision.expectedPointsIfPar === 0 ? (
              <Target className="w-5 h-5 text-blue-400 shrink-0" />
            ) : (
              <Flame className="w-5 h-5 text-emerald-400 shrink-0" />
            )
          )}
          {decision.verdict === 'SAFE_BOGEY' && <Shield className="w-5 h-5 text-red-400 shrink-0" />}
          {decision.verdict === 'DUMP_BULLET' && <Target className="w-5 h-5 text-blue-400 shrink-0" />}
          {decision.verdict === 'DEFEND_DOUBLE' && <Shield className="w-5 h-5 text-amber-400 shrink-0" />}
          {decision.verdictTitle}
        </h2>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3">
          {decision.primaryAdvice}
        </p>

        {/* DISCRETE OUTCOME GRID: EAGLE (IF APPLICABLE) / BIRDIE / PAR / BOGEY / DOUBLE */}
        <div className={`grid ${decision.expectedPointsIfEagle !== undefined && par === 5 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'} gap-2 text-center text-xs`}>
          {decision.expectedPointsIfEagle !== undefined && par === 5 && (
            <div
              className={`p-2 rounded-xl border ${
                decision.verdict === 'HUNT_EAGLE'
                  ? 'bg-amber-950/80 border-amber-400 shadow-md shadow-amber-950/50'
                  : 'bg-slate-900/80 border-amber-500/30'
              }`}
            >
              <div className="text-[10px] text-amber-300 font-bold">ถ้าทำอีเกิ้ล</div>
              <div className="text-base font-black text-amber-200">
                {decision.expectedPointsIfEagle > 0
                  ? `+${decision.expectedPointsIfEagle}`
                  : decision.expectedPointsIfEagle}{' '}
                แต้ม
              </div>
              <div className="text-[9px] text-amber-400 font-bold">
                🦅 ทุบแต้มสูงสุด
              </div>
            </div>
          )}

          {/* 1. เบอร์ดี้ */}
          <div
            className={`p-2 rounded-xl border ${
              decision.verdict === 'HUNT_BIRDIE'
                ? 'bg-red-950/80 border-red-500/80 shadow-md shadow-red-950/50'
                : 'bg-slate-900/80 border-red-500/30'
            }`}
          >
            <div className="text-[10px] text-red-400 font-bold">ถ้าทำเบอร์ดี้</div>
            <div className="text-base font-black text-red-300">
              {decision.expectedPointsIfBirdie > 0
                ? `+${decision.expectedPointsIfBirdie}`
                : decision.expectedPointsIfBirdie}{' '}
              แต้ม
            </div>
            <div className="text-[9px] text-slate-400">
              {flight === 'A'
                ? 'สแครตช์บุกแหลก'
                : decision.bulletStatus === 'CRITICAL_DQ_RISK'
                ? 'ระวัง DQ'
                : 'บุกเก็บแต้ม'}
            </div>
          </div>

          {/* 2. พาร์ */}
          <div
            className={`p-2 rounded-xl border ${
              decision.verdict === 'ATTACK_PAR'
                ? decision.expectedPointsIfPar < 0
                  ? 'bg-amber-950/80 border-amber-500/80 shadow-md shadow-amber-950/50'
                  : decision.expectedPointsIfPar === 0
                  ? 'bg-blue-950/80 border-blue-500/80 shadow-md shadow-blue-950/50'
                  : 'bg-emerald-950/80 border-emerald-500/80 shadow-md shadow-emerald-950/50'
                : 'bg-slate-900/80 border-emerald-500/30'
            }`}
          >
            <div className="text-[10px] text-emerald-400 font-bold">ถ้าทำพาร์</div>
            <div className="text-base font-black text-emerald-300">
              {decision.expectedPointsIfPar > 0
                ? `+${decision.expectedPointsIfPar}`
                : decision.expectedPointsIfPar}{' '}
              แต้ม
            </div>
            <div className="text-[9px] text-slate-400">
              {decision.expectedPointsIfPar > 0
                ? 'คว้าแต้มบวก'
                : decision.expectedPointsIfPar === 0
                ? 'ประคองเสมอ'
                : 'กั้นแต้มหยุดแผล'}
            </div>
          </div>

          {/* 3. โบกี้ */}
          <div
            className={`p-2 rounded-xl border ${
              decision.verdict === 'DUMP_BULLET' || decision.verdict === 'SAFE_BOGEY'
                ? 'bg-blue-950/80 border-blue-500/80 shadow-md shadow-blue-950/50'
                : 'bg-slate-900/80 border-blue-500/30'
            }`}
          >
            <div className="text-[10px] text-blue-400 font-bold">ถ้าเคาะโบกี้</div>
            <div className="text-base font-black text-blue-300">
              {decision.expectedPointsIfBogey > 0
                ? `+${decision.expectedPointsIfBogey}`
                : decision.expectedPointsIfBogey}{' '}
              แต้ม
            </div>
            <div className="text-[9px] text-slate-400">
              {decision.expectedPointsIfBogey > 0
                ? 'ยังได้แต้มบวก'
                : decision.expectedPointsIfBogey === 0
                ? 'แต้มเสมอ'
                : decision.expectedPointsIfBogey === decision.expectedPointsIfDouble
                ? 'แต้มเท่าดับเบิ้ล'
                : 'เสียแต้ม'}
            </div>
          </div>

          {/* 4. ดับเบิ้ล */}
          {decision.expectedPointsIfDouble === decision.expectedPointsIfBogey ? (
            <div
              className={`p-2 rounded-xl border ${
                decision.verdict === 'DUMP_HANDICAP'
                  ? 'bg-purple-950/80 border-purple-500/80 shadow-md shadow-purple-950/50'
                  : 'bg-slate-900/80 border-purple-500/40'
              }`}
            >
              <div className="text-[10px] text-purple-300 font-bold">ถ้าออกดับเบิ้ล</div>
              <div className="text-base font-black text-purple-200">
                {decision.expectedPointsIfDouble > 0
                  ? `+${decision.expectedPointsIfDouble}`
                  : decision.expectedPointsIfDouble}{' '}
                แต้ม
              </div>
              <div className="text-[9px] text-purple-300 font-black">
                {flight === 'A' ? 'แต้มเท่าโบกี้' : '🎯 ทิ้งแคปได้กำไร!'}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/80 p-2 rounded-xl border border-red-500/30">
              <div className="text-[10px] text-red-400 font-bold">ถ้าดับเบิ้ล</div>
              <div className="text-base font-black text-red-400">
                {decision.expectedPointsIfDouble > 0
                  ? `+${decision.expectedPointsIfDouble}`
                  : decision.expectedPointsIfDouble}{' '}
                แต้ม
              </div>
              <div className="text-[9px] text-slate-400">
                เสียหาย ({decision.expectedPointsIfDouble - decision.expectedPointsIfBogey} แต้ม)
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Joint Scenario Matrix */}
        <div className="pt-2 mt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1"
          >
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-pink-400" /> ดูตารางฉากทัศน์ความน่าจะเป็นคู่แข่ง
            </span>
            {showMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showMatrix && (
            <div className="mt-2 overflow-x-auto rounded-xl border border-slate-800 shadow-inner">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">ฉากทัศน์คู่แข่ง</th>
                    {decision.expectedPointsIfEagle !== undefined && par === 5 && (
                      <th className="p-2.5 text-center text-amber-400">ถ้าเราอีเกิ้ล</th>
                    )}
                    <th className="p-2.5 text-center text-red-400">ถ้าเราดี้</th>
                    <th className="p-2.5 text-center text-emerald-400">ถ้าเราพาร์</th>
                    <th className="p-2.5 text-center text-blue-400">ถ้าเรากี้</th>
                    <th className="p-2.5 text-center text-purple-400">ถ้าเราดับ</th>
                    <th className="p-2.5 text-center text-pink-400">ความต่าง (Swing)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900 text-slate-300">
                  {decision.scenarioBreakdown.map((scen, sIdx) => (
                    <tr key={sIdx}>
                      <td className="p-2.5 font-medium">{scen.scenario}</td>
                      {decision.expectedPointsIfEagle !== undefined && par === 5 && (
                        <td className="p-2.5 text-center font-bold text-amber-400">
                          {scen.chulaEaglePoints !== undefined
                            ? scen.chulaEaglePoints > 0
                              ? `+${scen.chulaEaglePoints}`
                              : `${scen.chulaEaglePoints}`
                            : '-'}{' '}
                          แต้ม
                        </td>
                      )}
                      <td className="p-2.5 text-center font-bold text-red-400">
                        {scen.chulaBirdiePoints !== undefined
                          ? scen.chulaBirdiePoints > 0
                            ? `+${scen.chulaBirdiePoints}`
                            : `${scen.chulaBirdiePoints}`
                          : '-'}{' '}
                        แต้ม
                      </td>
                      <td className="p-2.5 text-center font-bold text-emerald-400">
                        {scen.chulaParPoints > 0 ? `+${scen.chulaParPoints}` : scen.chulaParPoints} แต้ม
                      </td>
                      <td className="p-2.5 text-center font-bold text-blue-400">
                        {scen.chulaBogeyPoints > 0 ? `+${scen.chulaBogeyPoints}` : scen.chulaBogeyPoints} แต้ม
                      </td>
                      <td className="p-2.5 text-center font-bold text-purple-400">
                        {scen.chulaDoublePoints !== undefined
                          ? scen.chulaDoublePoints > 0
                            ? `+${scen.chulaDoublePoints}`
                            : `${scen.chulaDoublePoints}`
                          : '-'}{' '}
                        แต้ม
                      </td>
                      <td className="p-2.5 text-center font-black text-pink-400">
                        {Math.abs(scen.netSwing)} แต้ม
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 5. STEP 3: CONFIRM & RECORD CHULA'S FINAL SCORE */}
      <div className="bg-gradient-to-br from-pink-950/40 via-slate-900 to-slate-950 border border-pink-500/50 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-pink-400" />
              3. บันทึกผลสกอร์จริงของจุฬาฯ (หลุม {currentHole})
            </h3>
            <p className="text-[11px] text-slate-400">
              เมื่อพัตต์จบหลุมแล้ว กดเลือกสกอร์จริง สกอร์การ์ดและอันดับก๊วนจะอัปเดตอัตโนมัติทันที
            </p>
          </div>
          {chulaCurrentScore && (
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
                isOverDouble(chulaCurrentScore)
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-pink-500 text-white'
              }`}
            >
              บันทึกแล้ว: {SCORE_LABELS[chulaCurrentScore].th} ({SCORE_LABELS[chulaCurrentScore].short})
            </span>
          )}
        </div>

        <div className="space-y-2">
          {/* Main 5 discrete scores */}
          <div className="grid grid-cols-5 gap-1.5">
            {(['eagle', 'birdie', 'par', 'bogey', 'double'] as ScoreType[]).map((sc) => {
              const isSelected = chulaCurrentScore === sc;
              return (
                <button
                  key={sc}
                  type="button"
                  onClick={() => {
                    handleSetChulaScore(sc);
                    setOpenOverDoubleChula(false);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black transition active:scale-95 flex flex-col items-center justify-center ${
                    isSelected
                      ? sc === 'eagle'
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-white shadow-lg'
                        : sc === 'birdie'
                        ? 'bg-red-600 text-white ring-2 ring-white shadow-lg'
                        : sc === 'par'
                        ? 'bg-emerald-600 text-white ring-2 ring-white shadow-lg'
                        : sc === 'bogey'
                        ? 'bg-slate-600 text-white ring-2 ring-white shadow-lg'
                        : 'bg-amber-600 text-white ring-2 ring-white shadow-lg'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>
                    {sc === 'eagle' ? 'อีเกิ้ล' : sc === 'birdie' ? 'ดี้' : sc === 'par' ? 'พาร์' : sc === 'bogey' ? 'กี้' : 'ดับ'}
                  </span>
                  <span className="text-[10px] font-normal opacity-75">
                    {sc === 'eagle' ? '-2' : sc === 'birdie' ? '-1' : sc === 'par' ? 'E' : sc === 'bogey' ? '+1' : '+2'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ปุ่มระบุสกอร์หากออกเกิน Double */}
          <button
            type="button"
            onClick={() => setOpenOverDoubleChula(!openOverDoubleChula)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between border active:scale-[0.99] ${
              isOverDouble(chulaCurrentScore)
                ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-md ring-2 ring-purple-400'
                : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-purple-400 font-black">🟣 เกินดับเบิ้ล</span>
              <span className="text-[11px] text-slate-300">
                {chulaCurrentScore && isOverDouble(chulaCurrentScore)
                  ? `👉 บันทึกแล้ว: ${SCORE_LABELS[chulaCurrentScore].th} (+${SCORE_VALUES[chulaCurrentScore]} / ออก ${par + SCORE_VALUES[chulaCurrentScore]} สโตรก)`
                  : '(กดระบุว่าออกเท่าไหร่: +3 ทริปเปิ้ล, +4 ควอด, +5...)'}
              </span>
            </span>
            <span className="text-xs text-purple-400 font-bold">
              {openOverDoubleChula || isOverDouble(chulaCurrentScore) ? '▲ ซ่อน' : '▼ กดระบุคะแนน'}
            </span>
          </button>

          {/* Expanded over-double picker drawer for Chula */}
          {(openOverDoubleChula || isOverDouble(chulaCurrentScore)) && (
            <div className="grid grid-cols-4 gap-2 p-2.5 bg-slate-950 rounded-xl border border-purple-500/40">
              {OVER_DOUBLE_OPTIONS.map((opt) => {
                const isSelected = chulaCurrentScore === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleSetChulaScore(opt.type)}
                    className={`py-2.5 px-1 rounded-xl text-center transition active:scale-95 flex flex-col items-center justify-center border ${
                      isSelected
                        ? 'bg-purple-600 text-white font-black border-purple-300 shadow-lg ring-2 ring-white'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
                    }`}
                  >
                    <span className="text-sm font-black">+{opt.delta}</span>
                    <span className="text-xs font-bold">{opt.name}</span>
                    <span className="text-[10px] opacity-80">ออก {par + opt.delta} สโตรก</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Next Hole Action */}
        {currentHole < 18 && (
          <button
            type="button"
            onClick={() => onSelectHole(currentHole + 1)}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-1"
          >
            <span>ไปหลุมถัดไป (หลุม {currentHole + 1})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
