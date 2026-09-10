import React, { useState } from 'react';
import {
  OpponentLiveState,
  ScoreType,
  UNIVERSITIES,
  HoleConfig,
} from '../types/golf';
import { evaluatePuttingDecision } from '../utils/gameTheoryEngine';
import { BulletStatus } from '../utils/bulletManager';
import {
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';

interface PuttDecisionCardProps {
  currentHoleConfig: HoleConfig;
  bulletStatus: BulletStatus;
  flight: string;
}

export const PuttDecisionCard: React.FC<PuttDecisionCardProps> = ({
  currentHoleConfig,
  bulletStatus,
  flight,
}) => {
  const [chulaOrder, setChulaOrder] = useState<number>(3);

  const [chulaPuttDifficulty, setChulaPuttDifficulty] = useState<
    'easy_tap_in' | 'medium_6_10ft' | 'difficult_downhill'
  >('medium_6_10ft');

  const [opponents, setOpponents] = useState<OpponentLiveState[]>([
    {
      universityId: 'kasetsart',
      orderNumber: 1,
      isFinished: true,
      finishedScore: 'bogey',
      currentShotNumber: 4,
      pendingTargetScore: 'par',
      makeProbabilityPct: 90,
      distanceDescription: 'tap_in',
    },
    {
      universityId: 'cmu',
      orderNumber: 2,
      isFinished: true,
      finishedScore: 'bogey',
      currentShotNumber: 4,
      pendingTargetScore: 'par',
      makeProbabilityPct: 90,
      distanceDescription: 'tap_in',
    },
    {
      universityId: 'kku',
      orderNumber: 4,
      isFinished: false,
      finishedScore: 'par',
      currentShotNumber: 4,
      pendingTargetScore: 'par',
      makeProbabilityPct: 90,
      distanceDescription: 'tap_in',
    },
    {
      universityId: 'psu',
      orderNumber: 5,
      isFinished: false,
      finishedScore: 'par',
      currentShotNumber: 4,
      pendingTargetScore: 'par',
      makeProbabilityPct: 90,
      distanceDescription: 'tap_in',
    },
  ]);

  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  const decision = evaluatePuttingDecision(
    bulletStatus.bulletsRemaining,
    flight,
    chulaPuttDifficulty,
    opponents
  );

  const updateOpponent = (index: number, patch: Partial<OpponentLiveState>) => {
    setOpponents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...patch };
      return updated;
    });
  };

  const loadUserDilemmaPreset = () => {
    setChulaOrder(3);
    setChulaPuttDifficulty('medium_6_10ft');
    setOpponents([
      {
        universityId: 'kasetsart',
        orderNumber: 1,
        isFinished: true,
        finishedScore: 'bogey',
        currentShotNumber: 4,
        pendingTargetScore: 'bogey',
        makeProbabilityPct: 90,
        distanceDescription: 'tap_in',
      },
      {
        universityId: 'cmu',
        orderNumber: 2,
        isFinished: true,
        finishedScore: 'bogey',
        currentShotNumber: 4,
        pendingTargetScore: 'bogey',
        makeProbabilityPct: 90,
        distanceDescription: 'tap_in',
      },
      {
        universityId: 'kku',
        orderNumber: 4,
        isFinished: false,
        finishedScore: 'par',
        currentShotNumber: 4,
        pendingTargetScore: 'par',
        makeProbabilityPct: 90,
        distanceDescription: 'tap_in',
      },
      {
        universityId: 'psu',
        orderNumber: 5,
        isFinished: false,
        finishedScore: 'par',
        currentShotNumber: 4,
        pendingTargetScore: 'par',
        makeProbabilityPct: 90,
        distanceDescription: 'tap_in',
      },
    ]);
  };

  const loadDoubleBogeyPreset = () => {
    setChulaOrder(3);
    setChulaPuttDifficulty('medium_6_10ft');
    setOpponents([
      {
        universityId: 'kasetsart',
        orderNumber: 1,
        isFinished: true,
        finishedScore: 'double',
        currentShotNumber: 5,
        pendingTargetScore: 'double',
        makeProbabilityPct: 95,
        distanceDescription: 'tap_in',
      },
      {
        universityId: 'cmu',
        orderNumber: 2,
        isFinished: true,
        finishedScore: 'double',
        currentShotNumber: 5,
        pendingTargetScore: 'double',
        makeProbabilityPct: 95,
        distanceDescription: 'tap_in',
      },
      {
        universityId: 'kku',
        orderNumber: 4,
        isFinished: true,
        finishedScore: 'double',
        currentShotNumber: 5,
        pendingTargetScore: 'double',
        makeProbabilityPct: 95,
        distanceDescription: 'tap_in',
      },
      {
        universityId: 'psu',
        orderNumber: 5,
        isFinished: true,
        finishedScore: 'double',
        currentShotNumber: 5,
        pendingTargetScore: 'double',
        makeProbabilityPct: 95,
        distanceDescription: 'tap_in',
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Quick Presets Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">⚡ ฉากทัศน์ตัวอย่าง:</span>
          <button
            onClick={loadUserDilemmaPreset}
            className="px-2.5 py-1 rounded bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 border border-pink-500/40 text-xs font-medium transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> เราพัตต์คนที่ 3 (2 คนออกกี้, 2 คนพาร์ใกล้)
          </button>
          <button
            onClick={loadDoubleBogeyPreset}
            className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-xs font-medium transition"
          >
            4 คนออกดับเบิ้ล (เคาะโบกี้ทิ้งแคป)
          </button>
        </div>

        <div className="text-xs text-slate-400">
          หลุม {currentHoleConfig.holeNumber} (Par {currentHoleConfig.par})
        </div>
      </div>

      {/* AI RECOMMENDATION HERO BANNER */}
      <div
        className={`p-5 rounded-2xl border transition shadow-xl ${
          decision.verdict === 'ATTACK_PAR'
            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/60 shadow-emerald-900/20'
            : decision.verdict === 'DUMP_BULLET'
            ? 'bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-950 border-blue-500/60 shadow-blue-900/20'
            : decision.verdict === 'SAFE_BOGEY'
            ? 'bg-gradient-to-br from-red-950/80 via-slate-900 to-slate-950 border-red-500/60 shadow-red-900/20'
            : 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/60 shadow-amber-900/20'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${decision.badgeBg}`}>
              {decision.verdictBadge}
            </div>
            <span className="text-xs text-slate-400">คำนวณจาก Game Theory & Expected Utility</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400">Point Swing:</span>
            <span
              className={`text-sm font-extrabold ${
                decision.pointSwing > 0 ? 'text-pink-400' : 'text-slate-300'
              }`}
            >
              {decision.pointSwing > 0 ? `+${decision.pointSwing}` : decision.pointSwing} แต้ม
            </span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
          {decision.verdictTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-4">
          {decision.primaryAdvice}
        </p>

        {/* Comparison Cards: Par vs Bogey */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-500/30">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
              <span>ถ้ายิงพาร์ (Par)</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/20">ใช้ 1 กระสุน</span>
            </div>
            <div className="text-2xl font-black text-emerald-300">
              {decision.expectedPointsIfPar > 0 ? `+${decision.expectedPointsIfPar}` : decision.expectedPointsIfPar}
              <span className="text-xs font-normal text-slate-400 ml-1">แต้มก๊วน</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {decision.expectedPointsIfPar > decision.expectedPointsIfBogey
                ? 'ชนะ/เสมอคู่แข่งที่ทำพาร์'
                : 'ได้แต้มเท่ากับโบกี้'}
            </p>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-blue-500/30">
            <div className="flex items-center justify-between text-xs text-blue-400 font-medium mb-1">
              <span>ถ้าเคาะโบกี้ (Safe Bogey)</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-500/20">ประหยัดกระสุน</span>
            </div>
            <div className="text-2xl font-black text-blue-300">
              {decision.expectedPointsIfBogey > 0 ? `+${decision.expectedPointsIfBogey}` : decision.expectedPointsIfBogey}
              <span className="text-xs font-normal text-slate-400 ml-1">แต้มก๊วน</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {decision.expectedPointsIfBogey < decision.expectedPointsIfPar
                ? 'เสียแต้มให้คนออกพาร์'
                : 'กินรอบวงชัวร์โดยไม่ต้องเปลืองแคป'}
            </p>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-red-500/30">
            <div className="flex items-center justify-between text-xs text-red-400 font-medium mb-1">
              <span>ถ้า 3 พัตต์ออกดับเบิ้ล</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/20">ความเสียหาย</span>
            </div>
            <div className="text-2xl font-black text-red-400">
              {decision.expectedPointsIfDouble > 0 ? `+${decision.expectedPointsIfDouble}` : decision.expectedPointsIfDouble}
              <span className="text-xs font-normal text-slate-400 ml-1">แต้มก๊วน</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">แพ้รอบวงหากคู่แข่งทุกคนทำโบกี้หรือดีกว่า</p>
          </div>
        </div>

        {/* Tactical Reasons List */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs font-bold text-pink-400 mb-2 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" /> เหตุผลวิเคราะห์เชิงลึก:
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {decision.tacticalReasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-pink-500 font-bold">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* INPUT PANEL: CHULA & OPPONENTS STATUS */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              สถานะบนกรีนของจุฬาฯ และคู่แข่งทั้ง 4 สถาบัน
            </h3>
            <p className="text-xs text-slate-400">
              กรอกสกอร์คนที่จบไปก่อน และระบุช็อต/โอกาสลงของคนที่เล่นทีหลัง
            </p>
          </div>

          {/* Chula Order Selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">จุฬาฯ พัตต์คนที่:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((order) => (
                <button
                  key={order}
                  onClick={() => setChulaOrder(order)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                    chulaOrder === order
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/40 border border-pink-400'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {order}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chula's Own Putt Difficulty */}
        <div className="bg-pink-950/20 p-3.5 rounded-xl border border-pink-900/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center font-bold text-white text-xs">
              CU
            </div>
            <div>
              <div className="text-xs font-bold text-pink-300">ช็อตพัตต์พาร์ของทีมจุฬาฯ</div>
              <div className="text-[11px] text-slate-400">
                เรากำลังจะพัตต์ Par (พาร์) บนหลุม Par {currentHoleConfig.par}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1">ระยะ/ความยาก:</span>
            <button
              onClick={() => setChulaPuttDifficulty('easy_tap_in')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                chulaPuttDifficulty === 'easy_tap_in'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              จ่อ 1-3 ฟุต (90%)
            </button>
            <button
              onClick={() => setChulaPuttDifficulty('medium_6_10ft')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                chulaPuttDifficulty === 'medium_6_10ft'
                  ? 'bg-pink-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ระยะกลาง 5-10 ฟุต (65%)
            </button>
            <button
              onClick={() => setChulaPuttDifficulty('difficult_downhill')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                chulaPuttDifficulty === 'difficult_downhill'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ลงเนินเร็ว เสี่ยง 3 พัตต์
            </button>
          </div>
        </div>

        {/* 4 OPPONENTS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {opponents.map((opp, idx) => {
            const uInfo = UNIVERSITIES[opp.universityId];
            return (
              <div
                key={opp.universityId}
                className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition"
              >
                {/* Header of Opponent */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{uInfo.flagEmoji}</span>
                    <div>
                      <span className={`text-xs font-bold ${uInfo.textColor}`}>
                        {uInfo.thaiName} ({uInfo.badge})
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1.5">
                        ลำดับเล่น #{opp.orderNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                    <button
                      onClick={() => updateOpponent(idx, { isFinished: true })}
                      className={`px-2 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                        opp.isFinished
                          ? 'bg-slate-800 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> จบแล้ว
                    </button>
                    <button
                      onClick={() => updateOpponent(idx, { isFinished: false })}
                      className={`px-2 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                        !opp.isFinished
                          ? 'bg-pink-600/30 text-pink-300 shadow border border-pink-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Clock className="w-3 h-3 text-pink-400" /> ตีหลังเรา
                    </button>
                  </div>
                </div>

                {opp.isFinished ? (
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-400">สกอร์ที่ตีจบหลุมนี้:</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['birdie', 'par', 'bogey', 'double'] as ScoreType[]).map((sc) => (
                        <button
                          key={sc}
                          onClick={() => updateOpponent(idx, { finishedScore: sc })}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition text-center ${
                            opp.finishedScore === sc
                              ? sc === 'birdie'
                                ? 'bg-red-600 text-white'
                                : sc === 'par'
                                ? 'bg-emerald-600 text-white'
                                : sc === 'bogey'
                                ? 'bg-slate-600 text-white'
                                : 'bg-amber-600 text-white'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {sc === 'birdie'
                            ? 'ดี้ (-1)'
                            : sc === 'par'
                            ? 'พาร์ (E)'
                            : sc === 'bogey'
                            ? 'กี้ (+1)'
                            : 'ดับ (+2)'}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>กำลังจะตีช็อตที่:</span>
                        <span className="text-pink-400 font-medium">
                          พัตต์เพื่อ: {opp.pendingTargetScore.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {(['birdie', 'par', 'bogey', 'double'] as ScoreType[]).map((target) => (
                          <button
                            key={target}
                            onClick={() => updateOpponent(idx, { pendingTargetScore: target })}
                            className={`py-1 px-1.5 rounded text-[11px] font-semibold transition ${
                              opp.pendingTargetScore === target
                                ? 'bg-slate-700 text-white border border-slate-500'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {target === 'birdie'
                              ? 'ช็อต 3 (ดี้)'
                              : target === 'par'
                              ? 'ช็อต 4 (พาร์)'
                              : target === 'bogey'
                              ? 'ช็อต 5 (กี้)'
                              : 'ช็อต 6 (ดับ)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>โอกาสลงเยอะมั้ย:</span>
                        <span className="font-bold text-white text-xs">
                          {opp.makeProbabilityPct}%
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 mb-1.5">
                        <button
                          onClick={() => updateOpponent(idx, { makeProbabilityPct: 92 })}
                          className={`py-1 px-1 rounded text-[10px] font-medium transition ${
                            opp.makeProbabilityPct >= 85
                              ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          🟢 จ่อ (90%)
                        </button>
                        <button
                          onClick={() => updateOpponent(idx, { makeProbabilityPct: 60 })}
                          className={`py-1 px-1 rounded text-[10px] font-medium transition ${
                            opp.makeProbabilityPct >= 50 && opp.makeProbabilityPct < 85
                              ? 'bg-amber-600/40 text-amber-300 border border-amber-500/50'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          🟡 กลาง (60%)
                        </button>
                        <button
                          onClick={() => updateOpponent(idx, { makeProbabilityPct: 25 })}
                          className={`py-1 px-1 rounded text-[10px] font-medium transition ${
                            opp.makeProbabilityPct >= 20 && opp.makeProbabilityPct < 50
                              ? 'bg-orange-600/40 text-orange-300 border border-orange-500/50'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          🟠 ไกล (25%)
                        </button>
                        <button
                          onClick={() => updateOpponent(idx, { makeProbabilityPct: 10 })}
                          className={`py-1 px-1 rounded text-[10px] font-medium transition ${
                            opp.makeProbabilityPct < 20
                              ? 'bg-red-600/40 text-red-300 border border-red-500/50'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          🔴 ยาก (10%)
                        </button>
                      </div>

                      <input
                        type="range"
                        min={5}
                        max={95}
                        step={5}
                        value={opp.makeProbabilityPct}
                        onChange={(e) =>
                          updateOpponent(idx, { makeProbabilityPct: parseInt(e.target.value) })
                        }
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Collapsible Joint Probability Scenarios Matrix */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => setShowMatrix(!showMatrix)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1 transition"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-pink-400" />
              ดูตารางความน่าจะเป็นทุกกรณีของคู่แข่ง (Joint Scenario Matrix)
            </span>
            {showMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showMatrix && (
            <div className="mt-2 overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">ฉากทัศน์คู่แข่ง</th>
                    <th className="p-2.5 text-center">โอกาสเกิด (%)</th>
                    <th className="p-2.5 text-center text-emerald-400">ถ้าเราได้พาร์</th>
                    <th className="p-2.5 text-center text-blue-400">ถ้าเราได้โบกี้</th>
                    <th className="p-2.5 text-center text-pink-400">Point Swing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 text-slate-300">
                  {decision.scenarioBreakdown.map((scen, sIdx) => (
                    <tr key={sIdx} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-medium">{scen.scenario}</td>
                      <td className="p-2.5 text-center font-bold text-slate-200">
                        {scen.probabilityPct}%
                      </td>
                      <td className="p-2.5 text-center font-extrabold text-emerald-400">
                        {scen.chulaParPoints > 0 ? `+${scen.chulaParPoints}` : scen.chulaParPoints}
                      </td>
                      <td className="p-2.5 text-center font-extrabold text-blue-400">
                        {scen.chulaBogeyPoints > 0 ? `+${scen.chulaBogeyPoints}` : scen.chulaBogeyPoints}
                      </td>
                      <td className="p-2.5 text-center font-black text-pink-400">
                        {scen.netSwing > 0 ? `+${scen.netSwing}` : scen.netSwing}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
