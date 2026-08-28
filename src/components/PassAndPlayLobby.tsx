import React, { useState, useEffect } from 'react';
import { Eye, Sparkles, Edit2, Play, Users, Check, Save, RefreshCw } from 'lucide-react';
import type { GamePlayer } from '../types/game';
import { soundManager } from '../services/soundService';
import { storageService } from '../services/storageService';
import { AVATAR_EMOJIS } from '../constants/avatars';

interface PassAndPlayLobbyProps {
  players: GamePlayer[];
  onStartReveal: (playerIndex: number) => void;
  onAllRolesReviewed: () => void;
  onUpdatePlayerName: (index: number, newName: string) => void;
  category: string;
  isFromAi: boolean;
}

export const PassAndPlayLobby: React.FC<PassAndPlayLobbyProps> = ({
  players,
  onStartReveal,
  onAllRolesReviewed,
  onUpdatePlayerName,
  category,
  isFromAi
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempName, setTempName] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    setHasSaved(storageService.hasSavedCrew());
  }, []);

  const startEditing = (idx: number, currentName: string) => {
    setEditingIndex(idx);
    setTempName(currentName);
  };

  const saveEditing = (idx: number) => {
    if (tempName.trim()) {
      onUpdatePlayerName(idx, tempName.trim());
    }
    setEditingIndex(null);
  };

  const handleSaveCrew = () => {
    soundManager.playPop();
    const names = players.map(p => p.name);
    storageService.saveCrew(names);
    storageService.saveLastPlayerNames(names);
    setHasSaved(true);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleLoadCrew = () => {
    soundManager.playPop();
    const saved = storageService.getSavedCrew();
    saved.forEach((name, idx) => {
      if (idx < players.length && name.trim()) {
        onUpdatePlayerName(idx, name.trim());
      }
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-5 animate-in fade-in duration-300">
      
      {/* Category banner card */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-orange-700 rounded-3xl p-4 sm:p-5 text-white shadow-md shadow-amber-500/20 border-2 border-amber-300/40 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-100 uppercase tracking-wider">
            <span>Tema de la Partida</span>
            {isFromAi && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                <Sparkles className="w-2.5 h-2.5 text-yellow-200" /> Generado con IA
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-fun font-bold text-white mt-0.5">
            {category}
          </h2>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0">
          🎲
        </div>
      </div>

      {/* Players List Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-md flex flex-col gap-4 transition-colors">
        
        {/* Header with crew management */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-fun text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Entrega Secreta de Roles
          </h3>
          <div className="flex items-center gap-2">
            {hasSaved && (
              <button
                onClick={handleLoadCrew}
                title="Cargar tripulación guardada"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 touch-press transition-colors hover:bg-indigo-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Cargar equipo
              </button>
            )}
            <button
              onClick={handleSaveCrew}
              title="Guardar esta tripulación para la próxima vez"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border touch-press transition-all ${
                savedToast
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-slate-700 hover:bg-amber-100'
              }`}
            >
              {savedToast ? (
                <><Check className="w-3.5 h-3.5" /> ¡Guardado!</>
              ) : (
                <><Save className="w-3.5 h-3.5" /> Guardar equipo</>
              )}
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-amber-50/70 dark:bg-slate-800/80 p-3 rounded-2xl border border-amber-200/60 dark:border-slate-700">
          📱 <strong>Regla de oro:</strong> Cada jugador toma el celular en privado, revisa su rol y lo entrega al siguiente.
        </p>

        {/* Players Grid / List */}
        <div className="flex flex-col gap-2.5 mt-1">
          {players.map((player, idx) => {
            const isEditing = editingIndex === idx;
            const emoji = AVATAR_EMOJIS[idx % AVATAR_EMOJIS.length];

            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-amber-50/40 dark:bg-slate-800/50 border border-amber-200/70 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/80 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-xl flex items-center justify-center shrink-0">
                    {emoji}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={tempName}
                        onChange={e => setTempName(e.target.value)}
                        onBlur={() => saveEditing(idx)}
                        onKeyDown={e => e.key === 'Enter' && saveEditing(idx)}
                        autoFocus
                        className="w-full px-2.5 py-1 text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 border-2 border-indigo-500 rounded-lg focus:outline-none"
                      />
                      <button
                        onMouseDown={e => { e.preventDefault(); saveEditing(idx); }}
                        className="text-xs font-bold p-1.5 bg-indigo-600 text-white rounded-lg touch-press"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 truncate flex-1">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-base truncate">
                        {player.name}
                      </span>
                      <button
                        onClick={() => startEditing(idx, player.name)}
                        className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 transition-colors shrink-0"
                        title="Cambiar nombre"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    soundManager.playFlip();
                    onStartReveal(idx);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 touch-press transition-all shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Rol</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Start Table Board action */}
        <div className="pt-2">
          <button
            onClick={() => {
              soundManager.playPop();
              onAllRolesReviewed();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-fun font-bold text-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 touch-press transition-all border-2 border-emerald-400/40"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>¡Todos Listos! Comenzar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
