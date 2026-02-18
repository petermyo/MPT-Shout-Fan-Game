
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
      return "LEGENDARY SHOUT! Your lungs are made of steel! 🌋";
    } else if (volumeLevel >= 60) {
      return "POWERFUL! What a massive performance! 🎤🔥";
    } else if (volumeLevel >= 40) {
      return "FANTASTIC! You really brought the energy! 🥳";
    } else {
      return "GREAT JOB! Every shout is a win. Keep it up! 👍";
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
      <nav className="z-40 bg-white/95 backdrop-blur-md shadow-lg py-3 px-6 flex items-center justify-between border-b-2 border-mpt-yellow shrink-0">
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="MPT Logo" className="h-8 w-auto object-contain" />
          <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>
          <div className="flex items-center gap-2">
            <Mic className="text-blue-900" size={18} />
            <h1 className="text-blue-900 font-black text-xl uppercase tracking-tighter hidden sm:block italic leading-none">MPT Shout Fan Game</h1>
          </div>
        </div>
        <button 
          onClick={() => setShowAdmin(!showAdmin)}
          className="p-2.5 rounded-xl bg-gray-50 hover:bg-mpt-yellow/20 text-blue-900 transition-all active:scale-90 border border-gray-100"
        >
          {showAdmin ? <X size={20} /> : <Settings size={20} />}
        </button>
      </nav>

      <main className="flex-1 overflow-hidden p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left Side: History */}
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

        {/* Right Side: Stats & Info Cards */}
        <div className="lg:col-span-3 space-y-4 flex flex-col h-full overflow-hidden order-3">
            {/* Fan Energy Stats Card - Increased Font Sizes */}
            <div className="bg-white rounded-3xl p-5 border-4 border-mpt-yellow shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex-shrink-0 transform hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3 mb-4 text-blue-900 font-black uppercase tracking-widest text-[12px]">
                    <div className="p-1.5 bg-mpt-yellow rounded-lg">
                      <TrendingUp size={16} strokeWidth={3} />
                    </div>
                    <span>LIVE FAN STATS</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-inner">
                        <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Global Shouts</div>
                        <div className="text-3xl font-black text-blue-900 tabular-nums">{history.length}</div>
                    </div>
                    <div className="bg-blue-900 p-4 rounded-2xl border border-blue-800 flex justify-between items-center shadow-xl">
                        <div className="text-[10px] text-mpt-yellow uppercase font-black tracking-widest">Power Winners</div>
                        <div className="text-3xl font-black text-white tabular-nums drop-shadow-sm">
                            {history.filter(h => parseInt(h.amount) >= 10000 || h.title.includes('GB')).length}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* How to Win Card - More readable and prominent font */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 text-gray-800 shadow-2xl border-b-[6px] border-mpt-yellow flex-1 overflow-auto custom-scrollbar">
                <h4 className="font-black text-mpt-blue mb-6 uppercase tracking-widest text-sm flex items-center gap-3 shrink-0">
                   <div className="p-2 bg-mpt-blue text-white rounded-xl">
                    <PartyPopper size={20} />
                   </div>
                   CHALLENGE RULES
                </h4>
                <ul className="space-y-4">
                    <li className="flex gap-4 items-start group">
                        <div className="bg-mpt-blue text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-lg group-hover:bg-mpt-yellow group-hover:text-blue-900 transition-colors">1</div>
                        <div>
                          <p className="text-[13px] font-black text-blue-900 uppercase tracking-tight leading-none mb-1">Get Ready</p>
                          <p className="text-[12px] font-bold text-gray-500 leading-snug">Tap START and allow mic access to begin your journey.</p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start group">
                        <div className="bg-mpt-blue text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-lg group-hover:bg-mpt-yellow group-hover:text-blue-900 transition-colors">2</div>
                        <div>
                          <p className="text-[13px] font-black text-blue-900 uppercase tracking-tight leading-none mb-1">Unleash Power</p>
                          <p className="text-[12px] font-bold text-gray-500 leading-snug">Shout the keyword. Higher volume unlocks better tier prizes!</p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start group">
                        <div className="bg-mpt-blue text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-lg group-hover:bg-mpt-yellow group-hover:text-blue-900 transition-colors">3</div>
                        <div>
                          <p className="text-[13px] font-black text-blue-900 uppercase tracking-tight leading-none mb-1">Hold Steady</p>
                          <p className="text-[12px] font-bold text-gray-500 leading-snug">Maintain your voice level for <span className="bg-mpt-yellow text-blue-900 px-1.5 py-0.5 rounded font-black">5 SECONDS</span> to claim victory!</p>
                        </div>
                    </li>
                </ul>
                <div className="mt-8 pt-6 border-t border-gray-100 text-center opacity-40">
                   <p className="text-[9px] font-black tracking-widest uppercase text-gray-400">MPT Shout Experience v2.5</p>
                </div>
            </div>
        </div>
      </main>

      {/* Winner Popup */}
      {showWinnerPopup && lastWin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-mpt-blue/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowWinnerPopup(false)} />
            <div className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border-[10px] border-mpt-yellow animate-in zoom-in duration-300">
                
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-mpt-yellow w-28 h-28 rounded-full border-4 border-white flex items-center justify-center shadow-xl animate-bounce-slow">
                    <Trophy size={56} className="text-blue-900" />
                </div>

                <div className="mt-10 mb-8">
                    <h2 className="text-blue-900 font-black text-5xl tracking-tighter uppercase mb-2 leading-none">VICTORY!</h2>
                    
                    <div className="flex justify-center mb-6 mt-4">
                      <div className="text-9xl leading-none transform hover:rotate-6 transition-transform cursor-pointer drop-shadow-2xl">
                        {lastWin.icon}
                      </div>
                    </div>

                    <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">REWARD UNLOCKED</p>
                    
                    <div className="bg-blue-50 py-6 px-4 rounded-3xl border-2 border-blue-100 shadow-inner">
                        <span className="text-blue-900 font-black text-4xl italic tracking-tighter block leading-tight uppercase">
                          {lastWin.title}
                        </span>
                    </div>
                </div>

                <div className="px-2 mb-8">
                  <p className="text-gray-700 font-bold text-lg leading-tight italic">
                    {winnerMessage}
                  </p>
                </div>

                <button 
                    onClick={() => setShowWinnerPopup(false)}
                    className="w-full py-5 bg-mpt-yellow hover:bg-blue-900 hover:text-white text-blue-900 rounded-2xl font-black text-2xl uppercase tracking-tighter transition-all shadow-[0_8px_0_#B49400] active:translate-y-1 active:shadow-none"
                >
                    CLAIM NOW
                </button>
            </div>
        </div>
      )}

      {showAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mpt-blue/90 backdrop-blur-2xl">
          <div className="w-full max-w-2xl h-[90vh] flex flex-col">
             <div className="relative h-full flex flex-col">
                <button 
                  onClick={() => setShowAdmin(false)}
                  className="absolute -top-14 right-0 text-white hover:text-mpt-yellow p-2 transition-transform hover:rotate-90"
                >
                  <X size={40} />
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
