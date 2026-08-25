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
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const ENDPOINTS_TO_TRY = [
  { apiVersion: 'v1beta', model: 'gemini-2.0-flash' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash-latest' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash' },
  { apiVersion: 'v1', model: 'gemini-1.5-flash' },
  { apiVersion: 'v1beta', model: 'gemini-1.5-flash-8b' }
];

async function callGeminiApi(apiKey: string, promptText: string, systemInstruction: string): Promise<string> {
  let lastErrorMsg = '';

  for (const { apiVersion, model } of ENDPOINTS_TO_TRY) {
    try {
      const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey.trim()}`;
      
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\n${promptText}` }]
          }
        ],
        generationConfig: {
          temperature: 0.9
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    } catch (err: any) {
      lastErrorMsg = err.message || 'Error de red';
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
    } catch (err: any) {
      return { success: false, message: `Error de API: ${err.message}` };
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

    const dfLevel = difficulty.toLowerCase().includes('niñ')
      ? 'niños de 8 a 12 años, con conceptos conocidos, divertidos y cotidianos.'
      : 'adultos y gamers. Puedes usar cultura pop, cine, personajes históricos o bíblicos, gastronomía, ciencia, etc.';

    const isUndercover = gameMode === 'UNDERCOVER';

    const systemInstruction = `Eres el director del juego de deducción social "El Impostor". Diseñado para ${dfLevel}.
Reglas estrictas de respuesta:
1. Responde ÚNICAMENTE con un bloque JSON sin texto adicional.
2. Estructura requerida:
{
  "categoria": "Nombre claro de la categoría",
  "palabra_secreta": "Palabra para los tripulantes",
  ${isUndercover ? '"palabra_undercover": "Palabra hermana MUY parecida de la misma categoría",' : ''}
  "comodin": "Pista de 1 sola palabra para el impostor"
}
${isUndercover ? 'IMPORTANTE UNDERCOVER: "palabra_secreta" y "palabra_undercover" DEBEN pertenecer exactamente a la misma categoría y ser fáciles de confundir (ej: Moisés y Noé, Batman y Spider-Man, Café y Té, Pizza y Hamburguesa).' : 'En modo Clásico, "palabra_secreta" debe ser un elemento muy representativo de la categoría y "comodin" una pista sutil.'}`;

    const promptText = `
${customCategory.trim() ? `Genera una ronda EXCLUSIVAMENTE para la categoría: "${customCategory.trim()}".` : 'Genera una categoría súper original y divertida para esta partida.'}
${playedWords.length > 0 ? `Palabras previas prohibidas: ${playedWords.slice(-15).join(', ')}.` : ''}
¡Responde solo con el JSON!`;

    try {
      const rawText = await callGeminiApi(apiKey, promptText, systemInstruction);
      const parsed = JSON.parse(sanitizeJson(rawText));

      return {
        round: {
          categoria: customCategory.trim() || parsed.categoria || 'Categoría Secreta',
          palabra_secreta: parsed.palabra_secreta || 'Moisés',
          palabra_undercover: parsed.palabra_undercover || (isUndercover ? (parsed.comodin || 'Noé') : undefined),
          comodin: parsed.comodin || 'Pista'
        },
        isFromAi: true
      };
    } catch (err) {
      console.warn('Gemini API fallo, usando banco local:', err);
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

    const systemInstruction = 'Eres juez en el juego El Impostor. Responde únicamente con JSON: {"acerto": true/false, "explicacion": "frase corta en español"}';
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
