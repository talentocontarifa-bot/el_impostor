import React, { useState } from 'react';
import { Check, Shield } from 'lucide-react';
import type { GamePlayer } from '../types/game';
import { soundManager } from '../services/soundService';

interface SecretVoterCardProps {
  voter: GamePlayer;
  allPlayers: GamePlayer[];
  category: string;
  onCastVote: (voterId: number, suspectId: number) => void;
  voterIndex: number;
  totalVoters: number;
}

const AVATAR_EMOJIS = ['👨‍🚀', '🕵️‍♀️', '🧙‍♂️', '🦸‍♂️', '🥷', '🤖', '🦊', '🐼', '🦁', '🦉'];

export const SecretVoterCard: React.FC<SecretVoterCardProps> = ({
  voter,
  allPlayers,
  category,
  onCastVote,
  voterIndex,
  totalVoters
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<number | null>(null);

  // Filter out self or allow self-vote if desired
  const candidates = allPlayers.filter(p => p.id !== voter.id);

  const handleSelect = (candidateId: number) => {
    soundManager.playPop();
    setSelectedSuspectId(candidateId);
  };

  const handleConfirmVote = () => {
    if (selectedSuspectId === null) return;
    soundManager.playFlip();
    onCastVote(voter.id, selectedSuspectId);
  };

  const selectedCandidate = allPlayers.find(p => p.id === selectedSuspectId);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-1">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700">
          Voto Secreto {voterIndex + 1} de {totalVoters}
        </span>
        <h2 className="text-2xl font-fun font-bold text-slate-800 dark:text-slate-100 mt-1">
          Turno de <span className="text-indigo-600 dark:text-indigo-400">{voter.name}</span>
        </h2>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xs">
          Selecciona al jugador que sospechas que es el impostor.
        </p>
      </div>

      {/* Candidate Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-amber-200/80 dark:border-slate-800 shadow-md shadow-amber-900/5 dark:shadow-none flex flex-col gap-3 transition-colors">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 pb-1 border-b border-amber-100 dark:border-slate-800">
          <span>Categoría: {category}</span>
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
            <Shield className="w-3.5 h-3.5" /> Voto Privado
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {candidates.map((cand) => {
            const isSelected = cand.id === selectedSuspectId;
            const emoji = AVATAR_EMOJIS[cand.avatarIndex % AVATAR_EMOJIS.length];

            return (
              <button
                key={cand.id}
                onClick={() => handleSelect(cand.id)}
                className={`p-3.5 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all touch-press text-center ${
                  isSelected
                    ? 'bg-red-50 dark:bg-red-950/60 border-red-500 shadow-md scale-[1.02]'
                    : 'bg-amber-50/40 dark:bg-slate-800/60 border-amber-200/70 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  isSelected ? 'bg-red-500 text-white' : 'bg-indigo-100/80 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200'
                }`}>
                  {emoji}
                </div>

                <div className="w-full">
                  <span className={`font-fun font-bold text-sm block truncate ${
                    isSelected ? 'text-red-700 dark:text-red-300' : 'text-slate-800 dark:text-slate-100'
                  }`}>
                    {cand.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {isSelected ? '✓ Seleccionado' : 'Sospechoso'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Secret Vote Button */}
      <button
        onClick={handleConfirmVote}
        disabled={selectedSuspectId === null}
        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fun font-bold text-base shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 touch-press transition-all disabled:opacity-40 disabled:pointer-events-none border-2 border-indigo-400/30"
      >
        <Check className="w-5 h-5" />
        <span>
          {selectedCandidate ? `Votar en secreto por ${selectedCandidate.name}` : 'Elige a un sospechoso'}
        </span>
      </button>
    </div>
  );
};
