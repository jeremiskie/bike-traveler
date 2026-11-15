
"use client";

import { useCallback, useEffect, useState } from "react";

import GameRoad from "./GameRoad";
import GameCharacter from "./GameCharacter";
import GameObstacle from "./GameObstacle";
import GameHeader from "./GameHeader";
import GameOverDialog from "./GameOverDialog";

import { useGameLoop } from "@/hooks/useGameLoop";
import { usePlayerControls } from "@/hooks/usePlayerControls";

import {
  GAME_WIDTH,
  GAME_HEIGHT,
} from "@/constants/game";

import { getObstaclePosition } from "@/utils/gameUtils";

import type { GamePhase, Lane, Obstacle } from "@/types/game";

export default function GameScene() {
  const [lane, setLane] = useState<Lane>("right");
  const [phase, setPhase] = useState<GamePhase>("playing");

  const handleGameOver = useCallback(() => {
    setPhase("gameOver");
  }, []);

  const {
    frame,
    elapsedTime,
    speed,
    distance,
    resetGame,
  } = useGameLoop({
    isPlaying: phase === "playing",
    lane,
    onGameOver: handleGameOver,
  });

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

  // Restart game
  const handlePlayAgain = useCallback(() => {
    resetGame();
    setLane("right");
    setPhase("playing");
  }, [resetGame]);

  // Render obstacles
  const renderObstacle = (obstacle: Obstacle) => {
    const { x, y, size } = getObstaclePosition(obstacle);

    return (
      <GameObstacle
        key={obstacle.id}
        x={x}
        y={y}
        size={size}
      />
    );
  };

  return (
    <div className="w-full">
      <GameHeader
        title="Bike Traveler"
        timeElapsed={elapsedTime}
        distance={distance}
        speed={speed}
      />

      <div className="relative h-[70vh] min-h-[400px] w-full overflow-hidden rounded-xl bg-neutral-900">
        <GameRoad
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          offset={frame.offset}
        />

        {frame.obstacles.map(renderObstacle)}

        <GameCharacter
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          config={{
            lane,
            sizeRatio: 0.065,
            verticalPosition: 0.72,
          }}
        />

        <GameOverDialog
          phase={phase}
          elapsedTime={elapsedTime}
          onPlayAgain={handlePlayAgain}
        />
      </div>
    </div>
  );
}
