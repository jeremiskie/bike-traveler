"use client";

import { Suspense, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { GAME_HEIGHT, GAME_WIDTH } from "@/constants/game";
import { getObstaclePosition } from "@/utils/gameUtils";
import type { Obstacle, ObstacleModel } from "@/types/game";

type GameObstacleProps = {
  obstacles: Obstacle[];
};

const MODEL_PATHS: Record<ObstacleModel, string> = {
  spikes: "/models/obstacles/spikes.glb",
  rocks: "/models/obstacles/rocks.glb",
  logs: "/models/obstacles/logs.glb",
};

function ObstacleModelView({ model }: { model: ObstacleModel }) {
  const { scene } = useGLTF(MODEL_PATHS[model]);
  const { centeredModel, scale } = useMemo(() => {
    const centeredModel = scene.clone();
    const bounds = new THREE.Box3().setFromObject(centeredModel);
    const dimensions = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const largestDimension = Math.max(
      dimensions.x,
      dimensions.y,
      dimensions.z
    );

    centeredModel.position.sub(center);

    return {
      centeredModel,
      scale: 2 / largestDimension,
    };
  }, [scene]);

  return (
    <primitive
      object={centeredModel}
      scale={scale}
      dispose={null}
    />
  );
}

function ObstaclePlaceholder({ model }: { model: ObstacleModel }) {
  if (model === "spikes") {
    return (
      <group>
        {[-0.4, 0, 0.4].map((x, index) => (
          <mesh
            key={x}
            position={[x, 0, 0]}
            scale={[0.8, index === 1 ? 1 : 0.8, 0.8]}
          >
            <coneGeometry args={[0.4, 1.8, 6]} />
            <meshStandardMaterial color="#d6d3d1" roughness={0.8} />
          </mesh>
        ))}
      </group>
    );
  }

  if (model === "rocks") {
    return (
      <group>
        <mesh position={[-0.35, -0.1, 0]}>
          <dodecahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial color="#818a98" roughness={0.9} />
        </mesh>
        <mesh position={[0.4, 0, 0.1]} scale={0.75}>
          <dodecahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial color="#697383" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.32, 0.32, 1.8, 8]} />
      <meshStandardMaterial color="#b77945" roughness={0.9} />
    </mesh>
  );
}

function ObstacleInstances({ obstacles }: GameObstacleProps) {
  const { width, height } = useThree((state) => state.size);
  const scale = Math.min(width / GAME_WIDTH, height / GAME_HEIGHT);

  return obstacles.map((obstacle) => {
    const { x, y, size } = getObstaclePosition(obstacle);

    return (
      <group
        key={obstacle.id}
        position={[
          ((x / GAME_WIDTH) - 0.5) * width,
          (0.5 - y / GAME_HEIGHT) * height,
          0,
        ]}
        scale={size * scale}
      >
        <Suspense fallback={<ObstaclePlaceholder model={obstacle.model} />}>
          <ObstacleModelView model={obstacle.model} />
        </Suspense>
      </group>
    );
  });
}

for (const path of Object.values(MODEL_PATHS)) {
  useGLTF.preload(path);
}

export default function GameObstacle({ obstacles }: GameObstacleProps) {
  return (
    <Canvas
      className="pointer-events-none absolute inset-0"
      orthographic
      camera={{ position: [0, 0, 100] }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true }}
    >
      <ambientLight intensity={2.5} />
      <directionalLight position={[0, 0, 100]} intensity={2} />
      <ObstacleInstances obstacles={obstacles} />
    </Canvas>
  );
}
