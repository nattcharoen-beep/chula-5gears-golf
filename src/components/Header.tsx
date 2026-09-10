import React, { useState } from 'react';
import { Flight } from '../types/golf';
import { AlertTriangle, RotateCcw, QrCode, ChevronDown } from 'lucide-react';
import { BulletStatus } from '../utils/bulletManager';
import { ShareModal } from './ShareModal';

interface HeaderProps {
  currentHole: number;
  onSelectHole: (hole: number) => void;
  flight: Flight;
  handicap: number;
  onOpenHcpModal: () => void;
  bulletStatus: BulletStatus;
  onResetRound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentHole,
  flight,
  handicap,
  onOpenHcpModal,
  bulletStatus,
  onResetRound,
}) => {
  const [showShare, setShowShare] = useState(false);

  return (
    <header className="bg-slate-900/95 border-b border-pink-900/40 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Mobile Bar */}
      <div className="max-w-2xl mx-auto px-3.5 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-base shadow">
            ⚙️
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-sm font-extrabold text-white tracking-tight">CHULA</span>
              <span className="text-xs font-bold text-pink-400">5-GEARS</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Golf Game Theory Strategist
            </div>
          </div>
        </div>

        {/* Bullets, QR Share & Reset Button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow"
            title="สแกน QR Code / แชร์แอปให้เพื่อน"
          >
            <QrCode className="w-3.5 h-3.5 text-pink-400" />
            <span>QR / แชร์</span>
          </button>

          <div
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 text-xs font-bold ${
              flight === 'A'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : bulletStatus.statusColor
            }`}
          >
            {flight === 'A' ? (
              <>
                <span>🏆</span>
                <span>สแครตช์ (No DQ)</span>
              </>
            ) : (
              <>
                <span>🎯</span>
                <span>
                  {bulletStatus.bulletsRemaining > 0 ? (
                    <span>
                      {bulletStatus.bulletsRemaining}
                      {bulletStatus.extraBufferStrokes > 0 ? `+${bulletStatus.extraBufferStrokes}` : ''} นัด
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> 0 นัด
                    </span>
                  )}
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onResetRound}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            title="ล้างข้อมูลทั้งรอบ"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />

      {/* Mobile-First Big Tappable HCP Bar */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-3.5 py-1.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpenHcpModal}
            className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-pink-950/60 via-slate-900 to-slate-900 border border-pink-500/60 hover:border-pink-400 text-left flex items-center justify-between transition active:scale-98 shadow-sm group"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
              <span className="text-xs text-slate-300 font-bold">แต้มต่อ (HCP):</span>
              <span className="text-base font-black text-pink-400">
                {handicap}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 font-black border border-pink-500/40">
                ไฟลท์ {flight}
              </span>
            </div>
            <div className="text-[11px] text-pink-400 group-hover:text-pink-300 flex items-center gap-0.5 font-bold">
              <span>แตะเพื่อเปลี่ยน</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </button>

          <div className="text-[11px] text-slate-300 shrink-0 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-medium">
            หลุม <span className="text-pink-400 font-black">{currentHole}</span> / 18
          </div>
        </div>
      </div>
    </header>
  );
};
