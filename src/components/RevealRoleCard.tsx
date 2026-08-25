import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, Check, Lock, Shield } from 'lucide-react';
import type { GamePlayer } from '../types/game';
import { soundManager } from '../services/soundService';

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
  comodin,
  onFinishReveal,
  playerIndex,
  totalPlayers
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleReveal = () => {
    const next = !isRevealed;
    setIsRevealed(next);
    soundManager.playFlip();
  };

  const handleDone = () => {
    soundManager.playPop();
    onFinishReveal();
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="text-center flex flex-col items-center gap-1">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700">
          Jugador {playerIndex + 1} de {totalPlayers}
        </span>
        <h2 className="text-2xl font-fun font-bold text-slate-800 dark:text-slate-100 mt-1">
          Pasa el celular a <span className="text-indigo-600 dark:text-indigo-400 underline decoration-wavy decoration-indigo-300">{player.name}</span>
        </h2>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xs flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span>Pantalla con protección anti-reflejo</span>
        </p>
      </div>

      {/* 3D Flip Card Container */}
      <div className="perspective-1000 w-full min-h-[410px] sm:min-h-[450px] flex">
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

            <div className="flex flex-col items-center text-center gap-3 my-auto">
              <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl shadow-inner animate-float">
                🤫
              </div>
              <div>
                <h3 className="font-fun text-2xl font-bold text-white">
                  {player.name}
                </h3>
                <p className="text-xs text-indigo-200/90 mt-1 font-medium max-w-[240px]">
                  Toca la tarjeta para voltearla y descubrir tu rol secreto
                </p>
              </div>
            </div>

            <div className="w-full py-3 rounded-2xl bg-white/10 backdrop-blur-md text-center text-xs font-bold tracking-wide uppercase border border-white/20 flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Tocar para Revelar</span>
            </div>
          </div>

          {/* CARD FRONT (STEALTH REVEAL) */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col items-center justify-between rotate-y-180 backface-hidden shadow-2xl border-4 bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 border-indigo-500/40 text-white">
            
            {/* Header info */}
            <div className="w-full flex items-center justify-between border-b border-indigo-800/60 pb-3">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Categoría
                </span>
                <span className="text-sm font-fun font-bold text-white">
                  {category}
                </span>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-200">
                Rol Secreto
              </span>
            </div>

            {/* Role specific content */}
            <div className="flex flex-col items-center text-center gap-3 my-auto w-full">
              
              {/* 1. CLASICO IMPOSTOR */}
              {player.role === 'IMPOSTOR' && (
                <>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-indigo-400/40 bg-indigo-950/80">
                    <img src="/assets/impostor.jpg" alt="Rol" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-fun text-xl sm:text-2xl font-bold text-amber-300 tracking-wide">
                      🕵️ ¡ERES EL IMPOSTOR!
                    </h3>
                    <p className="text-xs text-indigo-200/80 mt-0.5 font-medium">
                      No conoces la palabra secreta.
                    </p>
                  </div>
                  <div className="w-full bg-indigo-950/90 rounded-2xl p-4 border-2 border-indigo-500/30 shadow-inner">
                    <span className="text-[10px] font-bold uppercase text-amber-300 tracking-wider flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Tu Pista / Comodín
                    </span>
                    <p className="text-2xl font-fun font-bold text-white mt-1">
                      {comodin}
                    </p>
                  </div>
                  <p className="text-[11px] text-indigo-200/80 font-medium leading-tight max-w-xs">
                    💡 Escucha las pistas de los demás y di una pista creíble que encaje con la categoría.
                  </p>
                </>
              )}

              {/* 2. UNDERCOVER (SIMILAR WORD) */}
              {player.role === 'UNDERCOVER' && (
                <>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-indigo-400/40 bg-indigo-950/80">
                    <img src="/assets/impostor.jpg" alt="Rol" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-fun text-xl sm:text-2xl font-bold text-purple-300 tracking-wide">
                      🎭 TU PALABRA SECRETA
                    </h3>
                    <p className="text-xs text-indigo-200/80 mt-0.5 font-medium">
                      Modo Undercover activo.
                    </p>
                  </div>
                  <div className="w-full bg-indigo-950/90 rounded-2xl p-4 border-2 border-purple-500/30 shadow-inner">
                    <span className="text-[10px] font-bold uppercase text-purple-300 tracking-wider flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-300" /> Tu Palabra
                    </span>
                    <p className="text-2xl font-fun font-bold text-white mt-1">
                      {player.assignedWord}
                    </p>
                  </div>
                  <p className="text-[11px] text-indigo-200/80 font-medium leading-tight max-w-xs">
                    💡 Da pistas sobre tu palabra. Si notas que los demás hablan de algo ligeramente distinto, ¡podrías ser el infiltrado!
                  </p>
                </>
              )}

              {/* 3. BROMISTA (JESTER) */}
              {player.role === 'BROMISTA' && (
                <>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-amber-400/40 bg-amber-950/50">
                    🃏
                  </div>
                  <div>
                    <h3 className="font-fun text-xl sm:text-2xl font-bold text-yellow-300 tracking-wide">
                      🃏 ¡ERES EL BROMISTA!
                    </h3>
                    <p className="text-xs text-indigo-200/80 mt-0.5 font-medium">
                      Conoces la palabra, pero juegas para ti solo.
                    </p>
                  </div>
                  <div className="w-full bg-indigo-950/90 rounded-2xl p-3.5 border-2 border-yellow-500/30 shadow-inner">
                    <span className="text-[10px] font-bold uppercase text-yellow-300 tracking-wider flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-300" /> Palabra de la Tripulación
                    </span>
                    <p className="text-xl font-fun font-bold text-white mt-0.5">
                      {player.assignedWord}
                    </p>
                  </div>
                  <p className="text-[11px] text-yellow-200/90 font-medium leading-tight max-w-xs">
                    🎯 <strong>Misión:</strong> Actúa de forma sospechosa. ¡Si la tripulación te vota y te expulsa, tú ganas la partida (+5 pts)!
                  </p>
                </>
              )}

              {/* 4. TRIPULANTE */}
              {player.role === 'TRIPULANTE' && (
                <>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-indigo-400/40 bg-indigo-950/80">
                    <img src="/assets/crewmate.jpg" alt="Rol" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-fun text-xl sm:text-2xl font-bold text-emerald-300 tracking-wide">
                      👨‍🚀 ¡ERES TRIPULANTE!
                    </h3>
                    <p className="text-xs text-indigo-200/80 mt-0.5 font-medium">
                      Descubran quién es el infiltrado.
                    </p>
                  </div>
                  <div className="w-full bg-indigo-950/90 rounded-2xl p-4 border-2 border-emerald-500/30 shadow-inner">
                    <span className="text-[10px] font-bold uppercase text-emerald-300 tracking-wider flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-300" /> Palabra Secreta
                    </span>
                    <p className="text-2xl font-fun font-bold text-white mt-1">
                      {player.assignedWord}
                    </p>
                  </div>
                  <p className="text-[11px] text-indigo-200/80 font-medium leading-tight max-w-xs">
                    💡 Di una palabra relacionada para conectar con los tripulantes sin ser tan obvio.
                  </p>
                </>
              )}
            </div>

            {/* Tap to hide */}
            <div className="text-[11px] font-semibold text-indigo-300/80 flex items-center gap-1 pt-2 border-t border-indigo-800/60 w-full justify-center">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Toca la pantalla para ocultar</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDone}
        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fun font-bold text-lg shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 touch-press transition-all border-2 border-indigo-400/30"
      >
        <Check className="w-5 h-5" />
        <span>¡Listo, pasar al siguiente!</span>
      </button>
    </div>
  );
};
