import React, { useState, useEffect } from 'react';
import { X, Key, Check, ExternalLink, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { soundManager } from '../services/soundService';
import { geminiService } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey
}) => {
  const [inputVal, setInputVal] = useState(currentKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setInputVal(currentKey);
    setTestResult(null);
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!inputVal.trim()) {
      setTestResult({ success: false, message: 'Ingresa una clave para probar.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await geminiService.testApiKey(inputVal.trim());
    setIsTesting(false);
    setTestResult(res);
    if (res.success) {
      soundManager.playVictory();
    } else {
      soundManager.playError();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playPop();
    onSaveKey(inputVal.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md flex flex-col shadow-2xl border-2 border-amber-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-amber-100 dark:border-slate-800 flex items-center justify-between bg-[#FFFBEB] dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="font-fun text-lg font-bold text-slate-800 dark:text-slate-100">
              Configurar Gemini API
            </h3>
          </div>

          <button
            onClick={() => { soundManager.playPop(); onClose(); }}
            className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center touch-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            La clave API de Gemini permite que la IA invente categorías ilimitadas y evalúe la última defensa del impostor de forma inteligente.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Tu Gemini API Key (Google AI Studio)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-amber-50/50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTesting || !inputVal.trim()}
                className="px-3 py-2 rounded-xl bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-slate-700 hover:bg-amber-200 disabled:opacity-40 touch-press shrink-0 flex items-center gap-1"
              >
                {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Probar'}
              </button>
            </div>
          </div>

          {testResult && (
            <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200 flex flex-col gap-1.5">
            <div className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>¿Dónde conseguir tu clave gratis?</span>
            </div>
            <p className="text-indigo-800 dark:text-indigo-300">
              En Google AI Studio puedes generar una clave gratuita en 1 clic:
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>aistudio.google.com/app/apikey</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>¡Clave guardada exitosamente!</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setInputVal('');
                onSaveKey('');
                soundManager.playPop();
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold touch-press"
            >
              Borrar
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 touch-press transition-all"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
