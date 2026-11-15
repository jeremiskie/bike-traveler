
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

  const [elapsedTime, setElapsedTime] = useState(0);
  const [speed, setSpeed] = useState(15);
  const [distance, setDistance] = useState(0);

  const laneRef = useRef<Lane>("right");
  const phaseRef = useRef<GamePhase>("playing");

  const obstaclesRef = useRef<Obstacle[]>([]);
  const offsetRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const nextIdRef = useRef(0);

  const elapsedRef = useRef(0);
  const speedRef = useRef(15);
  const speedTimerRef = useRef(0);
  const distanceRef = useRef(0);

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

  // Main game loop
  const updateFrame = useCallback((deltaTime: number) => {
    if (phaseRef.current !== "playing") return;

    // Timer
    elapsedRef.current += deltaTime / 60;

    if (elapsedRef.current >= elapsedTime + 1) {
      setElapsedTime(Math.floor(elapsedRef.current));
    }

    // Random speed adjustment every 1.5 seconds
    speedTimerRef.current += deltaTime;

    if (speedTimerRef.current >= 90) {
      speedTimerRef.current = 0;

      const change = Math.floor(Math.random() * 4) + 1;
      const direction = Math.random() > 0.5 ? 1 : -1;

      speedRef.current = Math.max(
        15,
        Math.min(50, speedRef.current + change * direction)
      );

      setSpeed(speedRef.current);
    }

    // Distance calculation
    distanceRef.current +=
      (speedRef.current / 3.6) * (deltaTime / 60);

    // Road animation
    const roadSpeed = 3 * (speedRef.current / 15);

    offsetRef.current =
      (offsetRef.current + roadSpeed * deltaTime) % 10000;

    // Spawn obstacles
    spawnTimerRef.current += deltaTime;

    if (spawnTimerRef.current >= 90) {
      spawnTimerRef.current = 0;

      obstaclesRef.current.push({
        id: nextIdRef.current++,
        lane: Math.random() > 0.5 ? "left" : "right",
        progress: 0,
      });
    }

    // Move obstacles according to speed
    const obstacleSpeed = 0.0025 * (speedRef.current / 15);

    obstaclesRef.current = obstaclesRef.current
      .map((obstacle) => ({
        ...obstacle,
        progress: obstacle.progress + obstacleSpeed * deltaTime,
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

    // Update visual state
    setFrame({
      offset: offsetRef.current,
      obstacles: obstaclesRef.current,
    });
  }, [elapsedTime]);

  useGameAnimation({
    onFrame: updateFrame,
  });

  // Update distance display once per second
  useEffect(() => {
    if (phase !== "playing") return;

    const interval = window.setInterval(() => {
      setDistance(Math.floor(distanceRef.current));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase]);

  // Game Over transition
  useEffect(() => {
    if (phase !== "gameOver") return;

    const timeout = window.setTimeout(() => {
      phaseRef.current = "results";
      setPhase("results");
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [phase]);

  // Restart
  const handlePlayAgain = () => {
    laneRef.current = "right";
    phaseRef.current = "playing";

    obstaclesRef.current = [];
    offsetRef.current = 0;
    spawnTimerRef.current = 0;
    nextIdRef.current = 0;

    elapsedRef.current = 0;
    speedRef.current = 15;
    speedTimerRef.current = 0;
    distanceRef.current = 0;

    setLane("right");
    setElapsedTime(0);
    setSpeed(15);
    setDistance(0);

    setFrame({
      offset: 0,
      obstacles: [],
    });

    setPhase("playing");
  };

  // Obstacle rendering
  const renderObstacle = (obstacle: Obstacle) => {
    const progress = Math.min(obstacle.progress, 1);

    const roadWidth = 156 + progress * (984 - 156);
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
        timeElapsed={elapsedTime}
        distance={distance}
        speed={speed}
      />

      <div className="relative h-[70vh] min-h-[400px] w-full overflow-hidden rounded-xl bg-neutral-900">
        <GameRoad
          width={WIDTH}
          height={HEIGHT}
          offset={frame.offset}
        />

        {frame.obstacles.map(renderObstacle)}

        <GameCharacter
          width={WIDTH}
          height={HEIGHT}
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
