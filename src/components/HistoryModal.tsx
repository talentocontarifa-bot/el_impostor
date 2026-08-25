import React from 'react';
import { X, Trash2, History } from 'lucide-react';
import type { GameHistoryItem } from '../types/game';
import { soundManager } from '../services/soundService';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameHistoryItem[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory
}) => {
  if (!isOpen) return null;

  const totalGames = history.length;
  const crewWins = history.filter(h => h.winnerTeam === 'TRIPULANTES').length;
  const impostorWins = history.filter(h => h.winnerTeam === 'IMPOSTOR').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl border-2 border-amber-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-amber-100 dark:border-slate-800 flex items-center justify-between bg-[#FFFBEB] dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h3 className="font-fun text-lg font-bold text-slate-800 dark:text-slate-100">
              Historial de Partidas
            </h3>
          </div>

          <button
            onClick={() => { soundManager.playPop(); onClose(); }}
            className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center touch-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats bar */}
        {totalGames > 0 && (
          <div className="grid grid-cols-3 gap-2 p-3 bg-amber-50/60 dark:bg-slate-800/80 border-b border-amber-100 dark:border-slate-800 text-center">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Jugadas</span>
              <p className="font-fun text-base font-bold text-slate-800 dark:text-slate-100">{totalGames}</p>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Tripulantes</span>
              <p className="font-fun text-base font-bold text-emerald-700 dark:text-emerald-300">{crewWins}</p>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-950/60 rounded-xl border border-red-200 dark:border-red-800">
              <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">Impostor</span>
              <p className="font-fun text-base font-bold text-red-700 dark:text-red-300">{impostorWins}</p>
            </div>
          </div>
        )}

        {/* List of games */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2.5">
          {totalGames === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
              <History className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">Aún no hay partidas registradas.</p>
              <p className="text-xs">¡Juega una partida para ver tus estadísticas aquí!</p>
            </div>
          ) : (
            history.map((item) => {
              const isCrewWin = item.winnerTeam === 'TRIPULANTES';
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-amber-50/40 dark:bg-slate-800/60 border border-amber-200/70 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        isCrewWin
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                      }`}>
                        {isCrewWin ? 'Ganan Tripulantes' : 'Gana Impostor'}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px]">{item.date}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate mt-0.5">
                      {item.palabraSecreta} <span className="font-normal text-slate-500 dark:text-slate-400">({item.categoria})</span>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Impostor: <strong className="text-slate-700 dark:text-slate-300">{item.impostorName}</strong> · {item.playersCount} jugadores
                    </span>
                  </div>

                  <span className="text-2xl shrink-0">
                    {isCrewWin ? '👨‍🚀' : '🕵️'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {totalGames > 0 && (
          <div className="p-3 bg-amber-50/50 dark:bg-slate-800/80 border-t border-amber-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => { soundManager.playPop(); onClearHistory(); }}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar Historial</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
