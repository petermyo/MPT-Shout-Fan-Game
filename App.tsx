
import React, { useState, useEffect, useRef } from 'react';
import ShoutGame from './components/ShoutGame';
import HistoryTable from './components/HistoryTable';
import AdminPanel from './components/AdminPanel';
import { dbService } from './services/dbService';
import { ShoutReward, SpinRecord } from './types';
import { INITIAL_REWARDS, COLORS } from './constants';
import { Settings, X, TrendingUp, Trophy, PartyPopper, Mic } from 'lucide-react';
import confetti from 'canvas-confetti';

const WIN_FANFARE_URL = 'https://www.soundjay.com/misc/sounds/bell-ring-01.mp3';
const CONGRATS_MUSIC_URL = 'https://www.soundjay.com/human/sounds/applause-01.mp3'; 
const WOW_SOUND_URL = 'https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3';
const LOGO_URL = 'https://mpt-aws-wp-bucket.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2022/09/23235935/logo-1.webp';

const App: React.FC = () => {
  const [rewards, setRewards] = useState<ShoutReward[]>([]);
  const [history, setHistory] = useState<SpinRecord[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState<string>("");
  const [lastWin, setLastWin] = useState<ShoutReward | null>(null);
  
  const fanfareAudioRef = useRef<HTMLAudioElement | null>(null);
  const congratsMusicRef = useRef<HTMLAudioElement | null>(null);
  const wowAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setRewards(dbService.getRewards());
    setHistory(dbService.getHistory());
    
    fanfareAudioRef.current = new Audio(WIN_FANFARE_URL);
    wowAudioRef.current = new Audio(WOW_SOUND_URL);
    congratsMusicRef.current = new Audio(CONGRATS_MUSIC_URL);
    
    if (congratsMusicRef.current) {
      congratsMusicRef.current.loop = true;
      congratsMusicRef.current.volume = 0.3;
    }
    if (wowAudioRef.current) {
      wowAudioRef.current.volume = 0.7;
    }
  }, []);

  useEffect(() => {
    if (showWinnerPopup) {
      congratsMusicRef.current?.play().catch(() => {});
    } else {
      congratsMusicRef.current?.pause();
      if (congratsMusicRef.current) congratsMusicRef.current.currentTime = 0;
    }
  }, [showWinnerPopup]);

  const triggerConfetti = () => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const getShoutMessage = (reward: ShoutReward) => {
    const volumeLevel = reward.minVolume;
    if (volumeLevel >= 80) {
      return "LEGENDARY PERFORMANCE! 🌋";
    } else if (volumeLevel >= 60) {
      return "MASSIVE ENERGY! 🎤🔥";
    } else if (volumeLevel >= 40) {
      return "FANTASTIC SHOUT! 🥳";
    } else {
      return "GREAT JOB! 👍";
    }
  };

  const handleShoutResult = (winningReward: ShoutReward) => {
    setLastWin(winningReward);
    
    if (fanfareAudioRef.current) {
        fanfareAudioRef.current.currentTime = 0;
        fanfareAudioRef.current.play().catch(() => {});
    }
    
    if (wowAudioRef.current) {
        setTimeout(() => {
          wowAudioRef.current?.play().catch(() => {});
        }, 100);
    }

    triggerConfetti();
    
    const newRecord: SpinRecord = {
      id: Math.random().toString(36).substr(2, 9),
      sliceId: winningReward.id,
      title: winningReward.title,
      amount: winningReward.amount,
      timestamp: Date.now()
    };
    
    const updatedHistory = dbService.addSpinRecord(newRecord);
    setHistory(updatedHistory);
    setWinnerMessage(getShoutMessage(winningReward));
    setShowWinnerPopup(true);
  };

  const updateRewards = (newRewards: ShoutReward[]) => {
    setRewards(newRewards);
    dbService.saveRewards(newRewards);
    setShowAdmin(false);
  };

  const resetRewards = () => {
    if (confirm('Reset all rewards to MPT defaults?')) {
        setRewards(INITIAL_REWARDS);
        dbService.saveRewards(INITIAL_REWARDS);
    }
  };

  const clearHistory = () => {
    if (confirm('Clear winner history and reset stats?')) {
        dbService.clearHistory();
        setHistory([]);
    }
  };

  return (
    <div className="h-screen bg-mpt-blue selection:bg-mpt-yellow selection:text-blue-900 text-white overflow-hidden flex flex-col">
      <nav className="z-40 bg-white/95 backdrop-blur-md shadow-lg py-4 px-8 flex items-center justify-between border-b-2 border-mpt-yellow shrink-0">
        <div className="flex items-center gap-5">
          <img src={LOGO_URL} alt="MPT Logo" className="h-10 w-auto object-contain" />
          <div className="h-10 w-[1px] bg-gray-200 hidden md:block"></div>
          <div className="flex items-center gap-3">
            <Mic className="text-blue-900" size={24} />
            <h1 className="text-blue-900 font-black text-2xl uppercase tracking-tighter hidden sm:block italic leading-none">MPT Shout Fan Game</h1>
          </div>
        </div>
        <button 
          onClick={() => setShowAdmin(!showAdmin)}
          className="p-3 rounded-2xl bg-gray-50 hover:bg-mpt-yellow/20 text-blue-900 transition-all active:scale-90 border border-gray-100"
        >
          {showAdmin ? <X size={28} /> : <Settings size={28} />}
        </button>
      </nav>

      <main className="flex-1 overflow-hidden p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto w-full">
        {/* Left Side: History Table */}
        <div className="lg:col-span-3 h-full overflow-hidden flex flex-col order-2 lg:order-1">
          <HistoryTable history={history} onClear={clearHistory} />
        </div>

        {/* Center: Game Area */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2 overflow-hidden">
            <ShoutGame 
                rewards={rewards} 
                onResult={handleShoutResult} 
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
            />
        </div>

        {/* Right Side: Information Cards */}
        <div className="lg:col-span-3 space-y-4 flex flex-col h-full overflow-hidden order-3">
            {/* Stats Card */}
            <div className="bg-white rounded-[2rem] p-5 border-4 border-mpt-yellow shadow-[0_15px_40px_rgba(0,0,0,0.3)] flex-shrink-0">
                <div className="flex items-center gap-3 mb-4 text-blue-900 font-black uppercase tracking-[0.15em] text-[13px]">
                    <div className="p-1.5 bg-mpt-yellow rounded-lg">
                      <TrendingUp size={18} strokeWidth={3} />
                    </div>
                    <span>LIVE PERFORMANCE STATS</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-inner">
                        <div className="text-[11px] text-gray-400 uppercase font-black tracking-widest">Participants</div>
                        <div className="text-3xl font-black text-blue-900 tabular-nums">{history.length}</div>
                    </div>
                    <div className="bg-blue-900 p-4 rounded-2xl border-blue-800 flex justify-between items-center shadow-xl">
                        <div className="text-[11px] text-mpt-yellow uppercase font-black tracking-widest">Winners</div>
                        <div className="text-3xl font-black text-white tabular-nums drop-shadow-sm">
                            {history.filter(h => parseInt(h.amount) >= 5000 || h.title.includes('GB')).length}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Rules Card - Reduced Padding and Spacing */}
            <div className="bg-white/95 backdrop-blur-md rounded-[2rem] p-5 text-gray-800 shadow-2xl border-b-[6px] border-mpt-yellow flex-1 overflow-auto custom-scrollbar">
                <h4 className="font-black text-mpt-blue mb-4 uppercase tracking-[0.2em] text-[13px] flex items-center gap-3 shrink-0">
                   <div className="p-2 bg-mpt-blue text-white rounded-xl shadow-md">
                    <PartyPopper size={18} />
                   </div>
                   CHALLENGE RULES
                </h4>
                <ul className="space-y-3.5">
                    <li className="flex gap-3 items-start group">
                        <div className="bg-mpt-blue text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-md group-hover:bg-mpt-yellow group-hover:text-blue-900 transition-all">1</div>
                        <div>
                          <p className="text-[14px] font-black text-blue-900 uppercase tracking-tight leading-none mb-1">START</p>
                          <p className="text-[13px] font-bold text-gray-500 leading-tight">Tap START and shout the keyword.</p>
                        </div>
                    </li>
                    <li className="flex gap-3 items-start group">
                        <div className="bg-mpt-blue text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-md group-hover:bg-mpt-yellow group-hover:text-blue-900 transition-all">2</div>
                        <div>
                          <p className="text-[14px] font-black text-blue-900 uppercase tracking-tight leading-none mb-1">HOLD POWER</p>
                          <p className="text-[13px] font-bold text-gray-500 leading-tight">Hold for 5 seconds to win.</p>
                        </div>
                    </li>
                    <li className="flex gap-3 items-start group">
                        <div className="bg-mpt-blue text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-md group-hover:bg-mpt-yellow group-hover:text-blue-900 transition-all">3</div>
                        <div>
                          <p className="text-[14px] font-black text-blue-900 uppercase tracking-tight leading-none mb-1">CLAIM</p>
                          <p className="text-[13px] font-bold text-gray-500 leading-tight">Win rewards based on your volume.</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
      </main>

      {/* Victory Popup - Standard Modal Size */}
      {showWinnerPopup && lastWin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-mpt-blue/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowWinnerPopup(false)} />
            <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border-[8px] border-mpt-yellow animate-in zoom-in duration-300">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-mpt-yellow w-24 h-24 rounded-full border-4 border-white flex items-center justify-center shadow-xl animate-bounce-slow">
                    <Trophy size={48} className="text-blue-900" />
                </div>
                <div className="mt-8 mb-6">
                    <h2 className="text-blue-900 font-black text-3xl tracking-tighter uppercase mb-2 leading-none">VICTORY!</h2>
                    <div className="text-[6rem] leading-none transform hover:scale-110 transition-transform cursor-pointer drop-shadow-xl my-4">
                        {lastWin.icon}
                    </div>
                    <div className="bg-blue-50 py-4 px-3 rounded-2xl border-2 border-blue-100 shadow-inner">
                        <span className="text-blue-900 font-black text-2xl italic tracking-tighter block leading-tight uppercase">
                          {lastWin.title}
                        </span>
                    </div>
                </div>
                <p className="text-gray-700 font-bold text-base italic mb-8">{winnerMessage}</p>
                <button 
                    onClick={() => setShowWinnerPopup(false)}
                    className="w-full py-4 bg-mpt-yellow hover:bg-blue-900 hover:text-white text-blue-900 rounded-2xl font-black text-xl uppercase tracking-tighter transition-all shadow-[0_6px_0_#B49400] active:translate-y-1 active:shadow-none"
                >
                    AWESOME!
                </button>
            </div>
        </div>
      )}

      {showAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-mpt-blue/90 backdrop-blur-3xl">
          <div className="w-full max-w-3xl h-[85vh] flex flex-col">
             <div className="relative h-full flex flex-col">
                <button 
                  onClick={() => setShowAdmin(false)}
                  className="absolute -top-16 right-0 text-white hover:text-mpt-yellow p-4 transition-transform hover:rotate-90"
                >
                  <X size={48} />
                </button>
                <AdminPanel rewards={rewards} onSave={updateRewards} onReset={resetRewards} />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
