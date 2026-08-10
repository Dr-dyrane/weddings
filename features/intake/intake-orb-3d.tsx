"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { createOrbProgressPoints } from "@/features/intake/intake-orb-geometry";

function OrbWorld({
  isComplete,
  progress,
}: {
  isComplete: boolean;
  progress: number;
}) {
  const group = useRef<THREE.Group>(null);
  const energy = useRef(0);
  const previousProgress = useRef(progress);
  const { invalidate } = useThree();
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        createOrbProgressPoints(progress).map(
          ([x, y, z]) => new THREE.Vector3(x, y, z),
        ),
      ),
    [progress],
  );
  const endpoint = useMemo(() => curve.getPoint(1), [curve]);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    energy.current = previousProgress.current === progress ? 0.24 : 1;
    previousProgress.current = progress;

    if (reducedMotion) {
      invalidate();
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const animate = (now: number) => {
      invalidate();
      if (now - startedAt < 920) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [invalidate, isComplete, progress]);

  useFrame((_, delta) => {
    if (!group.current) return;
    energy.current = THREE.MathUtils.damp(energy.current, 0, 5.8, delta);
    const response = energy.current;
    group.current.scale.set(
      1 + response * 0.035,
      1 - response * 0.065,
      1 + response * 0.035,
    );
    group.current.rotation.y += delta * (0.16 + response * 1.25);
    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      isComplete ? -0.08 : 0.045,
      4.2,
      delta,
    );
  });

  return (
    <group ref={group} rotation={[0.06, -0.22, 0.045]}>
      <mesh>
        <sphereGeometry args={[1, 72, 72]} />
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.16}
          color="#070707"
          emissive="#050400"
          emissiveIntensity={0.45}
          metalness={0.2}
          roughness={0.2}
        />
      </mesh>

      <mesh scale={0.965}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color="#030303"
          emissive="#ffd21e"
          emissiveIntensity={isComplete ? 0.18 : 0.055}
          roughness={0.82}
        />
      </mesh>

      <mesh>
        <tubeGeometry args={[curve, 110, isComplete ? 0.024 : 0.018, 10, false]} />
        <meshStandardMaterial
          color="#ffd21e"
          emissive="#ffd21e"
          emissiveIntensity={isComplete ? 2.1 : 1.35}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>

      <mesh position={endpoint}>
        <sphereGeometry args={[isComplete ? 0.045 : 0.034, 20, 20]} />
        <meshBasicMaterial color="#ffd21e" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function IntakeOrb3D({
  isComplete = false,
  progress,
}: {
  isComplete?: boolean;
  progress: number;
}) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ fov: 34, position: [0, 0, 3.75] }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight color="#ffd21e" intensity={16} position={[-2.4, 0.7, 2.8]} />
      <pointLight color="#ffffff" intensity={10} position={[2.8, 1.9, 3.2]} />
      <pointLight color="#6d4cff" intensity={2.2} position={[0.8, -2.2, -0.8]} />
      <OrbWorld isComplete={isComplete} progress={progress} />
    </Canvas>
  );
}
