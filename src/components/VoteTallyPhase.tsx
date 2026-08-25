import React, { useState } from 'react';
import { Gavel, Sparkles } from 'lucide-react';
import type { GamePlayer } from '../types/game';
import { soundManager } from '../services/soundService';

interface VoteTallyPhaseProps {
  players: GamePlayer[];
  votes: Record<number, number>; // voterId -> suspectId
  category: string;
  onExecuteVerdict: (accusedPlayer: GamePlayer) => void;
}

const AVATAR_EMOJIS = ['👨‍🚀', '🕵️‍♀️', '🧙‍♂️', '🦸‍♂️', '🥷', '🤖', '🦊', '🐼', '🦁', '🦉'];

export const VoteTallyPhase: React.FC<VoteTallyPhaseProps> = ({
  players,
  votes,
  category,
  onExecuteVerdict
}) => {
  const [isRevealing, setIsRevealing] = useState(false);

  // Compute vote counts per candidate
  const voteCounts: Record<number, number> = {};
  players.forEach(p => { voteCounts[p.id] = 0; });
  Object.values(votes).forEach(suspectId => {
    voteCounts[suspectId] = (voteCounts[suspectId] || 0) + 1;
  });

  const sortedCandidates = [...players].sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
  const maxVotes = voteCounts[sortedCandidates[0].id] || 0;
  const topAccused = sortedCandidates[0];

  const handleRevealVerdict = () => {
    setIsRevealing(true);
    soundManager.playSuspense();
    soundManager.speak(`Con ${maxVotes} votos, el acusado principal es ${topAccused.name}. ¡Veamos su rol!`);

    setTimeout(() => {
      onExecuteVerdict(topAccused);
    }, 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-5 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-indigo-900 rounded-3xl p-5 text-white shadow-xl shadow-red-600/20 border-2 border-red-400/40 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-200 flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5" /> Veredicto de la Mesa · {category}
          </span>
          <h2 className="text-xl sm:text-2xl font-fun font-bold text-white mt-0.5">
            Recuento Final de Votos
          </h2>
          <p className="text-xs text-red-100 font-medium mt-1">
            Todos han votado. ¡Veamos a quién ha condenado la tripulación!
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0">
          ⚖️
        </div>
      </div>

      {/* Vote Bars Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-md shadow-amber-900/5 dark:shadow-none flex flex-col gap-4 transition-colors">
        <h3 className="font-fun text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Resultados del Escrutinio:
        </h3>

        <div className="flex flex-col gap-3">
          {sortedCandidates.map((cand) => {
            const count = voteCounts[cand.id] || 0;
            const isTop = count === maxVotes && count > 0;
            const percentage = players.length > 0 ? (count / players.length) * 100 : 0;
            const emoji = AVATAR_EMOJIS[cand.avatarIndex % AVATAR_EMOJIS.length];

            return (
              <div
                key={cand.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isTop
                    ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 shadow-sm'
                    : 'bg-amber-50/40 dark:bg-slate-800/60 border-amber-200/60 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <span className={`font-fun font-bold text-sm sm:text-base ${
                        isTop ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {cand.name}
                      </span>
                      {isTop && (
                        <span className="ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-200 dark:bg-red-900/80 text-red-800 dark:text-red-200">
                          Mayoría de Votos
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="font-fun text-base font-bold text-slate-800 dark:text-slate-100">
                    {count} {count === 1 ? 'voto' : 'votos'}
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isTop ? 'bg-red-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.max(5, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-3">
          <button
            onClick={handleRevealVerdict}
            disabled={isRevealing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-fun font-bold text-lg shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 touch-press transition-all disabled:opacity-75 disabled:pointer-events-none border-2 border-red-400/40"
          >
            {isRevealing ? (
              <span className="animate-pulse">Abriendo el veredicto final...</span>
            ) : (
              <>
                <Gavel className="w-5 h-5" />
                <span>Condenar a {topAccused.name} y Revelar Rol</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
