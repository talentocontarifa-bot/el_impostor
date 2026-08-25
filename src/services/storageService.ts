import type { GameHistoryItem } from '../types/game';

const STORAGE_KEYS = {
  API_KEY: 'el_impostor_gemini_api_key',
  HISTORY: 'el_impostor_game_history',
  SETTINGS: 'el_impostor_game_settings',
  LAST_PLAYERS: 'el_impostor_last_players',
  THEME: 'el_impostor_theme_mode'
};

export const storageService = {
  getTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  setTheme(theme: 'light' | 'dark'): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getApiKey(): string {
    if (typeof window === 'undefined') return '';
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (stored && stored.trim()) return stored.trim();
    return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  },

  setApiKey(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
  },

  clearApiKey(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },

  getHistory(): GameHistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveGameResult(item: GameHistoryItem): void {
    if (typeof window === 'undefined') return;
    try {
      const history = this.getHistory();
      const updated = [item, ...history].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch {
      // Ignore storage error
    }
  },

  clearHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  },

  getLastPlayerNames(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_PLAYERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLastPlayerNames(names: string[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_PLAYERS, JSON.stringify(names));
    } catch {
      // Ignore
    }
  }
};
