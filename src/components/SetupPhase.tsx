import React from 'react';
import { Sparkles, Users, Brain, Baby, Dices, ArrowRight, Loader2, Info, Trophy, VenetianMask } from 'lucide-react';
import type { GameMode } from '../types/game';
import { soundManager } from '../services/soundService';

interface SetupPhaseProps {
  numPlayers: number;
  setNumPlayers: (n: number) => void;
  difficulty: string;
  setDifficulty: (d: string) => void;
  customCategory: string;
  setCustomCategory: (c: string) => void;
  gameMode: GameMode;
  setGameMode: (m: GameMode) => void;
  hasJester: boolean;
  setHasJester: (j: boolean) => void;
  tournamentRounds: number; // 1 = partida rápida, 3 = torneo 3, 5 = torneo 5
  setTournamentRounds: (r: number) => void;
  onStartGame: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

const CATEGORY_PRESETS = [
  { label: '🎲 Aleatorio IA', value: '' },
  { label: '🎬 Películas', value: 'Películas y Series Populares' },
  { label: '🍕 Comida', value: 'Comida y Platillos del Mundo' },
  { label: '🎮 Videojuegos', value: 'Videojuegos y Personajes Geek' },
  { label: '🦸 Superhéroes', value: 'Superhéroes y Villanos' },
  { label: '⚽ Deportes', value: 'Deportes y Atletas Famosos' },
  { label: '🦁 Reino Animal', value: 'Animales Curiosos y Salvajes' },
  { label: '⛪ Historias Bíblicas', value: 'Personajes e Historias de la Biblia' }
];

export const SetupPhase: React.FC<SetupPhaseProps> = ({
  numPlayers,
  setNumPlayers,
  difficulty,
  setDifficulty,
  customCategory,
  setCustomCategory,
  gameMode,
  setGameMode,
  hasJester,
  setHasJester,
  tournamentRounds,
  setTournamentRounds,
  onStartGame,
  isLoading,
  errorMessage
}) => {
  const handlePlayerChange = (delta: number) => {
    const next = Math.min(10, Math.max(3, numPlayers + delta));
    if (next !== numPlayers) {
      setNumPlayers(next);
      if (next < 4 && hasJester) {
        setHasJester(false);
      }
      soundManager.playPop();
    }
  };

  const selectPreset = (val: string) => {
    setCustomCategory(val);
    soundManager.playPop();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-5 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-5 sm:p-6 shadow-xl shadow-indigo-600/15 border-2 border-indigo-400/30">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-400/20 text-amber-300 border border-amber-300/30 mb-2">
              <Sparkles className="w-3 h-3 text-amber-300" /> ¡Edición Pro Party!
            </span>
            <h2 className="text-2xl sm:text-3xl font-fun font-bold text-white leading-tight">
              ¿Quién es el Impostor?
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 font-medium leading-relaxed">
              Deducción social con IA, modo Undercover, rol del Bromista y Torneo por puntos.
            </p>
          </div>

          <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 bg-indigo-900/40">
            <img
              src="/assets/impostor.jpg"
              alt="Mascota Impostor"
              className="w-full h-full object-cover animate-float"
            />
          </div>
        </div>

        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-purple-500/30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-md shadow-amber-900/5 dark:shadow-none flex flex-col gap-6 transition-colors">
        
        {/* 1. Modo de Juego (Clásico vs Undercover) */}
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <VenetianMask className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Modo de Juego
            </span>
            <span className="text-xs font-medium text-slate-400">
              {gameMode === 'CLASICO' ? 'Impostor sin palabra' : 'Palabras parecidas'}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2.5 p-1 bg-amber-50/80 dark:bg-slate-800/80 rounded-2xl border border-amber-200/70 dark:border-slate-700">
            <button
              onClick={() => { setGameMode('CLASICO'); soundManager.playPop(); }}
              className={`py-3 px-3 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs sm:text-sm transition-all touch-press ${
                gameMode === 'CLASICO'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border-2 border-indigo-400'
                  : 'bg-white/80 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <span className="font-fun text-sm sm:text-base">🕵️ Modo Clásico</span>
              <span className="text-[10px] font-normal opacity-90">Impostor + Comodín</span>
            </button>

            <button
              onClick={() => { setGameMode('UNDERCOVER'); soundManager.playPop(); }}
              className={`py-3 px-3 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs sm:text-sm transition-all touch-press ${
                gameMode === 'UNDERCOVER'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 border-2 border-purple-400'
                  : 'bg-white/80 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <span className="font-fun text-sm sm:text-base">🎭 Modo Undercover</span>
              <span className="text-[10px] font-normal opacity-90">Palabras Parecidas (Café/Té)</span>
            </button>
          </div>
        </div>

        {/* 2. Cantidad de Jugadores */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Cantidad de Jugadores
            </label>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              {hasJester ? `1 Infiltrado + 1 Bromista + ${numPlayers - 2} Tripulantes` : `1 Infiltrado + ${numPlayers - 1} Tripulantes`}
            </span>
          </div>

          <div className="flex items-center justify-between bg-amber-50/60 dark:bg-slate-800/80 rounded-2xl p-2 border border-amber-200/70 dark:border-slate-700">
            <button
              onClick={() => handlePlayerChange(-1)}
              disabled={numPlayers <= 3}
              className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 border border-amber-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 disabled:opacity-30 disabled:pointer-events-none text-2xl font-bold flex items-center justify-center shadow-sm touch-press hover:bg-amber-100/50 transition-colors"
            >
              -
            </button>

            <div className="flex flex-col items-center">
              <span className="text-3xl font-fun font-bold text-indigo-900 dark:text-indigo-400 leading-none">
                {numPlayers}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Jugadores
              </span>
            </div>

            <button
              onClick={() => handlePlayerChange(1)}
              disabled={numPlayers >= 10}
              className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 border border-amber-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 disabled:opacity-30 disabled:pointer-events-none text-2xl font-bold flex items-center justify-center shadow-sm touch-press hover:bg-amber-100/50 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* 3. Rol Opcional: El Bromista (Jester) */}
        {numPlayers >= 4 && (
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🃏</span>
              <div>
                <span className="font-fun font-bold text-sm text-slate-800 dark:text-slate-100 block">
                  Incluir "El Bromista" (Jester)
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  Gana la partida si logra que lo voten a él en la mesa (+5 pts).
                </span>
              </div>
            </div>

            <button
              onClick={() => { setHasJester(!hasJester); soundManager.playPop(); }}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
                hasJester ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  hasJester ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* 4. Formato de Torneo por Puntos */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Formato de Partida / Torneo
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Ronda Única', rounds: 1 },
              { label: 'Torneo (3 Rds)', rounds: 3 },
              { label: 'Torneo (5 Rds)', rounds: 5 }
            ].map((t) => (
              <button
                key={t.rounds}
                onClick={() => { setTournamentRounds(t.rounds); soundManager.playPop(); }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all touch-press ${
                  tournamentRounds === t.rounds
                    ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-sm font-extrabold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-amber-200/80 dark:border-slate-700 hover:border-amber-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Dificultad */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Dificultad
          </label>

          <div className="grid grid-cols-2 gap-2.5 p-1 bg-amber-50/80 dark:bg-slate-800/80 rounded-2xl border border-amber-200/70 dark:border-slate-700">
            <button
              onClick={() => { setDifficulty('Niños'); soundManager.playPop(); }}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all touch-press ${
                difficulty === 'Niños'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 border-2 border-emerald-400'
                  : 'bg-white/80 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Baby className="w-4 h-4" />
              <span>Niños (8-12)</span>
            </button>

            <button
              onClick={() => { setDifficulty('Adultos'); soundManager.playPop(); }}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all touch-press ${
                difficulty === 'Adultos'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border-2 border-indigo-400'
                  : 'bg-white/80 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Adultos / Gamers</span>
            </button>
          </div>
        </div>

        {/* 6. Categoría y Presets */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Dices className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Tema o Categoría
            </label>
            {customCategory.trim() && (
              <button
                onClick={() => selectPreset('')}
                className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>

          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Ej: Comida del mundo, Personajes de anime..."
            className="w-full px-4 py-3 rounded-2xl bg-amber-50/50 dark:bg-slate-800/80 border-2 border-amber-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500"
          />

          <div className="flex flex-wrap gap-1.5 pt-1">
            {CATEGORY_PRESETS.map((p) => {
              const isSelected = customCategory.trim() === p.value.trim();
              return (
                <button
                  key={p.label}
                  onClick={() => selectPreset(p.value)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all touch-press ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-amber-200/90 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Start Game Action Button */}
        <button
          onClick={onStartGame}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-fun font-bold text-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 touch-press transition-all disabled:opacity-75 disabled:pointer-events-none border-2 border-indigo-400/40"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Preparando palabras con IA...</span>
            </>
          ) : (
            <>
              <span>{tournamentRounds > 1 ? `Comenzar Torneo (${tournamentRounds} Rondas)` : 'Comenzar Partida'}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
