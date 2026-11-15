
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import GameRoad from "./GameRoad";
import GameCharacter from "./GameCharacter";
import GameObstacle from "./GameObstacle";
import GameHeader from "./GameHeader";
import GameOverDialog from "./GameOverDialog";

import { useGameAnimation } from "@/hooks/useGameAnimation";
import { usePlayerControls } from "@/hooks/usePlayerControls";

type Lane = "left" | "right";
type GamePhase = "playing" | "gameOver" | "results";

interface Obstacle {
  id: number;
  lane: Lane;
  progress: number;
}

interface GameFrame {
  offset: number;
  obstacles: Obstacle[];
}

const WIDTH = 1200;
const HEIGHT = 800;
const HORIZON = 200;
const PLAYER_Y = 576;

export default function GameScene() {
  const [lane, setLane] = useState<Lane>("right");
  const [phase, setPhase] = useState<GamePhase>("playing");

  const [frame, setFrame] = useState<GameFrame>({
    offset: 0,
    obstacles: [],
  });

  const laneRef = useRef<Lane>("right");
  const phaseRef = useRef<GamePhase>("playing");

  const obstaclesRef = useRef<Obstacle[]>([]);
  const offsetRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const nextIdRef = useRef(0);

  // Keep current lane and phase accessible to animation
  useEffect(() => {
    laneRef.current = lane;
  }, [lane]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

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

  // Game animation
  const updateFrame = useCallback((deltaTime: number) => {
    if (phaseRef.current !== "playing") return;

    offsetRef.current = (offsetRef.current + 3 * deltaTime) % 10000;

    spawnTimerRef.current += deltaTime;

    // Spawn a new obstacle periodically
    if (spawnTimerRef.current >= 90) {
      spawnTimerRef.current = 0;

      obstaclesRef.current.push({
        id: nextIdRef.current++,
        lane: Math.random() > 0.5 ? "left" : "right",
        progress: 0,
      });
    }

    // Move obstacles toward the player
    obstaclesRef.current = obstaclesRef.current
      .map((obstacle) => ({
        ...obstacle,
        progress: obstacle.progress + 0.004 * deltaTime,
      }))
      .filter((obstacle) => obstacle.progress < 1.1);

    // Collision detection
    const collision = obstaclesRef.current.some((obstacle) => {
      const obstacleY =
        HORIZON + obstacle.progress * (HEIGHT - HORIZON);

      return (
        obstacle.lane === laneRef.current &&
        obstacleY >= PLAYER_Y - 35 &&
        obstacleY <= PLAYER_Y + 35
      );
    });

    if (collision) {
      phaseRef.current = "gameOver";
      setPhase("gameOver");
      return;
    }

    // Update visual frame
    setFrame({
      offset: offsetRef.current,
      obstacles: obstaclesRef.current,
    });
  }, []);

  useGameAnimation({
    onFrame: updateFrame,
  });

  // Show results 3 seconds after collision
  useEffect(() => {
    if (phase !== "gameOver") return;

    const timeout = window.setTimeout(() => {
      setPhase("results");
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [phase]);

  // Restart game
  const handlePlayAgain = () => {
    laneRef.current = "right";
    phaseRef.current = "playing";

    offsetRef.current = 0;
    obstaclesRef.current = [];
    spawnTimerRef.current = 0;
    nextIdRef.current = 0;

    setLane("right");
    setFrame({
      offset: 0,
      obstacles: [],
    });
    setPhase("playing");
  };

  // Convert obstacle perspective to screen coordinates
  const renderObstacle = (obstacle: Obstacle) => {
    const progress = Math.min(obstacle.progress, 1);

    const roadWidth =
      156 + progress * (984 - 156);

    const center = WIDTH / 2;

    const x =
      obstacle.lane === "right"
        ? center + roadWidth * 0.25
        : center - roadWidth * 0.25;

    const y = HORIZON + progress * (HEIGHT - HORIZON);
    const size = 12 + progress * 52;

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
        score={0}
        distance={0}
        speed={0}
      />

      <div className="relative h-[70vh] min-h-[400px] w-full overflow-hidden rounded-xl bg-neutral-900">

        <GameRoad
          width={WIDTH}
          height={HEIGHT}
          offset={frame.offset}
        />

        {/* Obstacles */}
        {frame.obstacles.map(renderObstacle)}

        {/* Player */}
        <GameCharacter
          width={WIDTH}
          height={HEIGHT}
          config={{
            lane,
            sizeRatio: 0.065,
            verticalPosition: 0.72,
          }}
        />

        {/* Game Over */}
        <GameOverDialog
          phase={phase}
          onPlayAgain={handlePlayAgain}
        />

      </div>
    </div>
  );
}
