import React from 'react';
import { BulletStatus } from '../utils/bulletManager';
import { AlertTriangle, Crosshair, CheckCircle, Info } from 'lucide-react';

interface BulletDashboardProps {
  bulletStatus: BulletStatus;
}

export const BulletDashboard: React.FC<BulletDashboardProps> = ({ bulletStatus }) => {
  const maxBullets = 4;
  const remaining = Math.max(0, Math.min(maxBullets, Math.floor(bulletStatus.bulletsRemaining)));

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              คลังกระสุนแต้มต่อ & Anti-Sandbagging Monitor (-4 Under Par)
            </h3>
            <p className="text-xs text-slate-400">
              ควบคุมสกอร์รวมไม่ให้ต่ำกว่าสแตนดาร์ดเกิน 4 Under Par เพื่อป้องกันการโดน DQ 0 คะแนน
            </p>
          </div>
        </div>

        <div
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${bulletStatus.statusColor}`}
        >
          {bulletStatus.riskStatus === 'SAFE' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {bulletStatus.statusBadge}
        </div>
      </div>

      {bulletStatus.flight === 'A' ? (
        <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🏆</span>
            <span className="font-bold text-emerald-300 text-sm">
              Flight A (Scratch / Gross Match Play)
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            เล่นแบบสแครตช์เพียวๆ เหมือนไม่มีแคป ไม่มีการนับโควตากระสุน และไม่มีกฎ Anti-Sandbagging (DQ) สามารถบุกทำเบอร์ดี้และทำคะแนนได้เต็มที่ทุกลูก!
          </p>
        </div>
      ) : (
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span>🎯 กระสุนโควตาอันเดอร์พาร์:</span>
              <span className="text-pink-400 font-bold">
                {bulletStatus.bulletsRemaining} / 4 นัด
              </span>
            </span>
            <span className="text-slate-500 text-[11px]">
              (ยิงได้ดีกว่าแต้มต่อสะสมได้สูงสุด 4 สโตรก)
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }, (_, idx) => {
              const isFilled = idx < remaining;
              const isDanger = bulletStatus.bulletsRemaining <= 1;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center transition ${
                    isFilled
                      ? isDanger
                        ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                        : 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {isFilled ? (isDanger ? '🟡' : '🟢') : '⚪'}
                  </div>
                  <div className="text-xs font-bold">
                    {isFilled ? `กระสุนนัดที่ ${idx + 1}` : 'ยิงไปแล้ว'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isFilled ? 'พร้อมใช้งาน' : 'ใช้โควตาแล้ว'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400">แฮนดิแคป (HCP)</div>
          <div className="text-xl font-bold text-white mt-0.5">{bulletStatus.handicap}</div>
          <div className="text-[10px] text-slate-500">ไฟลท์ {bulletStatus.flight}</div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400">หลุมที่เล่นไปแล้ว</div>
          <div className="text-xl font-bold text-white mt-0.5">
            {bulletStatus.holesPlayed} <span className="text-xs text-slate-400">/ 18</span>
          </div>
          <div className="text-[10px] text-slate-500">เหลืออีก {bulletStatus.holesRemaining} หลุม</div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400">สกอร์ปัจจุบัน vs Par</div>
          <div
            className={`text-xl font-bold mt-0.5 ${
              bulletStatus.currentGrossOverPar > 0
                ? 'text-slate-200'
                : 'text-emerald-400'
            }`}
          >
            {bulletStatus.currentGrossOverPar > 0
              ? `+${bulletStatus.currentGrossOverPar}`
              : bulletStatus.currentGrossOverPar}
          </div>
          <div className="text-[10px] text-slate-500">Gross สดรายหลุม</div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-red-900/30">
          <div className="text-[11px] text-red-400">
            {bulletStatus.flight === 'A' ? 'กฎ Anti-Sandbagging' : 'สกอร์ต่ำสุดที่ห้ามหลุด (DQ)'}
          </div>
          <div className={`text-xl font-bold mt-0.5 ${bulletStatus.flight === 'A' ? 'text-emerald-400' : 'text-red-400'}`}>
            {bulletStatus.flight === 'A' ? 'ไม่มี DQ' : `${bulletStatus.minAllowedGross} Gross`}
          </div>
          <div className="text-[10px] text-slate-400">
            {bulletStatus.flight === 'A' ? 'สแครตช์บุกได้ 100%' : 'ต่ำกว่านี้ = Net < -4 Under'}
          </div>
        </div>
      </div>

      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-bold text-white">คำแนะนำการบริหารแคปทีมจุฬาฯ:</div>
          <div className="text-xs text-slate-300 leading-relaxed">
            {bulletStatus.warningMessage}
          </div>
          <div className="text-xs text-pink-400 font-medium pt-1">
            🎯 เป้าหมายสกอร์หลุมที่เหลือ: {bulletStatus.safeScoreTargetRemainingHoles}
          </div>
        </div>
      </div>
    </div>
  );
};
