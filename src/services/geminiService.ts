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

export const geminiService = {
  async generateRound(
    difficulty: string = 'Niños',
    customCategory: string = '',
    gameMode: GameMode = 'CLASICO',
    playedWords: string[] = []
  ): Promise<{ round: GameRoundResponse; isFromAi: boolean }> {
    const apiKey = storageService.getApiKey();

    if (!apiKey || apiKey === 'MY_API_KEY') {
      console.log('No Gemini API key found, using local curated bank.');
      return {
        round: getRandomFallbackRound(difficulty, customCategory, playedWords),
        isFromAi: false
      };
    }

    const dfLevel = difficulty.toLowerCase().includes('niñ')
      ? 'niños de 8 a 12 años, con palabras divertidas, claras y cotidianas.'
      : 'adultos expertos y gamers. Usa conceptos intrigantes, cultura pop, cine, gastronomía, ciencia o historia.';

    const isUndercover = gameMode === 'UNDERCOVER';

    const systemInstruction = `Eres el director de un juego de deducción social llamado "El Impostor", diseñado para ${dfLevel}.
${isUndercover ? 'MODO UNDERCOVER (Palabras Similares): Debes generar DOS palabras hermanas/parecidas (ej: Café y Té, Perro y Gato, Pizza y Hamburguesa).' : 'MODO CLÁSICO: Genera una palabra secreta y un comodín para el impostor.'}

Reglas:
1. La "palabra_secreta" pertenece directamente a la categoría.
${isUndercover ? '2. La "palabra_undercover" DEBE ser del mismo tipo o categoría que "palabra_secreta", pero claramente distinta.' : '2. El "comodin" es una pista de UNA SOLA PALABRA (sin espacios) para ayudar al impostor.'}
3. Responde ÚNICAMENTE con un objeto JSON válido con este esquema:
{"categoria": "string", "palabra_secreta": "string", ${isUndercover ? '"palabra_undercover": "string", ' : ''}"comodin": "string"}`;

    const promptText = `
${customCategory.trim() ? `Genera una ronda EXCLUSIVAMENTE para la categoría: "${customCategory}".` : 'Inventa una categoría súper divertida, aleatoria y original para esta partida.'}
${playedWords.length > 0 ? `ESTÁ ESTRICTAMENTE PROHIBIDO usar cualquiera de estas palabras previas: ${playedWords.join(', ')}.` : ''}
¡Responde solo con el JSON!`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { responseMimeType: 'application/json', temperature: 0.95 }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(sanitizeJson(rawText));
      return {
        round: {
          categoria: customCategory.trim() || parsed.categoria,
          palabra_secreta: parsed.palabra_secreta,
          palabra_undercover: parsed.palabra_undercover || (isUndercover ? parsed.comodin : undefined),
          comodin: parsed.comodin || 'Pista'
        },
        isFromAi: true
      };
    } catch (err) {
      console.warn('Fallo Gemini, usando banco local:', err);
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

    if (cleanGuess === cleanSecret || (cleanSecret.includes(cleanGuess) && cleanGuess.length >= 4)) {
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

    const promptText = `
Actúa como juez del juego "El Impostor".
La palabra secreta real era: "${secretWord}" (Categoría: "${category}").
El impostor acusado intentó adivinar la palabra y dijo: "${guess}".

Evalúa si la respuesta del impostor es correcta, sinónimo directo, o una variación válida del concepto en español.
Responde ÚNICAMENTE en formato JSON:
{"acerto": true/false, "explicacion": "Explicación breve y amigable en español de 1 oración."}
`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('API failed');

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(sanitizeJson(rawText));
      return {
        acerto: Boolean(parsed.acerto),
        explicacion: parsed.explicacion || (parsed.acerto ? '¡Adivinanza correcta!' : `No acertó. Era "${secretWord}".`),
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
