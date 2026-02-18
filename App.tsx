
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

        {/* Center: Game */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2 overflow-hidden">
            <ShoutGame 
                rewards={rewards} 
                onResult={handleShoutResult} 
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
            />
        </div>

        {/* Right Side: Stats & Info */}
        <div className="lg:col-span-3 space-y-4 flex flex-col h-full overflow-hidden order-3">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-xl shadow-2xl flex-shrink-0">
                <div className="flex items-center gap-2 mb-3 text-mpt-yellow font-black uppercase tracking-widest text-[10px]">
                    <TrendingUp size={14} strokeWidth={3} />
                    <span>Fan Energy Stats</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                        <div className="text-[9px] text-mpt-yellow/70 uppercase font-black tracking-widest">Total</div>
                        <div className="text-xl font-black tabular-nums">{history.length}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                        <div className="text-[9px] text-mpt-yellow/70 uppercase font-black tracking-widest">Power Wins</div>
                        <div className="text-xl font-black text-mpt-yellow tabular-nums">
                            {history.filter(h => parseInt(h.amount) >= 10000).length}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 text-gray-800 shadow-2xl border-2 border-white/50 flex-1 overflow-auto custom-scrollbar">
                <h4 className="font-black text-mpt-blue mb-4 uppercase tracking-widest text-xs flex items-center gap-2 shrink-0">
                   <PartyPopper size={16} /> How to win
                </h4>
                <ul className="space-y-3">
                    <li className="flex gap-3 items-start">
                        <div className="bg-mpt-blue text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0">1</div>
                        <p className="text-[11px] font-bold text-gray-600 leading-snug">Click <span className="text-blue-900">START CHALLENGE</span> and allow Mic access.</p>
                    </li>
                    <li className="flex gap-3 items-start">
                        <div className="bg-mpt-blue text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0">2</div>
                        <p className="text-[11px] font-bold text-gray-600 leading-snug">Shout as loud as you can! Higher volume = better prize tiers.</p>
                    </li>
                    <li className="flex gap-3 items-start">
                        <div className="bg-mpt-blue text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0">3</div>
                        <p className="text-[11px] font-bold text-gray-600 leading-snug">Hold your voice in a prize zone for <span className="text-blue-900 underline decoration-mpt-yellow decoration-2">5 SECONDS</span> to win!</p>
                    </li>
                </ul>
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                   <p className="text-[8px] font-black tracking-widest uppercase text-gray-400">© MPT Shout Fan Game 2024</p>
                </div>
            </div>
        </div>
      </main>

      {showWinnerPopup && lastWin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-mpt-blue/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowWinnerPopup(false)} />
            <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border-[6px] border-mpt-yellow animate-in zoom-in duration-300">
                
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-mpt-yellow w-24 h-24 rounded-full border-4 border-white flex items-center justify-center shadow-xl animate-bounce-slow">
                    <Trophy size={48} className="text-blue-900" />
                </div>

                <div className="mt-8 mb-6">
                    <h2 className="text-blue-900 font-black text-4xl tracking-tighter uppercase mb-2 leading-none">VICTORY!</h2>
                    
                    <div className="flex justify-center mb-4 mt-2">
                      <div className="text-8xl leading-none transform hover:rotate-12 transition-transform cursor-pointer drop-shadow-xl">
                        {lastWin.icon}
                      </div>
                    </div>

                    <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4">You claimed the prize</p>
                    
                    <div className="bg-gray-50 py-4 px-4 rounded-2xl border-2 border-gray-100 shadow-inner">
                        <span className="text-blue-900 font-black text-3xl italic tracking-tighter block leading-tight uppercase">
                          {lastWin.title}
                        </span>
                    </div>
                </div>

                <div className="px-1 mb-6">
                  <p className="text-gray-700 font-bold text-base leading-tight">
                    {winnerMessage}
                  </p>
                </div>

                <button 
                    onClick={() => setShowWinnerPopup(false)}
                    className="w-full py-4 bg-mpt-yellow hover:bg-blue-900 hover:text-white text-blue-900 rounded-2xl font-black text-xl uppercase tracking-tighter transition-all shadow-[0_5px_0_#B49400] active:translate-y-1 active:shadow-none"
                >
                    AWESOME!
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
