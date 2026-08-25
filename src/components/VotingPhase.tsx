import React, { useState } from 'react';
import { Vote, Gavel } from 'lucide-react';
import type { GamePlayer } from '../types/game';
import { soundManager } from '../services/soundService';

interface VotingPhaseProps {
  players: GamePlayer[];
  category: string;
  onAccusePlayer: (suspect: GamePlayer) => void;
}

const AVATAR_EMOJIS = ['👨‍🚀', '🕵️‍♀️', '🧙‍♂️', '🦸‍♂️', '🥷', '🤖', '🦊', '🐼', '🦁', '🦉'];

export const VotingPhase: React.FC<VotingPhaseProps> = ({
  players,
  category,
  onAccusePlayer
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const selectedPlayer = players.find(p => p.id === selectedSuspectId);

  const handleSelect = (p: GamePlayer) => {
    soundManager.playPop();
    setSelectedSuspectId(p.id);
  };

  const handleConfirmVerdict = () => {
    if (!selectedPlayer) return;
    soundManager.playSuspense();
    setIsConfirming(true);
    soundManager.speak(`Han acusado a ${selectedPlayer.name}. ¡Veamos el veredicto!`);

    setTimeout(() => {
      onAccusePlayer(selectedPlayer);
    }, 1500);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-5 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 dark:from-red-700 dark:to-rose-900 rounded-3xl p-5 text-white shadow-lg shadow-red-600/20 border-2 border-red-400/40 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-200 flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5" /> Juicio de la Tripulación · {category}
          </span>
          <h2 className="text-xl sm:text-2xl font-fun font-bold text-white mt-0.5">
            ¿Quién es el Impostor?
          </h2>
          <p className="text-xs text-red-100 font-medium mt-1">
            Debatan y elijan al jugador más sospechoso.
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0">
          🕵️
        </div>
      </div>

      {/* Suspects Selection Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-md shadow-amber-900/5 dark:shadow-none flex flex-col gap-4 transition-colors">
        <h3 className="font-fun text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Vote className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Seleccionen al Acusado:
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
          {players.map((p, idx) => {
            const isSelected = p.id === selectedSuspectId;

            return (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                disabled={isConfirming}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 text-center border-2 transition-all touch-press ${
                  isSelected
                    ? 'bg-red-50 dark:bg-red-950/60 border-red-500 shadow-md shadow-red-500/20 scale-[1.02]'
                    : 'bg-amber-50/40 dark:bg-slate-800/60 border-amber-200/80 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform ${
                  isSelected
                    ? 'bg-red-500 text-white shadow-md scale-110'
                    : 'bg-indigo-100/80 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200'
                }`}>
                  {AVATAR_EMOJIS[idx % AVATAR_EMOJIS.length]}
                </div>

                <div className="w-full">
                  <span className={`font-fun font-bold text-sm sm:text-base block truncate ${
                    isSelected ? 'text-red-700 dark:text-red-300' : 'text-slate-800 dark:text-slate-100'
                  }`}>
                    {p.name}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    {isSelected ? '⚠️ Sospechoso Elegido' : 'Tocar para votar'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleConfirmVerdict}
            disabled={!selectedPlayer || isConfirming}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-fun font-bold text-lg shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 touch-press transition-all disabled:opacity-40 disabled:pointer-events-none border-2 border-red-400/40"
          >
            {isConfirming ? (
              <span className="animate-pulse">Revelando veredicto...</span>
            ) : (
              <>
                <Gavel className="w-5 h-5" />
                <span>
                  {selectedPlayer ? `Acusar formalmente a ${selectedPlayer.name}` : 'Elige un sospechoso'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
