
import React, { useEffect, useRef, useState } from 'react';
import { ShoutReward } from '../types';
import { COLORS, KEYWORDS, SOUNDS } from '../constants';
import { Mic, Volume2, Timer, Zap } from 'lucide-react';

interface ShoutGameProps {
  rewards: ShoutReward[];
  onResult: (reward: ShoutReward) => void;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
}

const ShoutGame: React.FC<ShoutGameProps> = ({ rewards, onResult, isPlaying, setIsPlaying }) => {
  const [volume, setVolume] = useState(0);
  const [targetReward, setTargetReward] = useState<ShoutReward | null>(null);
  const [holdTime, setHoldTime] = useState(0); 
  const [micError, setMicError] = useState<string | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  const winRef = useRef(false);
  const tinSoundRef = useRef<HTMLAudioElement | null>(null);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);

  const WIN_DURATION = 5000;

  useEffect(() => {
    tinSoundRef.current = new Audio(SOUNDS.TIN);
    startSoundRef.current = new Audio(SOUNDS.START);
  }, []);

  const playSound = (audio: HTMLAudioElement | null) => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  const startMic = async () => {
    try {
      // Pre-check permissions
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const randomIdx = Math.floor(Math.random() * KEYWORDS.length);
      setCurrentKeyword(KEYWORDS[randomIdx]);
      
      setIsPreparing(true);
      setCountdown(3);
      playSound(tinSoundRef.current);
    } catch (err) {
      setMicError("Microphone access denied. Please enable mic to play!");
    }
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        playSound(tinSoundRef.current);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      const timer = setTimeout(() => {
        playSound(startSoundRef.current);
        setCountdown(-1); // Use -1 to show "SHOUT!"
        initAudio();
        
        // Hide preparation overlay after a brief flash of "SHOUT!"
        setTimeout(() => {
          setIsPreparing(false);
          setCountdown(null);
        }, 1000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const initAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;
    
    setIsPlaying(true);
    setMicError(null);
    winRef.current = false;
    setHoldTime(0);
  };

  const update = (time: number) => {
    if (!analyserRef.current || !isPlaying || winRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    const vol = Math.min(100, Math.round((average / 115) * 100));
    setVolume(vol);

    const activeReward = [...rewards].reverse().find(r => vol >= r.minVolume && vol <= r.maxVolume);
    setTargetReward(activeReward || null);

    if (activeReward) {
      const deltaTime = time - (lastTimeRef.current || time);
      setHoldTime(prev => {
        const next = prev + deltaTime;
        if (next >= WIN_DURATION && !winRef.current) {
          winRef.current = true;
          onResult(activeReward);
          setIsPlaying(false);
          return WIN_DURATION;
        }
        return next;
      });
    } else {
      setHoldTime(0);
    }

    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      setVolume(0);
      setHoldTime(0);
      setTargetReward(null);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, rewards]);

  const sortedRewards = [...rewards].sort((a, b) => b.minVolume - a.minVolume);

  return (
    <div className="relative flex flex-col items-center w-full max-w-xl px-4 overflow-hidden">
      {/* PREPARATION & COUNTDOWN OVERLAY */}
      {isPreparing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-blue-900/80 backdrop-blur-md p-6">
          <div className="bg-white rounded-[3rem] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-[10px] border-mpt-yellow max-w-sm w-full animate-in zoom-in duration-300">
            <p className="text-gray-400 font-black text-sm uppercase tracking-[0.3em] mb-4">GET READY TO WIN</p>
            <h3 className="text-blue-900 font-black text-2xl uppercase tracking-tighter mb-1 leading-none italic">SHOUT THIS NOW:</h3>
            <div className="bg-mpt-yellow/10 py-4 px-2 rounded-2xl border-2 border-mpt-yellow/20 mb-8 mt-2">
               <h2 className="text-5xl font-black text-blue-900 uppercase italic tracking-tighter animate-pulse leading-none">
                 "{currentKeyword}"
               </h2>
            </div>
            
            <div className="flex justify-center items-center h-32">
              {countdown !== null && countdown > 0 && (
                <div key={countdown} className="text-blue-900 font-black text-8xl animate-in zoom-in duration-300">
                  {countdown}
                </div>
              )}
              {countdown === -1 && (
                <div className="text-mpt-blue font-black text-7xl italic animate-bounce leading-none">
                  SHOUT!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Background Visualizer */}
      <div className="absolute inset-0 -z-10 opacity-10 flex items-center justify-center overflow-hidden pointer-events-none">
         <div className="flex gap-2 items-end h-64">
           {[...Array(20)].map((_, i) => (
             <div 
               key={i} 
               className="w-2 bg-white rounded-t-full transition-all duration-75"
               style={{ height: `${Math.random() * volume + 5}%`, opacity: volume / 100 }}
             />
           ))}
         </div>
      </div>

      {!isPlaying ? (
        <div className="text-center py-8 animate-in fade-in zoom-in duration-500 w-full">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-mpt-yellow relative">
            <Mic size={56} className="text-mpt-blue" />
            <div className="absolute inset-0 rounded-full border-4 border-mpt-yellow animate-ping opacity-25" />
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 italic leading-none">The Shout Challenge</h2>
          <p className="text-mpt-yellow font-bold text-base mb-8 max-w-xs mx-auto uppercase tracking-wide">
            Shout as loud as you can for 5 seconds to win!
          </p>
          
          {micError && <p className="text-red-400 font-black text-xs mb-4 uppercase">{micError}</p>}
          
          <button
            onClick={startMic}
            disabled={isPreparing}
            className="group px-12 py-6 bg-mpt-yellow text-blue-900 rounded-full font-black text-2xl uppercase tracking-tighter shadow-[0_8px_0_#B49400] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-4 mx-auto disabled:opacity-50"
          >
            <Zap size={28} className="group-hover:animate-pulse" /> START CHALLENGE
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4 py-2">
          {/* Main HUD: Status info moved to top to save space */}
          <div className="flex justify-between items-center bg-white rounded-[1.5rem] p-4 border-2 border-mpt-yellow shadow-2xl">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-mpt-yellow rounded-xl text-blue-900 shadow-sm">
                  <Volume2 size={20} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-900/50 leading-none mb-1">VOICE POWER</p>
                  <p className="text-2xl font-black leading-none text-blue-900">{volume}%</p>
               </div>
            </div>

            {/* Compact Indicator for active keyword during play */}
            <div className="hidden sm:flex flex-col items-center">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">TARGET:</span>
                <span className="text-blue-900 font-black text-xs uppercase italic tracking-tighter">{currentKeyword}</span>
            </div>
            
            <div className="flex items-center gap-3 text-right">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-900/50 leading-none mb-1">HOLD TIMER</p>
                  <p className="text-2xl font-black leading-none text-blue-900">{(holdTime / 1000).toFixed(1)}s <span className="text-sm text-blue-900/30 font-bold">/ 5s</span></p>
               </div>
               <div className="p-2.5 bg-blue-900 rounded-xl text-white shadow-sm">
                  <Timer size={20} className={holdTime > 0 ? "animate-pulse" : ""} />
               </div>
            </div>
          </div>

          <div className="flex gap-4 items-stretch h-[420px]">
            {/* Vertical Power Meter */}
            <div className="w-14 bg-white/10 rounded-2xl border-2 border-white/15 relative overflow-hidden flex flex-col justify-end p-1.5 shadow-inner">
               <div 
                 className="w-full rounded-xl transition-all duration-100 ease-out"
                 style={{ 
                   height: `${volume}%`, 
                   backgroundColor: volume > 90 ? COLORS.DANGER : volume > 60 ? COLORS.MPT_YELLOW : COLORS.WHITE,
                   boxShadow: volume > 40 ? `0 0 25px ${volume > 70 ? COLORS.MPT_YELLOW : '#FFF'}` : 'none'
                 }}
               />
               <div className="absolute inset-x-0 bottom-3 text-center pointer-events-none">
                  <span className="text-[10px] font-black text-blue-900 bg-white/95 px-1.5 py-0.5 rounded leading-none shadow-sm">{volume}%</span>
               </div>
               
               {sortedRewards.map(r => (
                 <div 
                   key={r.id} 
                   className="absolute w-full border-t border-white/20" 
                   style={{ bottom: `${r.minVolume}%` }}
                 />
               ))}
            </div>

            {/* Reward Ladder */}
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
              {sortedRewards.map((reward) => {
                const isActive = targetReward?.id === reward.id;
                const progress = isActive ? (holdTime / WIN_DURATION) * 100 : 0;
                
                return (
                  <div 
                    key={reward.id} 
                    className={`relative p-3 rounded-2xl border-2 transition-all duration-300 overflow-hidden min-h-[60px] flex items-center ${
                      isActive 
                        ? 'bg-white scale-[1.01] border-mpt-yellow shadow-xl z-10' 
                        : 'bg-white/5 border-white/10 opacity-40'
                    }`}
                  >
                    {isActive && (
                      <div 
                        className="absolute inset-0 bg-mpt-yellow/20 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                    
                    <div className="relative flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl drop-shadow-sm filter grayscale-[0.2]">{reward.icon}</span>
                        <div>
                          <h4 className={`font-black uppercase tracking-tighter text-lg leading-tight ${isActive ? 'text-blue-900' : 'text-white'}`}>
                            {reward.title}
                          </h4>
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-blue-700/60' : 'text-white/30'}`}>
                            {reward.minVolume}% INTENSITY
                          </p>
                        </div>
                      </div>
                      {isActive && (
                         <div className="flex flex-col items-end">
                            <div className="text-blue-900 font-black text-[10px] animate-pulse tracking-widest mb-1 leading-none">ACTIVE</div>
                            <div className="h-2 w-16 bg-blue-900/10 rounded-full overflow-hidden border border-blue-900/10">
                               <div className="h-full bg-blue-900 transition-all duration-100" style={{ width: `${progress}%` }} />
                            </div>
                         </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setIsPlaying(false)}
            className="w-full py-2 text-white/30 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-colors border-t border-white/10 mt-2"
          >
            [ STOP THE CHALLENGE ]
          </button>
        </div>
      )}
    </div>
  );
};

export default ShoutGame;
