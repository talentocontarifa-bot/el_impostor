import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, RefreshCw, ChevronRight, Vote } from 'lucide-react';
import type { GamePlayer } from '../types/game';
import { soundManager } from '../services/soundService';
import { AVATAR_EMOJIS } from '../constants/avatars';

interface BoardPhaseProps {
  players: GamePlayer[];
  category: string;
  onProceedToVoting: () => void;
}

// SVG ring math: r=64, circumference = 2 * π * 64 ≈ 402
const RING_R = 64;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

export const BoardPhase: React.FC<BoardPhaseProps> = ({
  players,
  category,
  onProceedToVoting
}) => {
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [turnsInCurrentRound, setTurnsInCurrentRound] = useState(0);

  const initialDuration = 20;
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  // FIX: Timer does NOT auto-start — player must press ▶ when ready
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const activePlayer = players[currentSpeakerIndex];

  // Announce speaker on turn change (but do NOT auto-start timer)
  useEffect(() => {
    if (activePlayer) {
      soundManager.speak(`Turno de ${activePlayer.name}.`);
    }
    // Reset timer display for new speaker, keep paused
    setTimeLeft(initialDuration);
    setIsRunning(false);
  }, [currentSpeakerIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer engine
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
            soundManager.playBuzzer();
            soundManager.speak('¡Tiempo!');
            return 0;
          }
          if (prev <= 4) soundManager.playTimerTick();
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleNextSpeaker = () => {
    soundManager.playPop();
    const nextIdx = (currentSpeakerIndex + 1) % players.length;
    setCurrentSpeakerIndex(nextIdx);

    const nextTurns = turnsInCurrentRound + 1;
    setTurnsInCurrentRound(nextTurns);
    if (nextTurns >= players.length) {
      setRoundNumber(r => r + 1);
      setTurnsInCurrentRound(0);
    }

    // Timer resets to paused for the next speaker
    setTimeLeft(initialDuration);
    setIsRunning(false);
  };

  const handleSelectSpeaker = (idx: number) => {
    soundManager.playPop();
    setCurrentSpeakerIndex(idx);
    setTimeLeft(initialDuration);
    setIsRunning(false);
  };

  const handleTogglePlay = () => {
    soundManager.playPop();
    if (timeLeft === 0) {
      setTimeLeft(initialDuration);
      setIsRunning(true);
    } else {
      setIsRunning(prev => !prev);
    }
  };

  const handleResetTimer = () => {
    soundManager.playPop();
    setTimeLeft(initialDuration);
    setIsRunning(false);
  };

  // FIX: correct strokeDashoffset using actual circumference
  const ringOffset = RING_CIRCUMFERENCE * (timeLeft / initialDuration);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 animate-in fade-in duration-300">
      
      {/* Category & Round Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border-2 border-amber-200/80 dark:border-slate-800 shadow-md transition-colors">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Tema de la partida
          </span>
          <h2 className="text-lg sm:text-xl font-fun font-bold text-slate-800 dark:text-slate-100">
            {category}
          </h2>
        </div>
        <div className="px-3 py-1.5 rounded-2xl bg-amber-100/70 dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ronda {roundNumber}</span>
        </div>
      </div>

      {/* Main Table with Timer */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-4 border-indigo-500/40 flex flex-col items-center justify-between text-center overflow-hidden min-h-[380px]">
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top label */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-indigo-200 text-sm font-semibold backdrop-blur-sm border border-white/10">
          🎤 Celular al centro de la mesa
        </div>

        {/* Active Speaker with SVG Circular Countdown Ring */}
        <div className="flex flex-col items-center my-auto py-2">
          <div className="relative flex items-center justify-center">
            
            {/* Circular Progress Ring — correctly calculated */}
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 144 144">
              {/* Track */}
              <circle
                cx="72" cy="72" r={RING_R}
                stroke="white" strokeOpacity="0.1"
                strokeWidth="7" fill="transparent"
              />
              {/* Progress */}
              <circle
                cx="72" cy="72" r={RING_R}
                stroke="currentColor"
                strokeWidth="7"
                className={`transition-all duration-1000 ${timeLeft <= 5 ? 'text-red-400' : 'text-amber-400'}`}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Speaker Avatar */}
            <div className="absolute flex flex-col items-center justify-center gap-0.5">
              <span className="text-4xl">
                {AVATAR_EMOJIS[activePlayer?.avatarIndex % AVATAR_EMOJIS.length]}
              </span>
              <span className={`font-mono text-xl font-extrabold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          <span className="text-sm font-bold uppercase tracking-wider text-amber-300 mt-3">
            ¡Es el turno de:
          </span>
          <h3 className="font-fun text-4xl font-bold text-white tracking-wide mt-0.5">
            {activePlayer?.name}
          </h3>
          <p className="text-sm text-indigo-200/90 max-w-xs mt-2 font-medium">
            🗣️ Di <strong>1 sola palabra</strong> relacionada al tema.
          </p>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-3 pt-2 bg-white/10 px-5 py-2.5 rounded-2xl border border-white/15 backdrop-blur-md">
          <button
            onClick={handleTogglePlay}
            className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 touch-press transition-all ${
              isRunning
                ? 'bg-amber-400 text-slate-900 shadow-md'
                : 'bg-emerald-500 text-white shadow-md'
            }`}
          >
            {isRunning ? (
              <><Pause className="w-4 h-4 fill-current" /><span>Pausar</span></>
            ) : (
              <><Play className="w-4 h-4 fill-current" /><span>{timeLeft === initialDuration ? '▶ ¡Listo!' : 'Reanudar'}</span></>
            )}
          </button>

          <button
            onClick={handleResetTimer}
            title="Reiniciar a 20s"
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white touch-press transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Players Row */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border-2 border-amber-200/80 dark:border-slate-800 shadow-md flex items-center gap-2 overflow-x-auto transition-colors">
        {players.map((p, idx) => {
          const isCurrent = idx === currentSpeakerIndex;
          const isDone = idx < turnsInCurrentRound;

          return (
            <div
              key={p.id}
              onClick={() => handleSelectSpeaker(idx)}
              className={`flex-1 min-w-[70px] py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-all border ${
                isCurrent
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                  : isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-amber-200/60 dark:border-slate-700 hover:bg-amber-100/50'
              }`}
            >
              <span className="text-xl">{AVATAR_EMOJIS[p.avatarIndex % AVATAR_EMOJIS.length]}</span>
              <span className="text-xs font-bold truncate max-w-[65px]">{p.name}</span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          onClick={handleNextSpeaker}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fun font-bold text-lg shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 touch-press transition-all border-2 border-indigo-400/30"
        >
          <span>Siguiente Jugador</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            soundManager.playSuspense();
            onProceedToVoting();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-fun font-bold text-lg shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 touch-press transition-all border-2 border-red-400/40"
        >
          <Vote className="w-5 h-5" />
          <span>¡Votar / Acusar!</span>
        </button>
      </div>
    </div>
  );
};
