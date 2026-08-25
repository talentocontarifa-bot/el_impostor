import React, { useState } from 'react';
import { Loader2, ArrowRight, Lightbulb, Bot, Mic } from 'lucide-react';
import type { GamePlayer, ValidationResponse } from '../types/game';
import { soundManager } from '../services/soundService';
import { speechService } from '../services/speechService';

interface LastDefensePhaseProps {
  impostorPlayer: GamePlayer;
  category: string;
  secretWord: string;
  onValidateGuess: (guess: string) => Promise<void>;
  isLoading: boolean;
  validationResult: ValidationResponse | null;
  onProceedToGameOver: () => void;
}

export const LastDefensePhase: React.FC<LastDefensePhaseProps> = ({
  impostorPlayer,
  category,
  secretWord,
  onValidateGuess,
  isLoading,
  validationResult,
  onProceedToGameOver
}) => {
  const [guessInput, setGuessInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim() || isLoading) return;
    soundManager.playPop();
    speechService.stopListening();
    setIsListening(false);
    await onValidateGuess(guessInput.trim());
  };

  const handleToggleVoiceDictation = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      soundManager.playPop();
    } else {
      soundManager.playPop();
      setVoiceNotice('Escuchando... Di tu palabra secreta.');
      const started = speechService.startListening(
        (transcript) => {
          setGuessInput(transcript);
        },
        () => {
          setIsListening(false);
          setVoiceNotice(null);
        },
        (err) => {
          setIsListening(false);
          setVoiceNotice(err);
          setTimeout(() => setVoiceNotice(null), 3000);
        }
      );
      setIsListening(started);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-5 animate-in fade-in duration-300">
      
      {/* Alert Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 dark:from-amber-600 dark:via-orange-600 dark:to-red-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-orange-500/20 border-2 border-amber-300/40 flex flex-col gap-2 text-center items-center">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border border-white/20 animate-float">
          ⚖️
        </div>

        <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full text-amber-200">
          ¡El Infiltrado ha sido descubierto!
        </span>

        <h2 className="text-2xl sm:text-3xl font-fun font-bold text-white">
          La Última Oportunidad de {impostorPlayer.name}
        </h2>

        <p className="text-xs sm:text-sm text-orange-100 font-medium max-w-md">
          Si <strong>{impostorPlayer.name}</strong> logra adivinar la <strong>palabra secreta</strong> de la categoría <strong>"{category}"</strong>, ¡se robará la victoria!
        </p>
      </div>

      {/* Guessing Card with Voice Recognition */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-amber-200/80 dark:border-slate-800 shadow-md shadow-amber-900/5 dark:shadow-none flex flex-col gap-5 transition-colors">
        
        {!validationResult ? (
          <form onSubmit={handleSubmitGuess} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  ¿Cuál era la palabra secreta de la tripulación?
                </span>
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  Escribe o usa tu voz
                </span>
              </label>

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  placeholder="Escribe o presiona el micrófono..."
                  autoFocus
                  disabled={isLoading}
                  className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-amber-50/50 dark:bg-slate-800/80 border-2 border-amber-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold placeholder:text-slate-400 text-base focus:outline-none focus:border-indigo-500"
                />

                {/* Voice Input Microphone Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceDictation}
                  title="Dictar por voz"
                  className={`absolute right-2 p-2 rounded-xl transition-all touch-press ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-md'
                      : 'bg-indigo-100 dark:bg-slate-700 text-indigo-700 dark:text-slate-200 hover:bg-indigo-200'
                  }`}
                >
                  {isListening ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>

              {voiceNotice && (
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1.5 block animate-pulse">
                  🎙️ {voiceNotice}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!guessInput.trim() || isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-fun font-bold text-lg shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 touch-press transition-all disabled:opacity-40 disabled:pointer-events-none border-2 border-indigo-400/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gemini IA está evaluando tu respuesta...</span>
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  <span>Validar Respuesta con Gemini IA</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Validation Result View */
          <div className="flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${
              validationResult.acerto
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-red-500 text-white shadow-red-500/30'
            }`}>
              {validationResult.acerto ? '🎉' : '❌'}
            </div>

            <div>
              <h3 className={`font-fun text-2xl font-bold ${
                validationResult.acerto ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {validationResult.acerto ? '¡Adivinó la Palabra Secreta!' : '¡Respuesta Incorrecta!'}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 max-w-sm">
                {validationResult.explicacion}
              </p>
            </div>

            <div className="w-full bg-amber-50/70 dark:bg-slate-800/80 p-4 rounded-2xl border border-amber-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-around">
              <div>
                <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase">Palabra Real</span>
                <span className="font-fun text-base font-bold text-indigo-900 dark:text-indigo-300">{secretWord}</span>
              </div>
              <div className="h-6 w-px bg-amber-200 dark:bg-slate-700" />
              <div>
                <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase">Respuesta Ingresada</span>
                <span className="font-fun text-base font-bold text-slate-800 dark:text-slate-100">
                  {validationResult.palabra_ingresada || guessInput}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playPop();
                onProceedToGameOver();
              }}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fun font-bold text-lg shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 touch-press transition-all border-2 border-indigo-400/30 mt-2"
            >
              <span>Ver Resultados y Puntuación</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
