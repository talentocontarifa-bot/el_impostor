import type { GameRoundResponse, ValidationResponse, GameMode } from '../types/game';
import { getRandomFallbackRound } from '../data/defaultRounds';
import { storageService } from './storageService';

function sanitizeJson(raw: string): string {
  let str = raw.trim();
  // Extract content inside ```json ... ``` or ``` ... ```
  const jsonMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    str = jsonMatch[1].trim();
  }
  // If still contains outer braces, grab substring between first { and last }
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    str = str.substring(firstBrace, lastBrace + 1);
  }
  return str.trim();
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const ENDPOINTS_TO_TRY = [
  { apiVersion: 'v1beta', model: 'gemini-2.0-flash' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash-latest' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash' },
  { apiVersion: 'v1', model: 'gemini-1.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash-8b' }
];

// Module-level AbortController so we can cancel in-flight requests
let currentAbortController: AbortController | null = null;

async function callGeminiApi(
  apiKey: string,
  promptText: string,
  systemInstruction: string,
  signal?: AbortSignal
): Promise<string> {
  let lastErrorMsg = '';

  for (const { apiVersion, model } of ENDPOINTS_TO_TRY) {
    if (signal?.aborted) throw new Error('Petición cancelada');

    try {
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`;

      // Build payload with proper system_instruction separation
      const payload: Record<string, unknown> = {
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.8
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // API key in header — NOT in query string to avoid logs/referrer leaks
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify(payload),
        signal
      });

      if (!res.ok) {
        const errText = await res.text();
        lastErrorMsg = `HTTP ${res.status} (${model}): ${errText}`;
        console.warn(`Attempt failed for ${model}:`, lastErrorMsg);
        continue;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return text;
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') throw err;
      lastErrorMsg = (err as Error)?.message || 'Error de red';
      console.warn(`Fetch error for ${model}:`, err);
    }
  }

  throw new Error(lastErrorMsg || 'No se pudo conectar con ningún modelo de Gemini.');
}

export const geminiService = {
  async testApiKey(key: string): Promise<{ success: boolean; message: string }> {
    if (!key || !key.trim()) {
      return { success: false, message: 'La clave no puede estar vacía.' };
    }
    try {
      const result = await callGeminiApi(
        key.trim(),
        'Responde exactamente con: {"status": "ok"}',
        'Eres un evaluador de conexión. Responde solo con JSON.'
      );
      if (result && result.includes('status')) {
        return { success: true, message: '¡API Key válida y conectada con éxito! 🎉' };
      }
      return { success: true, message: '¡Conexión exitosa con Gemini AI! 🚀' };
    } catch (err: unknown) {
      return { success: false, message: `Error de API: ${(err as Error)?.message}` };
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
      return {
        round: getRandomFallbackRound(difficulty, customCategory, playedWords),
        isFromAi: false
      };
    }

    // Cancel any previous in-flight request
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    const dfLevel = difficulty.toLowerCase().includes('niñ')
      ? 'niños de 8 a 12 años, con conceptos conocidos, divertidos y cotidianos'
      : 'adultos y gamers. Puedes usar cultura pop, cine, personajes históricos o bíblicos, gastronomía, ciencia, etc.';

    const isUndercover = gameMode === 'UNDERCOVER';
    const targetCategory = customCategory.trim();

    const systemInstruction = `Eres el director del juego de deducción social "El Impostor", diseñado para ${dfLevel}.
REGLAS DE RESPUESTA ESTRICTAS:
1. Responde ÚNICAMENTE con JSON puro, sin texto adicional, sin markdown, sin explicaciones.
2. Estructura exacta requerida:
{
  "categoria": "${targetCategory || 'Nombre claro de la categoría generada'}",
  "palabra_secreta": "Palabra o personaje representativo de esa categoría",
  ${isUndercover ? '"palabra_undercover": "Palabra hermana muy parecida de la MISMA categoría",' : ''}
  "comodin": "Una sola palabra pista sutil para el impostor"
}
${targetCategory ? `OBLIGATORIO: La categoría en el JSON DEBE ser exactamente "${targetCategory}" y tanto "palabra_secreta" como "comodin" DEBEN pertenecer a esa categoría.` : ''}
${isUndercover ? `UNDERCOVER: "palabra_secreta" y "palabra_undercover" DEBEN ser de la misma categoría y fáciles de confundir (ej: Moisés/Noé, Batman/Spider-Man, Café/Té, Pizza/Hamburguesa).` : ''}`;

    const promptText = `${targetCategory ? `Genera una ronda para la categoría EXACTA: "${targetCategory}".` : 'Genera una categoría original y divertida para esta partida.'}
${playedWords.length > 0 ? `Palabras YA USADAS (no repetir): ${playedWords.slice(-15).join(', ')}.` : ''}
Responde solo con el JSON.`;

    try {
      const rawText = await callGeminiApi(apiKey, promptText, systemInstruction, signal);
      const parsed = JSON.parse(sanitizeJson(rawText));

      // Validate: if a specific category was requested, ensure the response honors it
      const returnedCategory = parsed.categoria || '';
      const resolvedCategory = targetCategory
        ? targetCategory  // Always trust the user-requested category
        : (returnedCategory || 'Categoría Secreta');

      const secretWord = parsed.palabra_secreta;
      if (!secretWord || typeof secretWord !== 'string' || secretWord.trim() === '') {
        throw new Error('Respuesta de IA sin palabra_secreta válida, usando banco local.');
      }

      return {
        round: {
          categoria: resolvedCategory,
          palabra_secreta: secretWord.trim(),
          palabra_undercover: isUndercover
            ? (parsed.palabra_undercover?.trim() || parsed.comodin?.trim() || 'Noé')
            : undefined,
          comodin: (parsed.comodin || 'Pista').trim()
        },
        isFromAi: true
      };
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        throw err; // bubble up cancellation
      }
      console.warn('Gemini API falló, usando banco local:', err);
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
        explicacion: `¡Exacto! "${guess}" es la palabra secreta.`,
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

    const systemInstruction = 'Eres juez en el juego El Impostor. Responde únicamente con JSON válido: {"acerto": true o false, "explicacion": "frase corta en español"}. Sin texto adicional.';
    const promptText = `Palabra secreta real: "${secretWord}" (Categoría: "${category}"). El jugador dijo: "${guess}". ¿Es correcto o sinónimo válido?`;

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
