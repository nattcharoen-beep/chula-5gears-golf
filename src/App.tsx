import React, { useState, useEffect } from 'react';
import { Flight, HoleConfig, ScoreType, UniversityId, OpponentLiveState } from './types/golf';
import { Header } from './components/Header';
import { UnifiedHoleScreen } from './components/UnifiedHoleScreen';
import { ScorecardTable } from './components/ScorecardTable';
import { GroupStandings } from './components/GroupStandings';
import { BulletDashboard } from './components/BulletDashboard';
import { calculateBulletStatus, DEFAULT_18_HOLES } from './utils/bulletManager';
import { HandicapModal } from './components/HandicapModal';
import { Target, Table, Trophy, Shield } from 'lucide-react';

const STORAGE_KEY = 'chula_5gears_golf_state_v3';

const OTHER_UNIVERSITIES: Exclude<UniversityId, 'chula'>[] = ['kasetsart', 'cmu', 'kku', 'psu'];

function createDefaultOpponentsForHole(hIdx: number, scoresRecord: Record<UniversityId, (ScoreType | null)[]>): OpponentLiveState[] {
  return OTHER_UNIVERSITIES.map((u, i) => {
    const sc = scoresRecord[u][hIdx];
    return {
      universityId: u,
      orderNumber: i + 1,
      isFinished: sc !== null,
      finishedScore: sc ?? 'bogey',
      currentShotNumber: 4,
      pendingTargetScore: 'par',
      makeProbabilityPct: 90,
      distanceDescription: 'close',
    };
  });
}

function createDefaultOpponentsMap(scoresRecord: Record<UniversityId, (ScoreType | null)[]>): Record<number, OpponentLiveState[]> {
  const map: Record<number, OpponentLiveState[]> = {};
  for (let h = 1; h <= 18; h++) {
    map[h] = createDefaultOpponentsForHole(h - 1, scoresRecord);
  }
  return map;
}

export const App: React.FC = () => {
  const [flight, setFlight] = useState<Flight>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.flight) return parsed.flight;
      } catch (e) {
        console.error(e);
      }
    }
    return 'C';
  });

  const [handicap, setHandicap] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.handicap === 'number') return parsed.handicap;
      } catch (e) {
        console.error(e);
      }
    }
    return 16;
  });

  // Always start at Hole 1 when entering the app
  const [currentHole, setCurrentHole] = useState<number>(1);

  const [activeTab, setActiveTab] = useState<'hole' | 'scorecard' | 'standings' | 'bullets'>('hole');
  const [holes] = useState<HoleConfig[]>(DEFAULT_18_HOLES);

  // When entering the app, always prompt for handicap first
  const [showHcpModal, setShowHcpModal] = useState<boolean>(true);
  const [isInitialEntry, setIsInitialEntry] = useState<boolean>(true);

  const handleConfirmHcp = (newHcp: number, newFlight: Flight) => {
    setHandicap(newHcp);
    setFlight(newFlight);
    if (isInitialEntry) {
      setCurrentHole(1);
      setIsInitialEntry(false);
    }
    setShowHcpModal(false);
  };

  const handleCloseHcpModal = () => {
    if (isInitialEntry) {
      setCurrentHole(1);
      setIsInitialEntry(false);
    }
    setShowHcpModal(false);
  };

  const [scores, setScores] = useState<Record<UniversityId, (ScoreType | null)[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.scores) return parsed.scores;
      } catch (e) {
        console.error('Failed to load saved scores', e);
      }
    }
    return {
      chula: Array(18).fill(null),
      kasetsart: Array(18).fill(null),
      cmu: Array(18).fill(null),
      kku: Array(18).fill(null),
      psu: Array(18).fill(null),
    };
  });

  // Persistent opponent state for all 18 holes
  const [opponentsByHole, setOpponentsByHole] = useState<Record<number, OpponentLiveState[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.opponentsByHole) return parsed.opponentsByHole;
      } catch (e) {
        console.error('Failed to load saved opponentsByHole', e);
      }
    }
    return createDefaultOpponentsMap(scores);
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        flight,
        handicap,
        currentHole,
        scores,
        opponentsByHole,
      })
    );
  }, [flight, handicap, currentHole, scores, opponentsByHole]);

  // Update Chula or opponent score directly (e.g. from ScorecardTable or Chula score buttons)
  const handleUpdateScore = (universityId: UniversityId, holeIndex: number, score: ScoreType | null) => {
    setScores((prev) => {
      const updatedUniv = [...prev[universityId]];
      updatedUniv[holeIndex] = score;
      return {
        ...prev,
        [universityId]: updatedUniv,
      };
    });

    // If updating an opponent, also update opponentsByHole
    if (universityId !== 'chula') {
      const holeNumber = holeIndex + 1;
      setOpponentsByHole((prev) => {
        const holeList = prev[holeNumber] || createDefaultOpponentsForHole(holeIndex, scores);
        const updatedList = holeList.map((opp) => {
          if (opp.universityId === universityId) {
            return {
              ...opp,
              isFinished: score !== null,
              finishedScore: score ?? opp.finishedScore,
            };
          }
          return opp;
        });
        return {
          ...prev,
          [holeNumber]: updatedList,
        };
      });
    }
  };

  // Update opponent state from UnifiedHoleScreen
  const handleUpdateOpponent = (
    holeNumber: number,
    uId: UniversityId,
    patch: Partial<OpponentLiveState>
  ) => {
    const hIdx = holeNumber - 1;

    let nextIsFinished = false;
    let nextFinishedScore: ScoreType = 'par';

    setOpponentsByHole((prev) => {
      const currentList = prev[holeNumber] || createDefaultOpponentsForHole(hIdx, scores);
      const updatedList = currentList.map((item) => {
        if (item.universityId === uId) {
          const updated = { ...item, ...patch };
          nextIsFinished = updated.isFinished;
          nextFinishedScore = updated.finishedScore;
          return updated;
        }
        return item;
      });
      return {
        ...prev,
        [holeNumber]: updatedList,
      };
    });

    // If finished status or finished score changed, synchronize scores array
    if ('isFinished' in patch || 'finishedScore' in patch) {
      setScores((prevScores) => {
        const updatedUniv = [...prevScores[uId]];
        updatedUniv[hIdx] = nextIsFinished ? nextFinishedScore : null;
        return {
          ...prevScores,
          [uId]: updatedUniv,
        };
      });
    }
  };

  const handleResetRound = () => {
    if (window.confirm('คุณต้องการล้างข้อมูลสกอร์ทั้งหมดในรอบนี้ใช่หรือไม่?')) {
      const emptyScores: Record<UniversityId, (ScoreType | null)[]> = {
        chula: Array(18).fill(null),
        kasetsart: Array(18).fill(null),
        cmu: Array(18).fill(null),
        kku: Array(18).fill(null),
        psu: Array(18).fill(null),
      };
      setScores(emptyScores);
      setOpponentsByHole(createDefaultOpponentsMap(emptyScores));
      setCurrentHole(1);
      setIsInitialEntry(true);
      setShowHcpModal(true);
    }
  };

  const bulletStatus = calculateBulletStatus(
    flight,
    handicap,
    scores.chula,
    holes
  );

  const currentOpponentsLive =
    opponentsByHole[currentHole] || createDefaultOpponentsForHole(currentHole - 1, scores);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Mobile Sticky Header */}
      <Header
        currentHole={currentHole}
        onSelectHole={setCurrentHole}
        flight={flight}
        handicap={handicap}
        onOpenHcpModal={() => {
          setIsInitialEntry(false);
          setShowHcpModal(true);
        }}
        bulletStatus={bulletStatus}
        onResetRound={handleResetRound}
      />

      {/* Mobile-First Big Handicap Setup Modal */}
      <HandicapModal
        isOpen={showHcpModal}
        onClose={handleCloseHcpModal}
        currentHcp={handicap}
        onSelectHcp={handleConfirmHcp}
        canClose={true}
        isInitialEntry={isInitialEntry}
      />

      {/* Main Content Area: Persistent tabs with zero unmounting */}
      <main className="flex-1 p-3 sm:p-4">
        <div className={activeTab === 'hole' ? 'block' : 'hidden'}>
          <UnifiedHoleScreen
            currentHole={currentHole}
            onSelectHole={setCurrentHole}
            holes={holes}
            scores={scores}
            onUpdateScore={handleUpdateScore}
            bulletStatus={bulletStatus}
            flight={flight}
            opponentsLive={currentOpponentsLive}
            onUpdateOpponent={handleUpdateOpponent}
          />
        </div>

        <div className={activeTab === 'scorecard' ? 'block' : 'hidden'}>
          <div className="max-w-2xl mx-auto space-y-4">
            <ScorecardTable
              holes={holes}
              scores={scores}
              onUpdateScore={handleUpdateScore}
              currentHole={currentHole}
              onSelectHole={(h) => {
                setCurrentHole(h);
                setActiveTab('hole');
              }}
            />
          </div>
        </div>

        <div className={activeTab === 'standings' ? 'block' : 'hidden'}>
          <div className="max-w-2xl mx-auto space-y-4">
            <GroupStandings
              holes={holes}
              scores={scores}
              flight={flight}
              handicap={handicap}
            />
          </div>
        </div>

        <div className={activeTab === 'bullets' ? 'block' : 'hidden'}>
          <div className="max-w-2xl mx-auto space-y-4">
            <BulletDashboard bulletStatus={bulletStatus} />
          </div>
        </div>
      </main>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-2 py-1.5 grid grid-cols-4 gap-1 text-center">
          <button
            onClick={() => setActiveTab('hole')}
            className={`py-1.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'hole'
                ? 'bg-pink-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="text-[11px]">ใส่สกอร์/วิเคราะห์</span>
          </button>

          <button
            onClick={() => setActiveTab('scorecard')}
            className={`py-1.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'scorecard'
                ? 'bg-pink-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span className="text-[11px]">สกอร์การ์ด</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`py-1.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'standings'
                ? 'bg-pink-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="text-[11px]">แต้มก๊วน 5 เกียร์</span>
          </button>

          <button
            onClick={() => setActiveTab('bullets')}
            className={`py-1.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'bullets'
                ? 'bg-pink-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-[11px]">คุมแคป (DQ)</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
