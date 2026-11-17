
"use client";

import { useCallback, useEffect, useState } from "react";

import GameRoad from "./GameRoad";
import GameCharacter from "./GameCharacter";
import GameObstacle from "./GameObstacle";
import GameHeader from "./GameHeader";
import GameOverDialog from "./GameOverDialog";
import GameSetupDialog from "./GameSetupDialog";

import { useGameLoop } from "@/hooks/useGameLoop";
import { usePlayerControls } from "@/hooks/usePlayerControls";
import { saveLeaderboardEntry } from "@/utils/leaderboard";

import {
  CHALLENGE_DURATION,
  GAME_WIDTH,
  GAME_HEIGHT,
} from "@/constants/game";

import type { GamePhase, GameResult, Lane } from "@/types/game";

const GAME_RESULT_STORAGE_KEY = "bike-traveler-resume-result-v1";

interface SavedGameResult {
  playerCode: string;
  timeRemaining: number;
  speed: number;
  distance: number;
  completed: boolean;
}

function isSavedGameResult(value: unknown): value is SavedGameResult {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return (
    "playerCode" in value &&
    typeof value.playerCode === "string" &&
    /^[A-Z]{3}$/.test(value.playerCode) &&
    "timeRemaining" in value &&
    typeof value.timeRemaining === "number" &&
    Number.isFinite(value.timeRemaining) &&
    value.timeRemaining >= 0 &&
    value.timeRemaining <= CHALLENGE_DURATION &&
    "speed" in value &&
    typeof value.speed === "number" &&
    Number.isFinite(value.speed) &&
    value.speed >= 0 &&
    "distance" in value &&
    typeof value.distance === "number" &&
    Number.isFinite(value.distance) &&
    value.distance >= 0 &&
    "completed" in value &&
    typeof value.completed === "boolean"
  );
}

export default function GameScene() {
  const [lane, setLane] = useState<Lane>("right");
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [playerCode, setPlayerCode] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const saveResult = useCallback(
    ({ distance, highestSpeed }: GameResult) => {
      if (!playerCode) return;

      try {
        saveLeaderboardEntry({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          playerCode,
          distance,
          highestSpeed,
          playedAt: new Date().toISOString(),
        });
        setLeaderboardError(null);
      } catch (error) {
        console.error("Could not save the leaderboard result.", error);
        setLeaderboardError(
          "This run could not be saved to the leaderboard. Check browser storage and try again."
        );
      }
    },
    [playerCode]
  );

  const handleGameOver = useCallback(
    (result: GameResult) => {
      saveResult(result);
      setPhase("gameOver");
    },
    [saveResult]
  );

  const handleChallengeComplete = useCallback(
    (result: GameResult) => {
      saveResult(result);
      setChallengeCompleted(true);
      setPhase("results");
    },
    [saveResult]
  );

  const {
    frame,
    timeRemaining,
    speed,
    distance,
    resetGame,
    restoreResult,
  } = useGameLoop({
    isPlaying: phase === "playing",
    lane,
    onGameOver: handleGameOver,
    onChallengeComplete: handleChallengeComplete,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const savedResult = window.sessionStorage.getItem(
          GAME_RESULT_STORAGE_KEY
        );
        if (savedResult === null) return;

        window.sessionStorage.removeItem(GAME_RESULT_STORAGE_KEY);
        const parsedResult: unknown = JSON.parse(savedResult);
        if (!isSavedGameResult(parsedResult)) {
          throw new Error("Saved game result is invalid.");
        }

        restoreResult(parsedResult);
        setPlayerCode(parsedResult.playerCode);
        setChallengeCompleted(parsedResult.completed);
        setPhase("results");
        setLeaderboardError(null);
      } catch (error) {
        console.error("Could not restore the previous game result.", error);
        setLeaderboardError("The previous game result could not be restored.");
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [restoreResult]);

  // Player controls
  const moveLeft = useCallback(() => {
    setLane("left");
  }, []);

  const moveRight = useCallback(() => {
    setLane("right");
  }, []);

  usePlayerControls({
    onMoveLeft: moveLeft,
    onMoveRight: moveRight,
    enabled: phase === "playing",
  });

  // Game Over transition
  useEffect(() => {
    if (phase !== "gameOver") return;

    const timeout = window.setTimeout(() => {
      setPhase("results");
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "countdown" || countdown === null) return;

    const timeout = window.setTimeout(() => {
      if (countdown === 1) {
        setCountdown(null);
        setPhase("playing");
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [countdown, phase]);

  const handleStart = useCallback(
    (code: string) => {
      resetGame();
      setLane("right");
      setChallengeCompleted(false);
      setPlayerCode(code);
      setLeaderboardError(null);
      setCountdown(3);
      setPhase("countdown");
    },
    [resetGame]
  );

  const handlePlayAgain = useCallback(() => {
    handleStart(playerCode);
  }, [handleStart, playerCode]);

  const handleNewPlayer = useCallback(() => {
    resetGame();
    setLane("right");
    setChallengeCompleted(false);
    setPlayerCode("");
    setLeaderboardError(null);
    setCountdown(null);
    setPhase("setup");
  }, [resetGame]);

  const handleOpenLeaderboards = useCallback(() => {
    try {
      const savedResult: SavedGameResult = {
        playerCode,
        timeRemaining,
        speed,
        distance,
        completed: challengeCompleted,
      };
      window.sessionStorage.setItem(
        GAME_RESULT_STORAGE_KEY,
        JSON.stringify(savedResult)
      );
    } catch (error) {
      console.error("Could not save the game result for restoration.", error);
      setLeaderboardError(
        "The game result may not be restored when you return from leaderboards."
      );
    }
  }, [challengeCompleted, distance, playerCode, speed, timeRemaining]);

  return (
    <div className="w-full">
      <GameHeader
        title="Bike Traveler"
        playerCode={playerCode}
        timeRemaining={timeRemaining}
        distance={distance}
        speed={speed}
      />

      <div className="relative h-[70vh] min-h-[400px] w-full overflow-hidden rounded-xl bg-neutral-900">
        <GameRoad
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          offset={frame.offset}
        />

        <GameObstacle obstacles={frame.obstacles} />

        <GameCharacter
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          config={{
            lane,
            sizeRatio: 0.065,
            verticalPosition: 0.72,
          }}
        />

        {phase === "setup" && <GameSetupDialog onStart={handleStart} />}

        {phase === "countdown" && countdown !== null && (
          <div
            aria-live="assertive"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 text-white backdrop-blur-sm"
          >
            <p className="text-lg font-semibold uppercase tracking-[0.3em]">
              Get ready
            </p>
            <span className="mt-2 text-8xl font-black tabular-nums">
              {countdown}
            </span>
          </div>
        )}

        <GameOverDialog
          phase={phase}
          timeRemaining={timeRemaining}
          distance={distance}
          speed={speed}
          completed={challengeCompleted}
          saveError={leaderboardError}
          onPlayAgain={handlePlayAgain}
          onNewPlayer={handleNewPlayer}
          onOpenLeaderboards={handleOpenLeaderboards}
        />
      </div>
    </div>
  );
}
