// components/game/GameCharacter.tsx
'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { CharacterConfig } from "@/types/game";

interface GameCharacterProps {
  width: number;
  height: number;
  config?: Partial<CharacterConfig>;
}

function BikerModel() {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/character.glb')
  const { model, position, scale } = useMemo(() => {
    const model = scene.clone()
    const bounds = new THREE.Box3().setFromObject(model)
    const center = bounds.getCenter(new THREE.Vector3())
    const height = bounds.getSize(new THREE.Vector3()).y

    return {
      model,
      position: center.negate(),
      scale: 1.2 / height,
    }
  }, [scene])

  // Subtle pedaling bounce animation loop
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime()
      groupRef.current.position.y = Math.sin(t * 15) * 0.05
    }
  })

  return (
    <group ref={groupRef} rotation={[0, 0, 0]} scale={scale} dispose={null}>
      <primitive object={model} position={position} />
    </group>
  )
}
1
useGLTF.preload('/models/character.glb')

export default function GameCharacter({
  width,
  height,
  config,
}: GameCharacterProps) {
  const size = Math.max(
    28,
    width * (config?.sizeRatio ?? 0.065)
  );

  const center = width / 2;
  const roadWidth = width * 0.82;
  const lane = config?.lane ?? "right";

  const x =
    lane === "right"
      ? center + roadWidth * 0.25
      : center - roadWidth * 0.25;

  const y = height * (config?.verticalPosition ?? 0.72);

  return (
    <div 
      className="absolute pointer-events-none overflow-visible"
      style={{
        width: `${(size * 2.5 / width) * 100}%`,
        height: `${(size * 2.5 / height) * 100}%`,
        left: `${((x - (size * 2.5) / 2) / width) * 100}%`,
        top: `${((y - (size * 2.5) / 2) / height) * 100}%`,
      }}
    >
      {/* 3D Viewport replacing your red block rect */}
      <Canvas 
        camera={{ position: [0, 1.5, 3], fov: 50 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <BikerModel />
      </Canvas>
    </div>
  );
}