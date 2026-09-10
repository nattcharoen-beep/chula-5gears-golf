import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APP_URL = 'https://nattcharoen-beep.github.io/chula-5gears-golf/';

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(APP_URL);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = APP_URL;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chula 5-Gears Golf Strategist',
          text: 'แอปวางแผนการเล่นกอล์ฟ 5 เกียร์ ทฤษฎีเกมคำนวณแต้มรายหลุมและคุมแคป DQ',
          url: APP_URL,
        });
      } catch {
        // User canceled or failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="QR Code แชร์แอปให้เพื่อน"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-slate-900 border border-pink-500/50 rounded-3xl p-5 shadow-2xl shadow-pink-950/50 space-y-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/30">
            <span>⚙️ Chula 5-Gears</span>
          </div>
          <h3 className="text-lg font-black text-white">สแกน QR เพื่อเปิดแอป</h3>
          <p className="text-xs text-slate-400">
            เปิดกล้องมือถือส่องเพื่อเปิดใช้งานบนเครื่องตัวเองได้ทันที
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex justify-center py-2">
          <div className="p-4 bg-white rounded-2xl shadow-xl ring-4 ring-pink-500/30">
            <QRCodeSVG
              value={APP_URL}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold transition shadow-lg shadow-pink-900/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>แชร์เข้า LINE / กลุ่มเพื่อน</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95 border ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>คัดลอกลิงก์สำเร็จแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-pink-400" />
                <span>คัดลอกลิงก์ (Copy Link)</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Tip */}
        <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          💡 <span className="text-pink-300 font-semibold">ทริก:</span> เมื่อเปิดในมือถือแล้ว กดเลือก <span className="text-white font-bold">"เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)"</span> เพื่อใช้เต็มจอเหมือนแอปจริงได้เลย
        </div>
      </div>
    </div>
  );
};
