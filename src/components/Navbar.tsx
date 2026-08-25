import React from 'react';
import { Volume2, VolumeX, Mic, MicOff, Key, History, RotateCcw, Moon, Sun } from 'lucide-react';
import { soundManager } from '../services/soundService';
import type { GamePhase } from '../types/game';

interface NavbarProps {
  currentPhase: GamePhase;
  onReset: () => void;
  onOpenApiKey: () => void;
  onOpenHistory: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (voice: boolean) => void;
  apiKeySet: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPhase,
  onReset,
  onOpenApiKey,
  onOpenHistory,
  isMuted,
  setIsMuted,
  isVoiceEnabled,
  setIsVoiceEnabled,
  apiKeySet,
  theme,
  onToggleTheme
}) => {
  const toggleMute = () => {
    soundManager.isMuted = !isMuted;
    setIsMuted(!isMuted);
    if (isMuted) soundManager.playPop();
  };

  const toggleVoice = () => {
    soundManager.isVoiceEnabled = !isVoiceEnabled;
    setIsVoiceEnabled(!isVoiceEnabled);
    soundManager.playPop();
  };

  return (
    <header className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between z-30 sticky top-0 bg-[#FFFBEB]/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-amber-200/60 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { if (currentPhase !== 'SETUP') onReset(); }}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/20 flex items-center justify-center text-white font-fun text-xl font-bold border-2 border-white dark:border-slate-700">
          🕵️
        </div>
        <div>
          <h1 className="font-fun text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-none flex items-center gap-1.5">
            El Impostor <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">AI</span>
          </h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Deducción Social</p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        {currentPhase !== 'SETUP' && (
          <button
            onClick={onReset}
            title="Reiniciar Partida"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 shadow-sm touch-press transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? "Modo Claro" : "Modo Oscuro"}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-600 dark:text-amber-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm touch-press transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* History Modal */}
        <button
          onClick={onOpenHistory}
          title="Historial de Partidas"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 shadow-sm touch-press transition-colors"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Sound toggle */}
        <button
          onClick={toggleMute}
          title={isMuted ? "Activar Sonido" : "Silenciar"}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border shadow-sm touch-press transition-colors ${
            isMuted
              ? 'bg-amber-100/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-600 dark:text-amber-400'
              : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Voice TTS toggle */}
        <button
          onClick={toggleVoice}
          title={isVoiceEnabled ? "Desactivar Narrador con Voz" : "Activar Narrador con Voz"}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border shadow-sm touch-press transition-colors ${
            isVoiceEnabled
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300'
              : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
          }`}
        >
          {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Gemini API Key config */}
        <button
          onClick={onOpenApiKey}
          title="Configurar Gemini API Key"
          className={`px-2.5 h-9 flex items-center gap-1 rounded-xl text-xs font-semibold border shadow-sm touch-press transition-all ${
            apiKeySet
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-amber-200 dark:border-slate-700 hover:border-amber-300'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{apiKeySet ? 'Gemini IA' : 'API Key'}</span>
        </button>
      </div>
    </header>
  );
};
