
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ShoutReward } from '../types';
import { COLORS, KEYWORDS } from '../constants';
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
  const [holdTime, setHoldTime] = useState(0); // in milliseconds
  const [micError, setMicError] = useState<string | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState("");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  const winRef = useRef(false);

  const WIN_DURATION = 5000; // Updated to 5 seconds

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      // Select random keyword
      const randomIdx = Math.floor(Math.random() * KEYWORDS.length);
      setCurrentKeyword(KEYWORDS[randomIdx]);
      
      setIsPlaying(true);
      setMicError(null);
      winRef.current = false;
      setHoldTime(0);
    } catch (err) {
      setMicError("Microphone access denied. Please enable mic to play!");
    }
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
    // Boost sensitivity slightly for gameplay feel
    const vol = Math.min(100, Math.round((average / 110) * 100));
    setVolume(vol);

    // Find current reward tier
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
      {/* Background Ambience */}
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
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-mpt-yellow relative">
            <Mic size={48} className="text-mpt-blue" />
            <div className="absolute inset-0 rounded-full border-4 border-mpt-yellow animate-ping opacity-25" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic leading-none">The Shout Challenge</h2>
          <p className="text-mpt-yellow font-bold text-sm mb-6 max-w-xs mx-auto uppercase tracking-wide">
            Shout as loud as you can for 5 seconds to win!
          </p>
          
          {micError && <p className="text-red-400 font-black text-[10px] mb-4 uppercase">{micError}</p>}
          
          <button
            onClick={startMic}
            className="group px-8 py-4 bg-mpt-yellow text-blue-900 rounded-full font-black text-xl uppercase tracking-tighter shadow-[0_6px_0_#B49400] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-3 mx-auto"
          >
            <Zap size={20} className="group-hover:animate-pulse" /> START CHALLENGE
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4 py-2">
          {/* Keyword Prompt - Reduced Size */}
          <div className="text-center bg-white rounded-2xl p-4 shadow-xl border-4 border-mpt-yellow transform -rotate-1 mx-auto max-w-sm">
             <p className="text-[10px] font-black text-blue-900/50 uppercase tracking-[0.2em] mb-0.5">SHOUT THIS NOW:</p>
             <h3 className="text-3xl font-black text-blue-900 uppercase italic tracking-tighter animate-pulse">
               "{currentKeyword}"
             </h3>
          </div>

          <div className="flex gap-4 items-stretch max-h-[400px]">
            {/* Vertical Power Meter Indicator */}
            <div className="w-12 bg-white/10 rounded-2xl border-2 border-white/20 relative overflow-hidden flex flex-col justify-end p-1 shadow-inner">
               <div 
                 className="w-full rounded-xl transition-all duration-100 ease-out shadow-[0_0_20px_rgba(255,209,0,0.6)]"
                 style={{ 
                   height: `${volume}%`, 
                   backgroundColor: volume > 80 ? COLORS.DANGER : volume > 50 ? COLORS.MPT_YELLOW : COLORS.WHITE,
                   boxShadow: `0 0 ${volume/3}px ${volume > 50 ? COLORS.MPT_YELLOW : '#FFF'}`
                 }}
               />
               <div className="absolute inset-x-0 bottom-2 text-center pointer-events-none">
                  <span className="text-[8px] font-black text-blue-900 bg-white/90 px-1 rounded">{volume}%</span>
               </div>
               
               {/* Tier markers on the gauge */}
               {sortedRewards.map(r => (
                 <div 
                   key={r.id} 
                   className="absolute w-full border-t border-white/20" 
                   style={{ bottom: `${r.minVolume}%` }}
                 />
               ))}
            </div>

            {/* Reward Ladder - Compacted */}
            <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
              {sortedRewards.map((reward) => {
                const isActive = targetReward?.id === reward.id;
                const progress = isActive ? (holdTime / WIN_DURATION) * 100 : 0;
                
                return (
                  <div 
                    key={reward.id} 
                    className={`relative p-2.5 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                      isActive 
                        ? 'bg-white scale-[1.02] border-mpt-yellow shadow-lg z-10' 
                        : 'bg-white/5 border-white/10 opacity-30'
                    }`}
                  >
                    {/* Progress bar background for active tier */}
                    {isActive && (
                      <div 
                        className="absolute inset-0 bg-mpt-yellow/20 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl drop-shadow-sm">{reward.icon}</span>
                        <div>
                          <h4 className={`font-black uppercase tracking-tighter text-sm leading-tight ${isActive ? 'text-blue-900' : 'text-white'}`}>
                            {reward.title}
                          </h4>
                          <p className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-700' : 'text-white/40'}`}>
                            Goal: {reward.minVolume}% Intensity
                          </p>
                        </div>
                      </div>
                      {isActive && (
                         <div className="flex flex-col items-end">
                            <div className="text-blue-900 font-black text-[9px] animate-pulse">HOLDING!</div>
                            <div className="h-1 w-10 bg-gray-200 rounded-full mt-0.5 overflow-hidden">
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

          <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-2">
               <div className="p-1.5 bg-mpt-yellow rounded-lg text-blue-900">
                  <Volume2 size={18} />
               </div>
               <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-mpt-yellow">Mic</p>
                  <p className="text-lg font-black leading-none">{volume}%</p>
               </div>
            </div>
            
            <div className="flex items-center gap-2 text-right">
               <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-mpt-yellow">Timer</p>
                  <p className="text-lg font-black leading-none">{(holdTime / 1000).toFixed(1)}s / 5s</p>
               </div>
               <div className="p-1.5 bg-white rounded-lg text-blue-900">
                  <Timer size={18} className={holdTime > 0 ? "animate-pulse" : ""} />
               </div>
            </div>
          </div>

          <button
            onClick={() => setIsPlaying(false)}
            className="w-full py-1 text-white/30 font-black uppercase tracking-[0.2em] text-[8px] hover:text-white transition-colors"
          >
            [ CANCEL ]
          </button>
        </div>
      )}
    </div>
  );
};

export default ShoutGame;
