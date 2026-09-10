export type UniversityId = 'chula' | 'kasetsart' | 'cmu' | 'kku' | 'psu';

export interface UniversityInfo {
  id: UniversityId;
  name: string;
  thaiName: string;
  facultyName: string;
  badge: string;
  bgGradient: string;
  primaryColor: string;
  borderColor: string;
  textColor: string;
  flagEmoji: string;
}

export const UNIVERSITIES: Record<UniversityId, UniversityInfo> = {
  chula: {
    id: 'chula',
    name: 'Chula',
    thaiName: 'วิศวฯ จุฬาลงกรณ์',
    facultyName: 'Intania (อินทาเนีย)',
    badge: 'CU',
    bgGradient: 'from-pink-600 to-rose-700',
    primaryColor: '#de388b',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-400',
    flagEmoji: '🌸',
  },
  kasetsart: {
    id: 'kasetsart',
    name: 'Kasetsart',
    thaiName: 'วิศวฯ เกษตรศาสตร์',
    facultyName: 'Dongtan (ดงตาล)',
    badge: 'KU',
    bgGradient: 'from-emerald-600 to-green-800',
    primaryColor: '#16a34a',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    flagEmoji: '🌿',
  },
  cmu: {
    id: 'cmu',
    name: 'Chiang Mai',
    thaiName: 'วิศวฯ เชียงใหม่',
    facultyName: 'Gear 3 (เกียร์ 3)',
    badge: 'CMU',
    bgGradient: 'from-purple-600 to-indigo-800',
    primaryColor: '#9333ea',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    flagEmoji: '🐘',
  },
  kku: {
    id: 'kku',
    name: 'Khon Kaen',
    thaiName: 'วิศวฯ ขอนแก่น',
    facultyName: 'Gear Mo Dindaeng (มอดินแดง)',
    badge: 'KKU',
    bgGradient: 'from-amber-600 to-orange-800',
    primaryColor: '#ea580c',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    flagEmoji: '🧱',
  },
  psu: {
    id: 'psu',
    name: 'Songkla',
    thaiName: 'วิศวฯ สงขลานครินทร์',
    facultyName: 'Gear Dong Yang (ดงยาง)',
    badge: 'PSU',
    bgGradient: 'from-blue-600 to-cyan-800',
    primaryColor: '#2563eb',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    flagEmoji: '🌊',
  },
};

export type Flight = 'A' | 'B' | 'C' | 'D';

export interface FlightInfo {
  flight: Flight;
  name: string;
  defaultHcpRange: [number, number];
  hasAntiSandbagging: boolean;
  description: string;
}

export const FLIGHTS: Record<Flight, FlightInfo> = {
  A: {
    flight: 'A',
    name: 'Flight A (Scratch / Low HCP)',
    defaultHcpRange: [0, 9],
    hasAntiSandbagging: false,
    description: 'แต้มต่อต่ำ เน้น Gross Score ไม่มีกฎ DQ -4 Under',
  },
  B: {
    flight: 'B',
    name: 'Flight B (HCP 10 - 14)',
    defaultHcpRange: [10, 14],
    hasAntiSandbagging: true,
    description: 'แต้มต่อ 10-14 สกอร์สุทธิห้ามต่ำกว่า -4 Under Par (DQ)',
  },
  C: {
    flight: 'C',
    name: 'Flight C (HCP 15 - 19)',
    defaultHcpRange: [15, 19],
    hasAntiSandbagging: true,
    description: 'แต้มต่อ 15-19 สกอร์สุทธิห้ามต่ำกว่า -4 Under Par (DQ)',
  },
  D: {
    flight: 'D',
    name: 'Flight D (HCP 20+)',
    defaultHcpRange: [20, 28],
    hasAntiSandbagging: true,
    description: 'แต้มต่อ 20 ขึ้นไป สกอร์สุทธิห้ามต่ำกว่า -4 Under Par (DQ)',
  },
};

export type ScoreType = 'eagle' | 'birdie' | 'par' | 'bogey' | 'double';

export interface HoleConfig {
  holeNumber: number;
  par: 3 | 4 | 5;
  handicapIndex: number;
}

export interface OpponentLiveState {
  universityId: UniversityId;
  orderNumber: number; // 1, 2, 3, 4, 5
  isFinished: boolean; // ตีจบหลุมไปแล้ว
  finishedScore: ScoreType; // ถ้าจบแล้ว สกอร์อะไร
  // ถ้ายังไม่จบ (ตีหลังเรา):
  currentShotNumber: number; // กำลังจะตีช็อตที่เท่าไหร่ เช่น ช็อต 3 หรือ ช็อต 4
  pendingTargetScore: ScoreType; // กำลังตีเพื่อสกอร์อะไร เช่น Par, Bogey, Birdie
  makeProbabilityPct: number; // โอกาสลงเยอะมั้ย (0-100%) เช่น จ่อ 90%, กลาง 60%, ไกล 25%
  distanceDescription: 'tap_in' | 'close' | 'mid' | 'long' | 'trouble';
}

export interface GameTheoryDecisionResult {
  verdict:
    | 'HUNT_EAGLE'
    | 'HUNT_BIRDIE'
    | 'ATTACK_PAR'
    | 'SAFE_BOGEY'
    | 'DUMP_BULLET'
    | 'DEFEND_DOUBLE'
    | 'DUMP_HANDICAP';
  verdictTitle: string;
  verdictBadge: string;
  badgeBg: string;
  primaryAdvice: string;
  pointSwing: number; // ผลต่างแต้มระหว่างช็อตบุกกับช็อตเซฟ
  expectedPointsIfEagle?: number;
  expectedPointsIfBirdie: number;
  expectedPointsIfPar: number;
  expectedPointsIfBogey: number;
  expectedPointsIfDouble: number;
  bulletCostIfPar: number;
  bulletRefundIfBogey: number;
  bulletStatus: 'SAFE' | 'CAUTION' | 'CRITICAL_DQ_RISK';
  chulaBulletsRemaining: number;
  tacticalReasons: string[];
  scenarioBreakdown: {
    scenario: string;
    probabilityPct: number;
    chulaEaglePoints?: number;
    chulaBirdiePoints?: number;
    chulaParPoints: number;
    chulaBogeyPoints: number;
    netSwing: number;
  }[];
}
