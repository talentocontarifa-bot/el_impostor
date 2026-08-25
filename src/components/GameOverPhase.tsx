import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Play, Trophy, Sparkles } from 'lucide-react';
import type { GamePlayer } from '../types/game';
import { soundManager } from '../services/soundService';

interface GameOverPhaseProps {
  winnerTeam: 'IMPOSTOR' | 'TRIPULANTES' | 'BROMISTA';
  impostorPlayer: GamePlayer;
  jesterPlayer?: GamePlayer;
  category: string;
  secretWord: string;
  undercoverWord?: string;
  comodin: string;
  lastGuess?: string;
  allPlayers: GamePlayer[];
  currentTournamentRound: number;
  totalTournamentRounds: number;
  onPlayNextTournamentRound: () => void;
  onNewGameSetup: () => void;
}

const AVATAR_EMOJIS = ['👨‍🚀', '🕵️‍♀️', '🧙‍♂️', '🦸‍♂️', '🥷', '🤖', '🦊', '🐼', '🦁', '🦉'];

export const GameOverPhase: React.FC<GameOverPhaseProps> = ({
  winnerTeam,
  impostorPlayer,
  jesterPlayer,
  category,
  secretWord,
  undercoverWord,
  comodin,
  lastGuess,
  allPlayers,
  currentTournamentRound,
  totalTournamentRounds,
  onPlayNextTournamentRound,
  onNewGameSetup
}) => {
  const isTournamentOver = currentTournamentRound >= totalTournamentRounds;

  useEffect(() => {
    soundManager.playVictory();
    if (winnerTeam === 'BROMISTA') {
      soundManager.speak(`¡El Bromista ${jesterPlayer?.name || ''} ha engañado a todos y gana la partida!`);
    } else if (winnerTeam === 'TRIPULANTES') {
      soundManager.speak('¡Victoria de los Tripulantes! Han ganado la ronda.');
    } else {
      soundManager.speak(`¡El Infiltrado ${impostorPlayer.name} ha ganado la ronda!`);
    }

    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [winnerTeam]);

  // Sort players for tournament leaderboard
  const sortedLeaderboard = [...allPlayers].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-5 animate-in zoom-in-95 duration-300">
      
      {/* Victory Banner */}
      <div className={`rounded-3xl p-6 sm:p-7 text-white shadow-2xl border-4 text-center flex flex-col items-center gap-3 relative overflow-hidden ${
        winnerTeam === 'BROMISTA'
          ? 'bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-700 border-amber-300/50 shadow-amber-500/20'
          : winnerTeam === 'TRIPULANTES'
          ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 border-emerald-400/40 shadow-emerald-600/20'
          : 'bg-gradient-to-br from-rose-600 via-red-700 to-indigo-950 border-red-400/40 shadow-red-600/20'
      }`}>
        
        {/* Mascot Avatar */}
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-white/20">
            {winnerTeam === 'BROMISTA' ? (
              <div className="w-full h-full bg-amber-500 flex items-center justify-center text-5xl">
                🃏
              </div>
            ) : (
              <img
                src={winnerTeam === 'TRIPULANTES' ? '/assets/crewmate.jpg' : '/assets/impostor.jpg'}
                alt="Ganador"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-amber-900 font-bold shadow-md">
            🏆
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 border border-white/20 mt-1">
          {winnerTeam === 'BROMISTA' ? '¡El Caos ha Triunfado!' : winnerTeam === 'TRIPULANTES' ? 'Misión Cumplida' : 'Infiltración Exitosa'}
        </span>

        <h2 className="text-2xl sm:text-3xl font-fun font-bold text-white tracking-wide">
          {winnerTeam === 'BROMISTA'
            ? `¡VICTORIA DEL BROMISTA (${jesterPlayer?.name.toUpperCase()})!`
            : winnerTeam === 'TRIPULANTES'
            ? '¡VICTORIA DE LOS TRIPULANTES!'
            : `¡VICTORIA DE ${impostorPlayer.name.toUpperCase()}!`}
        </h2>

        <p className="text-xs sm:text-sm text-white/90 font-medium max-w-sm">
          {winnerTeam === 'BROMISTA'
            ? 'El Bromista logró engañar a la tripulación para que lo votaran a él y se roba la partida.'
            : winnerTeam === 'TRIPULANTES'
            ? 'Los tripulantes descubrieron al impostor y protegieron la palabra secreta.'
            : 'El impostor logró engañar a la tripulación o adivinó con éxito la palabra secreta.'}
        </p>
      </div>

      {/* Tournament Leaderboard Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-md shadow-amber-900/5 dark:shadow-none flex flex-col gap-3.5 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="font-fun text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {totalTournamentRounds > 1 ? `Clasificación del Torneo (Ronda ${currentTournamentRound} de ${totalTournamentRounds})` : 'Puntuación de la Partida'}
          </h3>
          {isTournamentOver && totalTournamentRounds > 1 && (
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
              ¡Torneo Finalizado!
            </span>
          )}
        </div>

        {/* Leaderboard rows */}
        <div className="flex flex-col gap-2">
          {sortedLeaderboard.map((p, rank) => {
            const emoji = AVATAR_EMOJIS[p.avatarIndex % AVATAR_EMOJIS.length];
            const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  rank === 0
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-sm'
                    : 'bg-amber-50/30 dark:bg-slate-800/60 border-amber-200/50 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-fun font-bold text-base w-6 text-center">{medal}</span>
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <span className="font-fun font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 block">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Rol: {p.role === 'IMPOSTOR' ? '🕵️ Impostor' : p.role === 'UNDERCOVER' ? '🎭 Undercover' : p.role === 'BROMISTA' ? '🃏 Bromista' : '👨‍🚀 Tripulante'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.roundScoreEarned ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      +{p.roundScoreEarned} pts
                    </span>
                  ) : null}
                  <span className="font-fun font-extrabold text-base text-indigo-900 dark:text-indigo-300">
                    {p.score} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Game Words Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-amber-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3 transition-colors text-xs">
        <h4 className="font-fun font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" /> Detalles de la Ronda:
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-amber-50/60 dark:bg-slate-800/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Categoría</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{category}</span>
          </div>

          <div className="bg-amber-50/60 dark:bg-slate-800/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Palabra Tripulantes</span>
            <span className="font-bold text-indigo-700 dark:text-indigo-400 text-sm">{secretWord}</span>
          </div>

          {undercoverWord && (
            <div className="bg-amber-50/60 dark:bg-slate-800/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Palabra Undercover</span>
              <span className="font-bold text-purple-700 dark:text-purple-400 text-sm">{undercoverWord}</span>
            </div>
          )}

          <div className="bg-amber-50/60 dark:bg-slate-800/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Pista / Comodín</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{comodin}</span>
          </div>

          <div className="bg-amber-50/60 dark:bg-slate-800/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Infiltrado</span>
            <span className="font-bold text-red-600 dark:text-red-400 text-sm">🕵️ {impostorPlayer.name}</span>
          </div>
        </div>

        {lastGuess && (
          <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-xs font-semibold text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
            <span>Última adivinanza del infiltrado:</span>
            <span className="font-bold text-slate-900 dark:text-white">"{lastGuess}"</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => {
            soundManager.playPop();
            onPlayNextTournamentRound();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-fun font-bold text-base shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 touch-press transition-all border-2 border-indigo-400/30"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{isTournamentOver ? 'Nuevo Torneo (Mismos Jugadores)' : `Siguiente Ronda (${currentTournamentRound + 1}/${totalTournamentRounds})`}</span>
        </button>

        <button
          onClick={() => {
            soundManager.playPop();
            onNewGameSetup();
          }}
          className="w-full py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-fun font-bold text-base border-2 border-amber-300 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 touch-press transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Menú Principal</span>
        </button>
      </div>
    </div>
  );
};
