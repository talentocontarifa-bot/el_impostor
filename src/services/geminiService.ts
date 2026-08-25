import type { GameRoundResponse, ValidationResponse, GameMode } from '../types/game';
import { getRandomFallbackRound } from '../data/defaultRounds';
import { storageService } from './storageService';

function sanitizeJson(raw: string): string {
  let str = raw.trim();
  if (str.startsWith('```json')) {
    str = str.replace(/^```json/, '');
  } else if (str.startsWith('```')) {
    str = str.replace(/^```/, '');
  }
  if (str.endsWith('```')) {
    str = str.replace(/```$/, '');
  }
  return str.trim();
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro'
];

async function callGeminiApi(apiKey: string, promptText: string, systemInstruction: string): Promise<string> {
  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\n${promptText}` }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.95
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Model ${model} returned HTTP ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return text;
      }
    } catch (err) {
      lastError = err;
      console.warn(`Error trying ${model}:`, err);
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

export const geminiService = {
  async testApiKey(key: string): Promise<{ success: boolean; message: string }> {
    if (!key || !key.trim()) {
      return { success: false, message: 'La clave no puede estar vacía.' };
    }
    try {
      const result = await callGeminiApi(
        key.trim(),
        'Responde con JSON: {"status": "ok"}',
        'Eres un evaluador del sistema.'
      );
      const parsed = JSON.parse(sanitizeJson(result));
      if (parsed.status === 'ok' || result) {
        return { success: true, message: '¡API Key válida y conectada con éxito!' };
      }
      return { success: false, message: 'Respuesta inesperada de Gemini.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Clave inválida o error de conexión.' };
    }
  },

  async generateRound(
    difficulty: string = 'Niños',
    customCategory: string = '',
    gameMode: GameMode = 'CLASICO',
    playedWords: string[] = []
  ): Promise<{ round: GameRoundResponse; isFromAi: boolean }> {
    const apiKey = storageService.getApiKey();

    if (!apiKey || apiKey === 'MY_API_KEY') {
      console.log('No API Key found, using local curated bank.');
      return {
        round: getRandomFallbackRound(difficulty, customCategory, playedWords),
        isFromAi: false
      };
    }

    const dfLevel = difficulty.toLowerCase().includes('niñ')
      ? 'niños de 8 a 12 años, con palabras cotidianas, fáciles y divertidas.'
      : 'adultos y gamers. Usa cultura pop, películas, tecnología, gastronomía, anime, superhéroes, etc.';

    const isUndercover = gameMode === 'UNDERCOVER';

    const systemInstruction = `Eres el director de "El Impostor", un juego de deducción social para ${dfLevel}.
Reglas de salida:
- Responde EXCLUSIVAMENTE con un JSON válido.
- Formato esperado:
{
  "categoria": "Nombre de la Categoría",
  "palabra_secreta": "Palabra para la tripulación",
  ${isUndercover ? '"palabra_undercover": "Palabra similar y muy parecida para el infiltrado",' : ''}
  "comodin": "Pista de 1 sola palabra para el impostor"
}

Importante:
${isUndercover
  ? 'En modo Undercover, "palabra_secreta" y "palabra_undercover" DEBEN ser dos conceptos hermanos de la misma categoría que se puedan confundir fácilmente (ej: Perro y Gato, Café y Té, Spider-Man y Batman, Pizza y Hamburguesa, Oro y Plata).'
  : 'En modo Clásico, "palabra_secreta" debe ser un elemento muy conocido de la categoría, y "comodin" debe ser una pista sutil de una sola palabra.'
}`;

    const promptText = `
${customCategory.trim() ? `Genera una ronda de alta calidad para la categoría específica: "${customCategory.trim()}".` : 'Genera una categoría y palabras divertidas y originales.'}
${playedWords.length > 0 ? `PROHIBIDO usar cualquiera de estas palabras previas: ${playedWords.slice(-20).join(', ')}.` : ''}
¡Responde solo con el JSON!`;

    try {
      const rawText = await callGeminiApi(apiKey, promptText, systemInstruction);
      const parsed = JSON.parse(sanitizeJson(rawText));

      return {
        round: {
          categoria: customCategory.trim() || parsed.categoria || 'Tema Libre',
          palabra_secreta: parsed.palabra_secreta || 'Manzana',
          palabra_undercover: parsed.palabra_undercover || (isUndercover ? (parsed.comodin || 'Pera') : undefined),
          comodin: parsed.comodin || 'Pista'
        },
        isFromAi: true
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local bank:', err);
      return {
        round: getRandomFallbackRound(difficulty, customCategory, playedWords),
        isFromAi: false
      };
    }
  },

  async validateImpostorDefense(
    secretWord: string,
    category: string,
    guess: string
  ): Promise<ValidationResponse> {
    const cleanGuess = normalizeString(guess);
    const cleanSecret = normalizeString(secretWord);

    if (cleanGuess === cleanSecret || (cleanSecret.includes(cleanGuess) && cleanGuess.length >= 3)) {
      return {
        acerto: true,
        explicacion: `¡Correcto! "${guess}" es la palabra secreta.`,
        palabra_ingresada: guess
      };
    }

    const apiKey = storageService.getApiKey();
    if (!apiKey) {
      const isClose = cleanGuess.length > 2 && (cleanSecret.includes(cleanGuess) || cleanGuess.includes(cleanSecret));
      return {
        acerto: isClose,
        explicacion: isClose
          ? `¡Válido! Tu respuesta "${guess}" se considera correcta.`
          : `Fallaste. La palabra secreta era "${secretWord}".`,
        palabra_ingresada: guess
      };
    }

    const systemInstruction = 'Eres juez en el juego El Impostor. Responde únicamente con JSON: {"acerto": true/false, "explicacion": "frase corta en español"}';
    const promptText = `Palabra real: "${secretWord}" (Categoría: "${category}"). El jugador dijo: "${guess}". ¿Es correcto o sinónimo válido?`;

    try {
      const rawText = await callGeminiApi(apiKey, promptText, systemInstruction);
      const parsed = JSON.parse(sanitizeJson(rawText));
      return {
        acerto: Boolean(parsed.acerto),
        explicacion: parsed.explicacion || (parsed.acerto ? '¡Adivinanza correcta!' : `Era "${secretWord}".`),
        palabra_ingresada: guess
      };
    } catch {
      const isMatch = cleanGuess === cleanSecret;
      return {
        acerto: isMatch,
        explicacion: isMatch
          ? `¡Acertaste! La palabra era ${secretWord}.`
          : `No acertaste. La palabra real era "${secretWord}".`,
        palabra_ingresada: guess
      };
    }
  }
};
