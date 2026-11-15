
"use client";

import { useCallback, useState } from "react";
import GameRoad from "./GameRoad";
import GameCharacter from "./GameCharacter";
import GameHeader from "./GameHeader";
import { useGameAnimation } from "@/hooks/useGameAnimation";

export default function GameScene() {
  const [offset, setOffset] = useState(0);

  const updateFrame = useCallback((deltaTime: number) => {
    setOffset((previous) => (previous + 3 * deltaTime) % 10000);
  }, []);

  useGameAnimation({ onFrame: updateFrame });

  return (
    <div className="w-full">
      <GameHeader
        title="Bike Traveler"
        score={0}
        distance={0}
        speed={0}
      />

      <div className="relative h-[70vh] min-h-[400px] w-full overflow-hidden rounded-xl">
        <GameRoad
          width={1200}
          height={800}
          offset={offset}
        />

        <GameCharacter
          width={1200}
          height={800}
          config={{
            lane: "right",
            sizeRatio: 0.065,
            verticalPosition: 0.72,
          }}
        />
      </div>
    </div>
  );
}
