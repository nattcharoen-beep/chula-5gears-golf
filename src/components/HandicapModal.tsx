import React from 'react';
import { Flight } from '../types/golf';
import { Shield, Award, CheckCircle, ChevronRight, X } from 'lucide-react';

interface HandicapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHcp: number;
  onSelectHcp: (hcp: number, flight: Flight) => void;
  canClose?: boolean;
  isInitialEntry?: boolean;
}

export function getFlightFromHandicap(hcp: number): Flight {
  if (hcp <= 9) return 'A';
  if (hcp <= 14) return 'B';
  if (hcp <= 19) return 'C';
  return 'D';
}

const FLIGHT_DETAILS: Record<
  Flight,
  { name: string; range: string; color: string; bg: string; border: string; desc: string }
> = {
  A: {
    name: 'Flight A',
    range: 'HCP 0 - 9',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/50',
    desc: '🏆 แข่งขันแบบ Gross สด เล่นเหมือนไม่มีแคป • ไม่มีกฎ DQ อันเดอร์พาร์ • บุกทำเบอร์ดี้ได้เต็มที่!',
  },
  B: {
    name: 'Flight B',
    range: 'HCP 10 - 14',
    color: 'text-blue-400',
    bg: 'bg-blue-950/40',
    border: 'border-blue-500/50',
    desc: 'คุมแคปห้ามต่ำกว่าสแตนดาร์ดเกิน -4 Under Par (DQ 0 แต้ม) • กระสุน 4 นัด',
  },
  C: {
    name: 'Flight C',
    range: 'HCP 15 - 19',
    color: 'text-pink-400',
    bg: 'bg-pink-950/40',
    border: 'border-pink-500/50',
    desc: 'คุมแคปห้ามต่ำกว่าสแตนดาร์ดเกิน -4 Under Par (DQ 0 แต้ม) • กระสุน 4 นัด',
  },
  D: {
    name: 'Flight D',
    range: 'HCP 20 - 24',
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/50',
    desc: 'คุมแคปห้ามต่ำกว่าสแตนดาร์ดเกิน -4 Under Par (DQ 0 แต้ม) • กระสุน 4 นัด',
  },
};

export const HandicapModal: React.FC<HandicapModalProps> = ({
  isOpen,
  onClose,
  currentHcp,
  onSelectHcp,
  canClose = true,
  isInitialEntry = false,
}) => {
  const [selectedHcp, setSelectedHcp] = React.useState<number>(currentHcp);

  React.useEffect(() => {
    setSelectedHcp(currentHcp);
  }, [currentHcp]);

  if (!isOpen) return null;

  const currentFlight = getFlightFromHandicap(selectedHcp);
  const flightInfo = FLIGHT_DETAILS[currentFlight];

  const handleConfirm = () => {
    onSelectHcp(selectedHcp, currentFlight);
    onClose();
  };

  const handleNumberClick = (num: number) => {
    setSelectedHcp(num);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="เลือกแต้มต่อ Handicap"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 flex items-center justify-center min-h-screen animate-fadeIn"
      onClick={canClose ? onClose : undefined}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-pink-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-pink-950/60 text-center my-auto max-h-[95vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button if allowed */}
        {canClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Title */}
        <div className="space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-black border border-pink-500/30">
            <span>⚙️ กอล์ฟ 5 เกียร์ • จุฬาลงกรณ์</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            เลือกแต้มต่อ (Handicap)
          </h2>
          <p className="text-xs text-slate-400">
            กดเลือกตัวเลขแคปของคุณ (0 - 24) เพื่อคำนวณไฟลท์และโควตากระสุน แล้วเริ่มแข่งที่หลุม 1
          </p>
        </div>

        {/* Selected Big Display Card */}
        <div
          className={`p-3.5 rounded-2xl border transition ${flightInfo.bg} ${flightInfo.border} shadow-lg`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-left">
              <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                แต้มต่อที่เลือก
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline gap-2">
                <span>HCP {selectedHcp}</span>
                <span className={`text-base font-bold ${flightInfo.color}`}>
                  ({flightInfo.name})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedHcp((prev) => Math.max(0, prev - 1))}
                disabled={selectedHcp <= 0}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-black text-lg flex items-center justify-center transition active:scale-90"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setSelectedHcp((prev) => Math.min(24, prev + 1))}
                disabled={selectedHcp >= 24}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-black text-lg flex items-center justify-center transition active:scale-90"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-300 text-left flex items-start gap-1.5 pt-2 border-t border-slate-800/80">
            <Shield className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
            <span>{flightInfo.desc}</span>
          </div>
        </div>

        {/* Big Number Grid 0 - 24 Grouped by Flight */}
        <div className="space-y-3 pt-1 text-left">
          {/* Flight A (0-9) */}
          <div>
            <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center justify-between">
              <span>🟢 Flight A (0 - 9)</span>
              <span className="text-[10px] text-slate-500 font-normal">Scratch / Low HCP</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const isSelected = selectedHcp === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumberClick(num)}
                    className={`py-2.5 rounded-xl text-sm font-black transition active:scale-95 text-center ${
                      isSelected
                        ? 'bg-emerald-600 text-white ring-2 ring-white shadow-lg shadow-emerald-950/50 scale-105 z-10'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flight B (10-14) */}
          <div>
            <div className="text-[11px] font-bold text-blue-400 mb-1 flex items-center justify-between">
              <span>🔵 Flight B (10 - 14)</span>
              <span className="text-[10px] text-slate-500 font-normal">คุมแคป 4 กระสุน</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[10, 11, 12, 13, 14].map((num) => {
                const isSelected = selectedHcp === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumberClick(num)}
                    className={`py-2.5 rounded-xl text-sm font-black transition active:scale-95 text-center ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-2 ring-white shadow-lg shadow-blue-950/50 scale-105 z-10'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flight C (15-19) */}
          <div>
            <div className="text-[11px] font-bold text-pink-400 mb-1 flex items-center justify-between">
              <span>🌸 Flight C (15 - 19)</span>
              <span className="text-[10px] text-slate-500 font-normal">คุมแคป 4 กระสุน</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[15, 16, 17, 18, 19].map((num) => {
                const isSelected = selectedHcp === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumberClick(num)}
                    className={`py-2.5 rounded-xl text-sm font-black transition active:scale-95 text-center ${
                      isSelected
                        ? 'bg-pink-600 text-white ring-2 ring-white shadow-lg shadow-pink-950/50 scale-105 z-10'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flight D (20-24) */}
          <div>
            <div className="text-[11px] font-bold text-amber-400 mb-1 flex items-center justify-between">
              <span>🟠 Flight D (20 - 24)</span>
              <span className="text-[10px] text-slate-500 font-normal">คุมแคป 4 กระสุน</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[20, 21, 22, 23, 24].map((num) => {
                const isSelected = selectedHcp === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumberClick(num)}
                    className={`py-2.5 rounded-xl text-sm font-black transition active:scale-95 text-center ${
                      isSelected
                        ? 'bg-amber-600 text-white ring-2 ring-white shadow-lg shadow-amber-950/50 scale-105 z-10'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Big Confirm Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 hover:from-pink-500 hover:to-rose-500 text-white text-sm font-black transition shadow-xl shadow-pink-950/50 flex items-center justify-center gap-2 active:scale-95"
        >
          <CheckCircle className="w-5 h-5 text-white" />
          <span>
            {isInitialEntry
              ? `ยืนยันแคป ${selectedHcp} (${flightInfo.name}) & เริ่มที่หลุม 1`
              : `บันทึกแคป ${selectedHcp} (${flightInfo.name})`}
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
