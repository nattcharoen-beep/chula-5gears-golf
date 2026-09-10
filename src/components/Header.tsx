import React from 'react';
import { Flight, FLIGHTS } from '../types/golf';
import { AlertTriangle, RotateCcw, QrCode } from 'lucide-react';
import { BulletStatus } from '../utils/bulletManager';
import { ShareModal } from './ShareModal';

interface HeaderProps {
  currentHole: number;
  onSelectHole: (hole: number) => void;
  flight: Flight;
  onSelectFlight: (flight: Flight) => void;
  handicap: number;
  onChangeHandicap: (hcp: number) => void;
  bulletStatus: BulletStatus;
  onResetRound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentHole,
  onSelectHole,
  flight,
  onSelectFlight,
  handicap,
  onChangeHandicap,
  bulletStatus,
  onResetRound,
}) => {
  const [rawHcp, setRawHcp] = React.useState(String(handicap));
  const [showShare, setShowShare] = React.useState(false);

  React.useEffect(() => {
    setRawHcp(String(handicap));
  }, [handicap]);

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
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <span>HCP {handicap}</span>
              <span>•</span>
              <span>ไฟลท์ {flight}</span>
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

          <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 text-xs font-bold ${bulletStatus.statusColor}`}>
            <span>🎯</span>
            <span>
              {bulletStatus.bulletsRemaining > 0 ? (
                <span>{bulletStatus.bulletsRemaining} นัด</span>
              ) : (
                <span className="text-red-400 flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" /> 0 นัด
                </span>
              )}
            </span>
          </div>

          <button
            onClick={onResetRound}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            title="ล้างข้อมูลทั้งรอบ"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />

      {/* Quick Settings & Flight Selector */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-3.5 py-1.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">ไฟลท์:</span>
            <select
              value={flight}
              onChange={(e) => onSelectFlight(e.target.value as Flight)}
              style={{ colorScheme: 'dark' }}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-pink-500"
            >
              {Object.values(FLIGHTS).map((f) => (
                <option key={f.flight} value={f.flight} className="bg-slate-900 text-white">
                  {f.flight} ({f.defaultHcpRange[0]}-{f.defaultHcpRange[1]})
                </option>
              ))}
            </select>

            <span className="text-slate-400 text-[11px] ml-1">HCP:</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={rawHcp}
              placeholder="0-36"
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setRawHcp(val);
                if (val !== '') {
                  const num = Math.min(36, Math.max(0, parseInt(val, 10)));
                  onChangeHandicap(num);
                }
              }}
              onBlur={() => {
                if (rawHcp === '') {
                  setRawHcp(String(handicap));
                } else {
                  const num = Math.min(36, Math.max(0, parseInt(rawHcp, 10) || 0));
                  setRawHcp(String(num));
                  onChangeHandicap(num);
                }
              }}
              className="w-14 bg-slate-900 border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-white rounded-lg px-1.5 py-0.5 text-xs text-center font-black focus:outline-none transition"
            />
          </div>

          <div className="text-[11px] text-slate-400">
            หลุม <span className="text-pink-400 font-bold">{currentHole}</span> / 18
          </div>
        </div>
      </div>
    </header>
  );
};
