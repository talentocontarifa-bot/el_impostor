import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, Pause, RotateCcw, RefreshCw, ChevronRight, Vote } from 'lucide-react';
import type { GamePlayer } from '../types/game';
import { soundManager } from '../services/soundService';

interface BoardPhaseProps {
  players: GamePlayer[];
  category: string;
  onProceedToVoting: () => void;
}

const AVATAR_EMOJIS = ['👨‍🚀', '🕵️‍♀️', '🧙‍♂️', '🦸‍♂️', '🥷', '🤖', '🦊', '🐼', '🦁', '🦉'];

export const BoardPhase: React.FC<BoardPhaseProps> = ({
  players,
  category,
  onProceedToVoting
}) => {
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [turnsInCurrentRound, setTurnsInCurrentRound] = useState(0);

  // Timer Configuration & State (Starts running automatically!)
  const initialDuration = 20;
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(true);
  const timerRef = useRef<number | null>(null);

  const activePlayer = players[currentSpeakerIndex];

  // Announce active speaker when turn changes & auto-start timer
  useEffect(() => {
    if (activePlayer) {
      soundManager.speak(`Turno de ${activePlayer.name}.`);
    }
  }, [currentSpeakerIndex]);

  // Robust Timer Engine using setInterval + useRef
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
            soundManager.playBuzzer();
            soundManager.speak("¡Tiempo!");
            return 0;
          }
          if (prev <= 4) {
            soundManager.playTimerTick();
          }
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const handleNextSpeaker = () => {
    soundManager.playPop();
    const nextIdx = (currentSpeakerIndex + 1) % players.length;
    setCurrentSpeakerIndex(nextIdx);

    const nextTurns = turnsInCurrentRound + 1;
    setTurnsInCurrentRound(nextTurns);

    if (nextTurns >= players.length) {
      setRoundNumber((r) => r + 1);
      setTurnsInCurrentRound(0);
    }

    // Auto-restart timer immediately for next speaker
    setTimeLeft(initialDuration);
    setIsRunning(true);
  };

  const handleSelectSpeaker = (idx: number) => {
    soundManager.playPop();
    setCurrentSpeakerIndex(idx);
    setTimeLeft(initialDuration);
    setIsRunning(true);
  };

  const handleTogglePlay = () => {
    soundManager.playPop();
    if (timeLeft === 0) {
      setTimeLeft(initialDuration);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleResetTimer = () => {
    soundManager.playPop();
    setTimeLeft(initialDuration);
    setIsRunning(true);
  };

  const progressPercent = ((initialDuration - timeLeft) / initialDuration) * 100;
  const strokeDashoffset = 100 - progressPercent;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 animate-in fade-in duration-300">
      
      {/* Category & Round Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border-2 border-amber-200/80 dark:border-slate-800 shadow-md shadow-amber-900/5 dark:shadow-none transition-colors">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Categoría en Juego
          </span>
          <h2 className="text-lg sm:text-xl font-fun font-bold text-slate-800 dark:text-slate-100">
            {category}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-amber-100/70 dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Ronda {roundNumber}</span>
          </div>
        </div>
      </div>

      {/* Main Table Center Piece with Auto-Starting Animated Timer */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-4 border-indigo-500/40 flex flex-col items-center justify-between text-center overflow-hidden min-h-[360px]">
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top banner */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm border border-white/10">
          <Mic className="w-3.5 h-3.5 text-amber-300" />
          <span>Celular al centro de la mesa</span>
        </div>

        {/* Active Speaker with SVG Circular Countdown Ring */}
        <div className="flex flex-col items-center my-auto py-2">
          <div className="relative flex items-center justify-center">
            
            {/* Circular Progress Ring */}
            <svg className="w-36 h-36 -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="currentColor"
                strokeWidth="6"
                className="text-white/10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="currentColor"
                strokeWidth="6"
                className={`transition-all duration-1000 ${
                  timeLeft <= 5 ? 'text-red-500' : 'text-amber-400'
                }`}
                strokeDasharray="402"
                strokeDashoffset={(strokeDashoffset / 100) * 402}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Speaker Avatar */}
            <div className="absolute w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 to-indigo-400 border-4 border-white text-5xl flex items-center justify-center shadow-xl shadow-indigo-500/40">
              {AVATAR_EMOJIS[activePlayer?.avatarIndex % AVATAR_EMOJIS.length]}
            </div>

            {/* Status indicator */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md">
              <Mic className="w-4 h-4 text-white animate-pulse" />
            </div>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 mt-3">
            Turno de hablar:
          </span>
          <h3 className="font-fun text-3xl font-bold text-white tracking-wide mt-0.5">
            {activePlayer?.name}
          </h3>

          <p className="text-xs text-indigo-200/90 max-w-xs mt-1.5 font-medium">
            🗣️ Di en voz alta <strong>1 sola palabra</strong> relacionada a la categoría.
          </p>
        </div>

        {/* Timer Controls Bar */}
        <div className="flex items-center gap-2 pt-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/15 backdrop-blur-md">
          <button
            onClick={handleTogglePlay}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 touch-press transition-all ${
              isRunning
                ? 'bg-amber-400 text-slate-900 shadow-md'
                : 'bg-emerald-500 text-white shadow-md'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Reanudar</span>
              </>
            )}
          </button>

          <span className={`font-mono text-base font-bold px-2.5 py-0.5 rounded-lg ${
            timeLeft <= 5 ? 'text-red-400 animate-pulse bg-red-950/60' : 'text-white'
          }`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </span>

          <button
            onClick={handleResetTimer}
            title="Reiniciar a 20s"
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white touch-press transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Players Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border-2 border-amber-200/80 dark:border-slate-800 shadow-md shadow-amber-900/5 dark:shadow-none flex items-center gap-2 overflow-x-auto transition-colors">
        {players.map((p, idx) => {
          const isCurrent = idx === currentSpeakerIndex;
          const isDone = idx < turnsInCurrentRound;

          return (
            <div
              key={p.id}
              onClick={() => handleSelectSpeaker(idx)}
              className={`flex-1 min-w-[70px] py-2 px-2 rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-all border ${
                isCurrent
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                  : isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-amber-200/60 dark:border-slate-700 hover:bg-amber-100/50'
              }`}
            >
              <span className="text-lg">
                {AVATAR_EMOJIS[p.avatarIndex % AVATAR_EMOJIS.length]}
              </span>
              <span className="text-[11px] font-bold truncate max-w-[65px]">
                {p.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          onClick={handleNextSpeaker}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fun font-bold text-base shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 touch-press transition-all border-2 border-indigo-400/30"
        >
          <span>Siguiente Jugador (20s)</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            soundManager.playSuspense();
            onProceedToVoting();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-fun font-bold text-base shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 touch-press transition-all border-2 border-red-400/40"
        >
          <Vote className="w-5 h-5" />
          <span>¡Ir a Votación / Acusar!</span>
        </button>
      </div>
    </div>
  );
};
