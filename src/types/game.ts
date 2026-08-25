export type GamePhase =
  | 'SETUP'
  | 'PASS_AND_PLAY_LOBBY'
  | 'HANDOFF_REVEAL'
  | 'REVEAL_CARD'
  | 'MODO_TABLERO'
  | 'VOTING_HANDOFF'
  | 'VOTING_CAST'
  | 'VOTING_TALLY'
  | 'ULTIMA_DEFENSA'
  | 'GAME_OVER_SCREEN';

export type GameMode = 'CLASICO' | 'UNDERCOVER';
export type PlayerRole = 'TRIPULANTE' | 'IMPOSTOR' | 'UNDERCOVER' | 'BROMISTA';

export interface GamePlayer {
  id: number;
  name: string;
  avatarIndex: number;
  role: PlayerRole;
  assignedWord: string;
  score: number;             // Tournament score
  roundScoreEarned?: number; // Score gained in current round
  revealedRole?: boolean;
}

export interface GameRoundResponse {
  categoria: string;
  palabra_secreta: string;      // Palabra de tripulantes
  palabra_undercover?: string;  // Palabra similar de undercover
  comodin: string;              // Pista para el impostor clásico
}

export interface ValidationResponse {
  acerto: boolean;
  explicacion: string;
  palabra_ingresada?: string;
}

export interface GameHistoryItem {
  id: string;
  date: string;
  categoria: string;
  palabraSecreta: string;
  palabraUndercover?: string;
  impostorName: string;
  winnerTeam: 'IMPOSTOR' | 'TRIPULANTES' | 'BROMISTA';
  playersCount: number;
  difficulty: string;
  gameMode: GameMode;
  hasJester: boolean;
  lastGuess?: string;
  mostVotedName?: string;
}
