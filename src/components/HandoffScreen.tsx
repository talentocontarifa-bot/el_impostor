import React from 'react';
import { Smartphone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import type { GamePlayer } from '../types/game';
import { soundManager } from '../services/soundService';
import { AVATAR_EMOJIS } from '../constants/avatars';

interface HandoffScreenProps {
  targetPlayer: GamePlayer;
  playerIndex: number;
  totalPlayers: number;
  mode: 'REVEAL' | 'VOTE';
  onConfirmReady: () => void;
}


export const HandoffScreen: React.FC<HandoffScreenProps> = ({
  targetPlayer,
  playerIndex,
  totalPlayers,
  mode,
  onConfirmReady
}) => {
  const emoji = AVATAR_EMOJIS[targetPlayer.avatarIndex % AVATAR_EMOJIS.length];

  const handleStart = () => {
    soundManager.playPop();
    onConfirmReady();
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 flex flex-col items-center justify-between min-h-[500px] animate-in zoom-in-95 duration-200">
      
      {/* Top progress badge */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700">
          Turno {playerIndex + 1} de {totalPlayers} · {mode === 'REVEAL' ? 'Revelación Secreta' : 'Votación Secreta'}
        </span>
      </div>

      {/* Center Handoff Card */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 dark:border-slate-800 shadow-xl shadow-amber-900/5 dark:shadow-none flex flex-col items-center text-center gap-4 my-auto">
        
        {/* Device pass icon animation */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-4xl shadow-xl shadow-indigo-600/30 border-4 border-white dark:border-slate-800 animate-float">
            {emoji}
          </div>
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-amber-400 border-2 border-white dark:border-slate-800 flex items-center justify-center text-slate-900 shadow-md">
            <Smartphone className="w-4 h-4" />
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {mode === 'REVEAL' ? 'Entrega el celular a' : 'Pasa el celular para votar a'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-fun font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            {targetPlayer.name}
          </h2>
        </div>

        {/* Safety Warning */}
        <div className="w-full p-3.5 rounded-2xl bg-amber-50 dark:bg-slate-800/90 border border-amber-200/80 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2.5 text-left">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            {mode === 'REVEAL'
              ? 'Nadie más debe mirar la pantalla. Presiona el botón solo cuando tengas el celular en la mano.'
              : 'Tu voto es 100% secreto. Nadie más debe mirar.'}
          </span>
        </div>
      </div>

      {/* Ready Button */}
      <div className="w-full pt-4">
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-fun font-bold text-lg shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2.5 touch-press transition-all border-2 border-indigo-400/40"
        >
          <ShieldCheck className="w-5 h-5 text-indigo-200" />
          <span>Soy {targetPlayer.name}, ¡estoy listo!</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
