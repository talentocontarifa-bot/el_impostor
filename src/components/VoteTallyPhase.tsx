import React, { useState } from 'react';
import { Gavel, Sparkles, RefreshCw } from 'lucide-react';
import type { GamePlayer } from '../types/game';
import { soundManager } from '../services/soundService';
import { AVATAR_EMOJIS } from '../constants/avatars';

interface VoteTallyPhaseProps {
  players: GamePlayer[];
  votes: Record<number, number>; // voterId -> suspectId
  category: string;
  onExecuteVerdict: (accusedPlayer: GamePlayer) => void;
}

export const VoteTallyPhase: React.FC<VoteTallyPhaseProps> = ({
  players,
  votes,
  category,
  onExecuteVerdict
}) => {
  const [isRevealing, setIsRevealing] = useState(false);
  // tiebreaker: sub-pool of tied players to re-vote on
  const [tiebreakerPool, setTiebreakerPool] = useState<GamePlayer[] | null>(null);
  const [tieVotes, setTieVotes] = useState<Record<number, number> | null>(null);

  // Use tiebreaker votes if active, otherwise main votes
  const activeVotes = tieVotes ?? votes;
  const activePool = tiebreakerPool ?? players;

  // Compute vote counts
  const voteCounts: Record<number, number> = {};
  activePool.forEach(p => { voteCounts[p.id] = 0; });
  Object.values(activeVotes).forEach(suspectId => {
    voteCounts[suspectId] = (voteCounts[suspectId] || 0) + 1;
  });

  const sortedCandidates = [...activePool].sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
  const maxVotes = voteCounts[sortedCandidates[0]?.id] || 0;

  // Detect tie: two or more players with the same max votes
  const tiedPlayers = sortedCandidates.filter(p => (voteCounts[p.id] || 0) === maxVotes && maxVotes > 0);
  const isTie = tiedPlayers.length >= 2;
  const topAccused = sortedCandidates[0];

  const handleRevealVerdict = () => {
    if (isTie) {
      // Show tie notice and set up tiebreaker with only the tied players
      soundManager.playPop();
      setTiebreakerPool(tiedPlayers);
      setTieVotes({});
      return;
    }

    setIsRevealing(true);
    soundManager.playSuspense();
    soundManager.speak(`Con ${maxVotes} ${maxVotes === 1 ? 'voto' : 'votos'}, el acusado principal es ${topAccused.name}. ¡Veamos su rol!`);

    setTimeout(() => {
      onExecuteVerdict(topAccused);
    }, 2000);
  };

  // Tiebreaker: simple show-of-hands re-vote in UI
  const handleTieVote = (suspectId: number) => {
    soundManager.playPop();
    const newTieVotes = { ...(tieVotes ?? {}), [Date.now()]: suspectId };
    setTieVotes(newTieVotes);
  };

  const handleConfirmTieVerdict = () => {
    if (!topAccused) return;
    setIsRevealing(true);
    soundManager.playSuspense();
    soundManager.speak(`Desempate: ${topAccused.name} ha sido elegido. ¡Veamos su rol!`);
    setTimeout(() => {
      onExecuteVerdict(topAccused);
    }, 2000);
  };

  const handleResetTie = () => {
    setTiebreakerPool(null);
    setTieVotes(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-5 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-indigo-900 rounded-3xl p-5 text-white shadow-xl shadow-red-600/20 border-2 border-red-400/40 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-200 flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5" /> Veredicto · {category}
          </span>
          <h2 className="text-xl sm:text-2xl font-fun font-bold text-white mt-0.5">
            {tiebreakerPool ? '⚖️ ¡Hay Empate!' : 'Recuento Final de Votos'}
          </h2>
          <p className="text-xs text-red-100 font-medium mt-1">
            {tiebreakerPool
              ? 'Voten de nuevo entre los empatados levantando la mano'
              : '¡Todos han votado. Veamos a quién ha condenado la tripulación!'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0">
          ⚖️
        </div>
      </div>

      {/* Tie Notice Banner */}
      {tiebreakerPool && !isRevealing && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 rounded-2xl p-4 text-center">
          <p className="font-fun font-bold text-amber-800 dark:text-amber-300 text-base">
            🤝 Empate entre:&nbsp;
            {tiedPlayers.map(p => p.name).join(' y ')}
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            Levanten la mano para votar entre los empatados, luego pulsen el botón final.
          </p>
          <div className="flex gap-2 mt-3 justify-center flex-wrap">
            {tiedPlayers.map(p => (
              <button
                key={p.id}
                onClick={() => handleTieVote(p.id)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm touch-press transition-all"
              >
                {AVATAR_EMOJIS[p.avatarIndex % AVATAR_EMOJIS.length]} {p.name}
              </button>
            ))}
          </div>
          {tieVotes && Object.keys(tieVotes).length > 0 && (
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">
              Votos: {Object.entries(
                Object.values(tieVotes).reduce<Record<number, number>>((acc, id) => {
                  acc[id] = (acc[id] || 0) + 1; return acc;
                }, {})
              ).map(([id, c]) => {
                const p = players.find(pl => pl.id === Number(id));
                return `${p?.name ?? id}: ${c}`;
              }).join(' | ')}
            </p>
          )}
          <button
            onClick={handleResetTie}
            className="mt-2 text-xs underline text-amber-500 dark:text-amber-400 flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="w-3 h-3" /> Resetear y volver a contar
          </button>
        </div>
      )}

      {/* Vote Bars Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-md flex flex-col gap-4 transition-colors">
        <h3 className="font-fun text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Resultados del Escrutinio:
        </h3>

        <div className="flex flex-col gap-3">
          {sortedCandidates.map(cand => {
            const count = voteCounts[cand.id] || 0;
            const isTop = count === maxVotes && count > 0;
            const isTied = isTop && isTie;
            const percentage = activePool.length > 0 ? (count / activePool.length) * 100 : 0;
            const emoji = AVATAR_EMOJIS[cand.avatarIndex % AVATAR_EMOJIS.length];

            return (
              <div
                key={cand.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isTied
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-700'
                    : isTop
                    ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 shadow-sm'
                    : 'bg-amber-50/40 dark:bg-slate-800/60 border-amber-200/60 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <span className={`font-fun font-bold text-sm sm:text-base ${
                        isTied ? 'text-amber-700 dark:text-amber-300' :
                        isTop ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {cand.name}
                      </span>
                      {isTied && (
                        <span className="ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200">
                          Empate
                        </span>
                      )}
                      {isTop && !isTied && (
                        <span className="ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-200 dark:bg-red-900/80 text-red-800 dark:text-red-200">
                          Más Votos
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
                      isTied ? 'bg-amber-500' : isTop ? 'bg-red-500' : 'bg-indigo-500'
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
          {tiebreakerPool ? (
            <button
              onClick={handleConfirmTieVerdict}
              disabled={isRevealing || Object.keys(tieVotes ?? {}).length === 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-fun font-bold text-lg shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 touch-press transition-all disabled:opacity-60 disabled:pointer-events-none border-2 border-amber-300/40"
            >
              {isRevealing ? (
                <span className="animate-pulse">Revelando veredicto final...</span>
              ) : (
                <><Gavel className="w-5 h-5" /><span>Confirmar ganador del desempate</span></>
              )}
            </button>
          ) : (
            <button
              onClick={handleRevealVerdict}
              disabled={isRevealing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-fun font-bold text-lg shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 touch-press transition-all disabled:opacity-75 disabled:pointer-events-none border-2 border-red-400/40"
            >
              {isRevealing ? (
                <span className="animate-pulse">Abriendo el veredicto final...</span>
              ) : isTie ? (
                <><Gavel className="w-5 h-5" /><span>¡Hay Empate! Ver desempate</span></>
              ) : (
                <><Gavel className="w-5 h-5" /><span>Condenar a {topAccused?.name} y Revelar Rol</span></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
