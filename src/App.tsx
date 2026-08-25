import { useState, useEffect } from 'react';
import type { GamePhase, GamePlayer, ValidationResponse, GameHistoryItem, GameMode, PlayerRole } from './types/game';
import { geminiService } from './services/geminiService';
import { soundManager } from './services/soundService';
import { storageService } from './services/storageService';

import { Navbar } from './components/Navbar';
import { SetupPhase } from './components/SetupPhase';
import { PassAndPlayLobby } from './components/PassAndPlayLobby';
import { HandoffScreen } from './components/HandoffScreen';
import { RevealRoleCard } from './components/RevealRoleCard';
import { BoardPhase } from './components/BoardPhase';
import { SecretVoterCard } from './components/SecretVoterCard';
import { VoteTallyPhase } from './components/VoteTallyPhase';
import { LastDefensePhase } from './components/LastDefensePhase';
import { GameOverPhase } from './components/GameOverPhase';
import { HistoryModal } from './components/HistoryModal';
import { ApiKeyModal } from './components/ApiKeyModal';

export function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Game phase state
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('SETUP');

  // Config states
  const [numPlayers, setNumPlayers] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<string>('Niños');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [gameMode, setGameMode] = useState<GameMode>('CLASICO');
  const [hasJester, setHasJester] = useState<boolean>(false);
  const [totalTournamentRounds, setTotalTournamentRounds] = useState<number>(1);
  const [currentTournamentRound, setCurrentTournamentRound] = useState<number>(1);

  // Round data
  const [category, setCategory] = useState<string>('');
  const [secretWord, setSecretWord] = useState<string>('');
  const [undercoverWord, setUndercoverWord] = useState<string | undefined>(undefined);
  const [comodin, setComodin] = useState<string>('');
  const [isFromAi, setIsFromAi] = useState<boolean>(false);
  const [playedWords, setPlayedWords] = useState<string[]>([]);

  // Players state & reveal sequence tracking
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);

  // Secret Voting tracking
  const [voterIndex, setVoterIndex] = useState<number>(0);
  const [votes, setVotes] = useState<Record<number, number>>({}); // voterId -> suspectId

  // Impostor & Defense state
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [winnerTeam, setWinnerTeam] = useState<'IMPOSTOR' | 'TRIPULANTES' | 'BROMISTA'>('TRIPULANTES');
  const [lastGuess, setLastGuess] = useState<string>('');
  const [mostVotedPlayer, setMostVotedPlayer] = useState<GamePlayer | null>(null);

  // UI / Modals / Loading
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<GameHistoryItem[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);

  // Load storage & theme on mount
  useEffect(() => {
    setHistoryList(storageService.getHistory());
    setApiKey(storageService.getApiKey());
    const initialTheme = storageService.getTheme();
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    storageService.setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    soundManager.playPop();
  };

  // Helper: Assign roles and words to players
  const createPlayerRoster = (
    roundSec: string,
    roundUnder: string | undefined,
    existingPlayers?: GamePlayer[]
  ): GamePlayer[] => {
    const savedNames = storageService.getLastPlayerNames();
    const count = existingPlayers ? existingPlayers.length : numPlayers;

    // Pick 1 infiltrator index
    const infiltratorIdx = Math.floor(Math.random() * count);

    // Pick 1 jester index if enabled and >= 4 players
    let jesterIdx = -1;
    if (hasJester && count >= 4) {
      do {
        jesterIdx = Math.floor(Math.random() * count);
      } while (jesterIdx === infiltratorIdx);
    }

    return Array.from({ length: count }, (_, i) => {
      let role: PlayerRole = 'TRIPULANTE';
      let assignedWord = roundSec;

      if (i === infiltratorIdx) {
        if (gameMode === 'UNDERCOVER') {
          role = 'UNDERCOVER';
          assignedWord = roundUnder || roundSec;
        } else {
          role = 'IMPOSTOR';
          assignedWord = '';
        }
      } else if (i === jesterIdx) {
        role = 'BROMISTA';
        assignedWord = roundSec;
      }

      const existingScore = existingPlayers && existingPlayers[i] ? existingPlayers[i].score : 0;
      const name = existingPlayers && existingPlayers[i]
        ? existingPlayers[i].name
        : (savedNames[i] || `Jugador ${i + 1}`);

      return {
        id: i,
        name,
        avatarIndex: i,
        role,
        assignedWord,
        score: existingScore,
        roundScoreEarned: 0,
        revealedRole: false
      };
    });
  };

  // Handler: Start New Game Round
  const handleStartGame = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setValidationResult(null);
    setLastGuess('');
    setVotes({});
    setCurrentTournamentRound(1);

    try {
      const result = await geminiService.generateRound(difficulty, customCategory, gameMode, playedWords);
      setIsLoading(false);

      if (!result || !result.round.palabra_secreta) {
        throw new Error('No se pudo generar la ronda.');
      }

      const sec = result.round.palabra_secreta;
      const und = result.round.palabra_undercover;

      setCategory(result.round.categoria);
      setSecretWord(sec);
      setUndercoverWord(und);
      setComodin(result.round.comodin);
      setIsFromAi(result.isFromAi);
      setPlayedWords((prev) => [...prev, sec]);

      const newPlayers = createPlayerRoster(sec, und);
      setPlayers(newPlayers);
      setCurrentPhase('PASS_AND_PLAY_LOBBY');
      soundManager.playVictory();
    } catch {
      setIsLoading(false);
      setErrorMessage('Hubo un problema al generar la ronda. Intentando con datos locales...');
      soundManager.playError();
    }
  };

  // Handler: Update player name
  const handleUpdatePlayerName = (idx: number, newName: string) => {
    setPlayers((prev) => {
      const updated = [...prev];
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], name: newName };
      }
      storageService.saveLastPlayerNames(updated.map((p) => p.name));
      return updated;
    });
  };

  // Handler: Start reveal sequence
  const handleStartReveal = (idx: number) => {
    setActivePlayerIndex(idx);
    setCurrentPhase('HANDOFF_REVEAL');
  };

  const handleConfirmReadyForReveal = () => {
    setCurrentPhase('REVEAL_CARD');
  };

  const handleFinishRevealCard = () => {
    setPlayers((prev) => {
      const updated = [...prev];
      if (updated[activePlayerIndex]) {
        updated[activePlayerIndex] = { ...updated[activePlayerIndex], revealedRole: true };
      }
      return updated;
    });

    const nextIdx = activePlayerIndex + 1;
    if (nextIdx < players.length) {
      setActivePlayerIndex(nextIdx);
      setCurrentPhase('HANDOFF_REVEAL');
    } else {
      setCurrentPhase('PASS_AND_PLAY_LOBBY');
    }
  };

  const handleProceedToBoard = () => {
    setCurrentPhase('MODO_TABLERO');
  };

  const handleProceedToVoting = () => {
    setVoterIndex(0);
    setVotes({});
    setCurrentPhase('VOTING_HANDOFF');
  };

  const handleConfirmReadyForVoting = () => {
    setCurrentPhase('VOTING_CAST');
  };

  const handleCastVote = (voterId: number, suspectId: number) => {
    const updatedVotes = { ...votes, [voterId]: suspectId };
    setVotes(updatedVotes);

    const nextVoter = voterIndex + 1;
    if (nextVoter < players.length) {
      setVoterIndex(nextVoter);
      setCurrentPhase('VOTING_HANDOFF');
    } else {
      setCurrentPhase('VOTING_TALLY');
      soundManager.playSuspense();
      soundManager.speak("¡Todos los votos han sido registrados! Celular al centro de la mesa.");
    }
  };

  // Handler: Execute formal verdict
  const handleExecuteVerdict = (accused: GamePlayer) => {
    setMostVotedPlayer(accused);

    if (accused.role === 'BROMISTA') {
      // 1. JESTER TRIUMPH!
      soundManager.speak(`¡Increíble! ${accused.name} era el Bromista y ha engañado a la mesa. ¡Gana la partida!`);
      setWinnerTeam('BROMISTA');
      applyTournamentScores('BROMISTA', accused.id);
      saveGameToHistory('BROMISTA', undefined, accused.name);
      setCurrentPhase('GAME_OVER_SCREEN');
    } else if (accused.role === 'IMPOSTOR' || accused.role === 'UNDERCOVER') {
      // 2. Infiltrator caught! Gives Last Defense
      soundManager.speak(`¡Atrapado! ${accused.name} era el infiltrado. Pero tiene una última oportunidad.`);
      setCurrentPhase('ULTIMA_DEFENSA');
    } else {
      // 3. Innocent Crewmate expelled! Impostor wins
      soundManager.speak(`¡Error fatal! ${accused.name} era un tripulante inocente. ¡El Infiltrado ha ganado!`);
      setWinnerTeam('IMPOSTOR');
      applyTournamentScores('IMPOSTOR', accused.id);
      saveGameToHistory('IMPOSTOR', undefined, accused.name);
      setCurrentPhase('GAME_OVER_SCREEN');
    }
  };

  // Handler: Validate Impostor's defense guess
  const handleValidateGuess = async (guess: string) => {
    setIsLoading(true);
    setLastGuess(guess);

    const result = await geminiService.validateImpostorDefense(secretWord, category, guess);
    setIsLoading(false);
    setValidationResult(result);

    if (result.acerto) {
      setWinnerTeam('IMPOSTOR');
      applyTournamentScores('IMPOSTOR_DEFENSE_WIN', mostVotedPlayer?.id);
      saveGameToHistory('IMPOSTOR', guess, mostVotedPlayer?.name);
    } else {
      setWinnerTeam('TRIPULANTES');
      applyTournamentScores('TRIPULANTES', mostVotedPlayer?.id);
      saveGameToHistory('TRIPULANTES', guess, mostVotedPlayer?.name);
    }
  };

  // Helper: Apply scoring to players
  const applyTournamentScores = (outcome: 'BROMISTA' | 'IMPOSTOR' | 'IMPOSTOR_DEFENSE_WIN' | 'TRIPULANTES', accusedId?: number) => {
    const infiltrator = players.find(p => p.role === 'IMPOSTOR' || p.role === 'UNDERCOVER');
    const jester = players.find(p => p.role === 'BROMISTA');

    setPlayers(prev => prev.map(player => {
      let roundPts = 0;

      if (outcome === 'BROMISTA') {
        if (player.id === jester?.id) roundPts = 5;
      } else if (outcome === 'IMPOSTOR') {
        // Impostor survived or innocent was expelled
        if (player.id === infiltrator?.id) roundPts = 3;
      } else if (outcome === 'IMPOSTOR_DEFENSE_WIN') {
        // Impostor caught but guessed the word
        if (player.id === infiltrator?.id) roundPts = 4;
      } else if (outcome === 'TRIPULANTES') {
        // Crew caught infiltrator and infiltrator failed guess
        if (player.role === 'TRIPULANTE') roundPts += 2;
        // Bonus for voting correctly
        if (accusedId !== undefined && votes[player.id] === accusedId) roundPts += 1;
      }

      return {
        ...player,
        score: player.score + roundPts,
        roundScoreEarned: roundPts
      };
    }));
  };

  // Helper: Save game outcome to History in LocalStorage
  const saveGameToHistory = (winner: 'IMPOSTOR' | 'TRIPULANTES' | 'BROMISTA', guess?: string, accusedName?: string) => {
    const infiltrator = players.find((p) => p.role === 'IMPOSTOR' || p.role === 'UNDERCOVER');
    const historyItem: GameHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      categoria: category,
      palabraSecreta: secretWord,
      palabraUndercover: undercoverWord,
      impostorName: infiltrator ? infiltrator.name : 'Desconocido',
      winnerTeam: winner,
      playersCount: players.length,
      difficulty,
      gameMode,
      hasJester,
      lastGuess: guess,
      mostVotedName: accusedName
    };

    storageService.saveGameResult(historyItem);
    setHistoryList(storageService.getHistory());
  };

  // Handler: Play next tournament round with same players
  const handlePlayNextTournamentRound = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setValidationResult(null);
    setLastGuess('');
    setVotes({});

    const nextRoundNumber = currentTournamentRound >= totalTournamentRounds ? 1 : currentTournamentRound + 1;
    setCurrentTournamentRound(nextRoundNumber);

    try {
      const result = await geminiService.generateRound(difficulty, customCategory, gameMode, playedWords);
      setIsLoading(false);

      const sec = result.round.palabra_secreta;
      const und = result.round.palabra_undercover;

      setCategory(result.round.categoria);
      setSecretWord(sec);
      setUndercoverWord(und);
      setComodin(result.round.comodin);
      setIsFromAi(result.isFromAi);
      setPlayedWords((prev) => [...prev, sec]);

      // If starting a fresh tournament, reset scores; otherwise preserve accumulated tournament points
      const basePlayers = nextRoundNumber === 1
        ? players.map(p => ({ ...p, score: 0 }))
        : players;

      const updatedPlayers = createPlayerRoster(sec, und, basePlayers);
      setPlayers(updatedPlayers);
      setActivePlayerIndex(0);
      setCurrentPhase('PASS_AND_PLAY_LOBBY');
      soundManager.playVictory();
    } catch {
      setIsLoading(false);
      setErrorMessage('Error al generar la siguiente ronda.');
    }
  };

  const handleNewGameSetup = () => {
    setCurrentPhase('SETUP');
  };

  const impostorPlayer = players.find((p) => p.role === 'IMPOSTOR' || p.role === 'UNDERCOVER') || players[0];
  const jesterPlayer = players.find((p) => p.role === 'BROMISTA');

  return (
    <div className="min-h-screen bg-[#FFFBEB] dark:bg-slate-950 text-[#2B2D42] dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-200 dark:selection:bg-indigo-900 transition-colors">
      
      {/* Top Navigation */}
      <Navbar
        currentPhase={currentPhase}
        onReset={handleNewGameSetup}
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isVoiceEnabled={isVoiceEnabled}
        setIsVoiceEnabled={setIsVoiceEnabled}
        apiKeySet={Boolean(apiKey)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col justify-center py-2">
        {currentPhase === 'SETUP' && (
          <SetupPhase
            numPlayers={numPlayers}
            setNumPlayers={setNumPlayers}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            customCategory={customCategory}
            setCustomCategory={setCustomCategory}
            gameMode={gameMode}
            setGameMode={setGameMode}
            hasJester={hasJester}
            setHasJester={setHasJester}
            tournamentRounds={totalTournamentRounds}
            setTournamentRounds={setTotalTournamentRounds}
            onStartGame={handleStartGame}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {currentPhase === 'PASS_AND_PLAY_LOBBY' && (
          <PassAndPlayLobby
            players={players}
            onStartReveal={handleStartReveal}
            onAllRolesReviewed={handleProceedToBoard}
            onUpdatePlayerName={handleUpdatePlayerName}
            category={category}
            isFromAi={isFromAi}
          />
        )}

        {/* Interstitial Safe Handoff Screen */}
        {currentPhase === 'HANDOFF_REVEAL' && players[activePlayerIndex] && (
          <HandoffScreen
            targetPlayer={players[activePlayerIndex]}
            playerIndex={activePlayerIndex}
            totalPlayers={players.length}
            mode="REVEAL"
            onConfirmReady={handleConfirmReadyForReveal}
          />
        )}

        {/* Private Role Reveal Card */}
        {currentPhase === 'REVEAL_CARD' && players[activePlayerIndex] && (
          <RevealRoleCard
            player={players[activePlayerIndex]}
            category={category}
            secretWord={secretWord}
            comodin={comodin}
            onFinishReveal={handleFinishRevealCard}
            playerIndex={activePlayerIndex}
            totalPlayers={players.length}
          />
        )}

        {/* Board Table Mode */}
        {currentPhase === 'MODO_TABLERO' && (
          <BoardPhase
            players={players}
            category={category}
            onProceedToVoting={handleProceedToVoting}
          />
        )}

        {/* Safe Interstitial Screen before Voting */}
        {currentPhase === 'VOTING_HANDOFF' && players[voterIndex] && (
          <HandoffScreen
            targetPlayer={players[voterIndex]}
            playerIndex={voterIndex}
            totalPlayers={players.length}
            mode="VOTE"
            onConfirmReady={handleConfirmReadyForVoting}
          />
        )}

        {/* Secret Voter Card */}
        {currentPhase === 'VOTING_CAST' && players[voterIndex] && (
          <SecretVoterCard
            voter={players[voterIndex]}
            allPlayers={players}
            category={category}
            onCastVote={handleCastVote}
            voterIndex={voterIndex}
            totalVoters={players.length}
          />
        )}

        {/* Central Table Tally of Votes */}
        {currentPhase === 'VOTING_TALLY' && (
          <VoteTallyPhase
            players={players}
            votes={votes}
            category={category}
            onExecuteVerdict={handleExecuteVerdict}
          />
        )}

        {/* Impostor's Last Defense with Voice Dictation */}
        {currentPhase === 'ULTIMA_DEFENSA' && impostorPlayer && (
          <LastDefensePhase
            impostorPlayer={impostorPlayer}
            category={category}
            secretWord={secretWord}
            onValidateGuess={handleValidateGuess}
            isLoading={isLoading}
            validationResult={validationResult}
            onProceedToGameOver={() => setCurrentPhase('GAME_OVER_SCREEN')}
          />
        )}

        {/* Game Over Screen with Leaderboard */}
        {currentPhase === 'GAME_OVER_SCREEN' && impostorPlayer && (
          <GameOverPhase
            winnerTeam={winnerTeam}
            impostorPlayer={impostorPlayer}
            jesterPlayer={jesterPlayer}
            category={category}
            secretWord={secretWord}
            undercoverWord={undercoverWord}
            comodin={comodin}
            lastGuess={lastGuess}
            allPlayers={players}
            currentTournamentRound={currentTournamentRound}
            totalTournamentRounds={totalTournamentRounds}
            onPlayNextTournamentRound={handlePlayNextTournamentRound}
            onNewGameSetup={handleNewGameSetup}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 border-t border-amber-200/40 dark:border-slate-800 transition-colors">
        <span>El Impostor AI Pro · Diseñado para jugar en grupo y en móviles 🚀</span>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={(k) => {
          storageService.setApiKey(k);
          setApiKey(k);
        }}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={historyList}
        onClearHistory={() => {
          storageService.clearHistory();
          setHistoryList([]);
        }}
      />
    </div>
  );
}

export default App;
