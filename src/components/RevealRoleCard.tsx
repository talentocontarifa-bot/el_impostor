import React, { useState } from 'react';
import { EyeOff, Check, Lock, Shield } from 'lucide-react';
import type { GamePlayer } from '../types/game';
import { soundManager } from '../services/soundService';
import { AVATAR_EMOJIS } from '../constants/avatars';

interface RevealRoleCardProps {
  player: GamePlayer;
  category: string;
  secretWord: string;
  comodin: string;
  onFinishReveal: () => void;
  playerIndex: number;
  totalPlayers: number;
}

export const RevealRoleCard: React.FC<RevealRoleCardProps> = ({
  player,
  category,
  secretWord,
  comodin,
  onFinishReveal,
  playerIndex,
  totalPlayers
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleReveal = () => {
    setIsRevealed(prev => !prev);
    soundManager.playFlip();
  };

  const handleDone = () => {
    soundManager.playPop();
    onFinishReveal();
  };

  const emoji = AVATAR_EMOJIS[player.avatarIndex % AVATAR_EMOJIS.length];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="text-center flex flex-col items-center gap-1">
        <span className="text-sm font-bold uppercase tracking-wider px-4 py-1.5 rounded-full bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700">
          Jugador {playerIndex + 1} de {totalPlayers}
        </span>
        <h2 className="text-2xl sm:text-3xl font-fun font-bold text-slate-800 dark:text-slate-100 mt-1">
          👋 Hola, <span className="text-indigo-600 dark:text-indigo-400">{player.name}</span>
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xs flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span>Que nadie más vea la pantalla</span>
        </p>
      </div>

      {/* 3D Flip Card Container */}
      <div className="perspective-1000 w-full min-h-[420px] sm:min-h-[460px] flex">
        <div
          onClick={toggleReveal}
          className={`w-full relative rounded-3xl transition-transform duration-500 transform-style-3d cursor-pointer shadow-xl ${
            isRevealed ? 'rotate-y-180' : ''
          }`}
        >
          
          {/* CARD BACK (LOCKED) */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-950 border-4 border-indigo-500/40 p-6 flex flex-col items-center justify-between text-white backface-hidden shadow-2xl">
            <div className="w-full flex items-center justify-between opacity-80">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Confidencial</span>
              <Lock className="w-4 h-4 text-indigo-300" />
            </div>

            <div className="flex flex-col items-center text-center gap-4 my-auto">
              <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-5xl shadow-inner animate-float">
                🤫
              </div>
              <div>
                <div className="text-4xl mb-1">{emoji}</div>
                <h3 className="font-fun text-2xl font-bold text-white">
                  {player.name}
                </h3>
                <p className="text-sm text-indigo-200/90 mt-1 font-medium max-w-[220px]">
                  ¡Toca la tarjeta para ver tu rol!
                </p>
              </div>
            </div>

            <div className="w-full py-3.5 rounded-2xl bg-white/10 backdrop-blur-md text-center text-sm font-bold tracking-wide uppercase border border-white/20 flex items-center justify-center gap-2">
              👆 Tocar para Revelar
            </div>
          </div>

          {/* CARD FRONT (STEALTH REVEAL) */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-5 flex flex-col items-center justify-between rotate-y-180 backface-hidden shadow-2xl border-4 bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 border-indigo-500/40 text-white">
            
            {/* Header info */}
            <div className="w-full flex items-center justify-between border-b border-indigo-800/60 pb-3">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Categoría
                </span>
                <span className="text-base font-fun font-bold text-white">
                  {category}
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-200">
                Tu Rol
              </span>
            </div>

            {/* Role specific content */}
            <div className="flex flex-col items-center text-center gap-3 my-auto w-full">
              
              {/* 1. CLASICO IMPOSTOR */}
              {player.role === 'IMPOSTOR' && (
                <>
                  <div className="text-6xl">🕵️</div>
                  <div>
                    <h3 className="font-fun text-2xl sm:text-3xl font-bold text-amber-300 tracking-wide">
                      ¡ERES EL IMPOSTOR!
                    </h3>
                    <p className="text-sm text-indigo-200/80 mt-1 font-medium">
                      No conoces la palabra secreta.
                    </p>
                  </div>
                  <div className="w-full bg-indigo-950/90 rounded-2xl p-4 border-2 border-amber-500/40 shadow-inner">
                    <span className="text-xs font-bold uppercase text-amber-300 tracking-wider block mb-1">
                      ✨ Tu Pista (Comodín)
                    </span>
                    <p className="text-3xl font-fun font-bold text-white">
                      {comodin}
                    </p>
                  </div>
                  <p className="text-xs text-indigo-200/80 font-medium leading-snug max-w-xs">
                    💡 Escucha a los demás y di algo que encaje. ¡No te descubran!
                  </p>
                </>
              )}

              {/* 2. UNDERCOVER (SIMILAR WORD) */}
              {player.role === 'UNDERCOVER' && (
                <>
                  <div className="text-6xl">🎭</div>
                  <div>
                    <h3 className="font-fun text-2xl sm:text-3xl font-bold text-purple-300 tracking-wide">
                      ¡DOBLE AGENTE!
                    </h3>
                    <p className="text-sm text-indigo-200/80 mt-1 font-medium">
                      Tu palabra es diferente a la de los demás.
                    </p>
                  </div>
                  <div className="w-full bg-indigo-950/90 rounded-2xl p-4 border-2 border-purple-500/40 shadow-inner">
                    <span className="text-xs font-bold uppercase text-purple-300 tracking-wider block mb-1">
                      🔑 Tu Palabra
                    </span>
                    <p className="text-3xl font-fun font-bold text-white">
                      {player.assignedWord}
                    </p>
                  </div>
                  <p className="text-xs text-indigo-200/80 font-medium leading-snug max-w-xs">
                    💡 Si notas que los demás hablan de algo distinto… ¡podrías ser el infiltrado!
                  </p>
                </>
              )}

              {/* 3. BROMISTA (JESTER) */}
              {player.role === 'BROMISTA' && (
                <>
                  <div className="text-6xl">🃏</div>
                  <div>
                    <h3 className="font-fun text-2xl sm:text-3xl font-bold text-yellow-300 tracking-wide">
                      ¡ERES EL BROMISTA!
                    </h3>
                    <p className="text-sm text-indigo-200/80 mt-1 font-medium">
                      Conoces la palabra, pero juegas solo.
                    </p>
                  </div>
                  <div className="w-full bg-indigo-950/90 rounded-2xl p-3.5 border-2 border-yellow-500/40 shadow-inner">
                    <span className="text-xs font-bold uppercase text-yellow-300 tracking-wider block mb-1">
                      🔑 Palabra de la Tripulación
                    </span>
                    <p className="text-3xl font-fun font-bold text-white">
                      {player.assignedWord}
                    </p>
                  </div>
                  <p className="text-xs text-yellow-200/90 font-medium leading-snug max-w-xs">
                    🎯 <strong>¡Actúa sospechoso!</strong> Si te votan y expulsan, ¡TÚ ganas! (+5 pts)
                  </p>
                </>
              )}

              {/* 4. TRIPULANTE — now correctly shows secretWord */}
              {player.role === 'TRIPULANTE' && (
                <>
                  <div className="text-6xl">🧑‍🚀</div>
                  <div>
                    <h3 className="font-fun text-2xl sm:text-3xl font-bold text-emerald-300 tracking-wide">
                      ¡ERES TRIPULANTE!
                    </h3>
                    <p className="text-sm text-indigo-200/80 mt-1 font-medium">
                      ¡Descubran quién es el infiltrado!
                    </p>
                  </div>
                  <div className="w-full bg-indigo-950/90 rounded-2xl p-4 border-2 border-emerald-500/40 shadow-inner">
                    <span className="text-xs font-bold uppercase text-emerald-300 tracking-wider block mb-1">
                      🔑 Palabra Secreta
                    </span>
                    <p className="text-3xl font-fun font-bold text-white">
                      {secretWord}
                    </p>
                  </div>
                  <p className="text-xs text-indigo-200/80 font-medium leading-snug max-w-xs">
                    💡 Di una pista relacionada sin decir la palabra. ¡Encuentra al impostor!
                  </p>
                </>
              )}
            </div>

            {/* Tap to hide */}
            <div className="text-xs font-semibold text-indigo-300/80 flex items-center gap-1 pt-2 border-t border-indigo-800/60 w-full justify-center">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Toca la pantalla para ocultar</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDone}
        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fun font-bold text-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 touch-press transition-all border-2 border-indigo-400/30"
      >
        <Check className="w-5 h-5" />
        <span>¡Listo! Pasar al siguiente</span>
      </button>
    </div>
  );
};
