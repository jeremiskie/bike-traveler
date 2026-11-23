"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
const CLOUD_MODEL_PATH = "/models/cloud.glb";

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

function CloudModelView() {
  const { scene } = useGLTF(CLOUD_MODEL_PATH);
  const geometry = useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) meshes.push(object);
    });
    const sourceMesh = meshes[0];

    if (!sourceMesh) {
      throw new Error("The cloud model does not contain a mesh.");
    }

    const geometry = sourceMesh.geometry.clone();
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    if (!bounds) {
      throw new Error("The cloud model has no bounding box.");
    }

    const dimensions = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const largestDimension = Math.max(
      dimensions.x,
      dimensions.y,
      dimensions.z
    );
    const scale = 2 / largestDimension;
    geometry.scale(scale, scale, scale);
    geometry.translate(-center.x * scale, -center.y * scale, -center.z * scale);

    return geometry;
  }, [scene]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color="white" side={THREE.DoubleSide} />
    </mesh>
  );
}

function CloudPlaceholder() {
  return (
    <group>
      <mesh position={[-0.45, 0, 0]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0.5, 0.05, 0]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}

interface CloudConfig {
  y: number;
  width: number;
  speed: number;
  phase: number;
}

function AnimatedCloud({ y, width, speed, phase }: CloudConfig) {
  const groupRef = useRef<THREE.Group>(null);
  const { width: viewportWidth, height: viewportHeight } = useThree(
    (state) => state.size
  );
  const viewportScale = Math.min(
    viewportWidth / GAME_WIDTH,
    viewportHeight / GAME_HEIGHT
  );

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.position.x =
      Math.sin(state.clock.elapsedTime * speed + phase) *
      viewportWidth *
      0.42;
  });

  return (
    <group
      ref={groupRef}
      position={[0, (0.5 - y / GAME_HEIGHT) * viewportHeight, -10]}
      scale={(width * viewportScale) / 2}
    >
      <Suspense fallback={<CloudPlaceholder />}>
        <CloudModelView />
      </Suspense>
    </group>
  );
}

function CloudInstances() {
  return (
    <>
      <AnimatedCloud y={92} width={220} speed={0.18} phase={0} />
      <AnimatedCloud y={150} width={165} speed={0.14} phase={Math.PI} />
    </>
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
      dpr={1}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true }}
    >
      <ambientLight intensity={2.5} />
      <directionalLight position={[0, 0, 100]} intensity={2} />
      <CloudInstances />
      <ObstacleInstances obstacles={obstacles} />
    </Canvas>
  );
}

useGLTF.preload(CLOUD_MODEL_PATH);
