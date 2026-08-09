"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import {
  createFabricPanelGeometry,
  createIrregularDiscGeometry,
  HairlineFrame,
  PaperMaterial,
} from "@/features/invitation/spatial-craft";

type ProgressRef = { current: number };

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const range = (progress: number, start: number, length: number) =>
  clamp((progress - start) / length);
const ease = (value: number) => value * value * (3 - 2 * value);

function PaperPanel({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[1.28, 0.86, 0.055]} radius={0.025} smoothness={4}>
        <PaperMaterial />
      </RoundedBox>
      <HairlineFrame
        height={0.72}
        position={[0, 0, 0.032]}
        width={1.14}
      />
    </group>
  );
}

function ClearingBase() {
  const geometries = useMemo(
    () => [
      createIrregularDiscGeometry(2.08, 2.2, 0.18, 1.4),
      createIrregularDiscGeometry(1.78, 1.88, 0.08, 3.2),
    ],
    [],
  );

  useEffect(
    () => () => geometries.forEach((geometry) => geometry.dispose()),
    [geometries],
  );

  return (
    <>
      <mesh geometry={geometries[0]}>
        <meshStandardMaterial color="#b7aa9a" roughness={0.96} />
      </mesh>
      <mesh geometry={geometries[1]} position={[0, 0.11, 0]}>
        <meshStandardMaterial color="#d5c9ba" roughness={0.94} />
      </mesh>
    </>
  );
}

function StoryClearing({
  index,
  progress,
  revealAt,
  total,
}: {
  index: number;
  progress: ProgressRef;
  revealAt: number;
  total: number;
}) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const fold = useRef<THREE.Group>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!group.current || !fold.current || !glow.current) return;

    const current = progress.current;
    const mobile = size.width <= 850;
    const revealStart = revealAt - (index === 0 ? 0.05 : 0.07);
    const reveal = ease(range(current, revealStart, index === 0 ? 0.05 : 0.06));
    const pathPosition = total <= 1 ? 0 : index / (total - 1);
    const side = index % 2 === 0 ? 1 : -1;
    const scale = mobile ? 0.62 : 1;

    group.current.visible = current >= revealStart - 0.025 && current < 0.505;
    group.current.position.set(
      mobile ? side * 0.25 : side * 2.15,
      -1.68 + reveal * 0.12,
      THREE.MathUtils.lerp(mobile ? -12.4 : -13.6, mobile ? -22.3 : -21.5, pathPosition),
    );
    group.current.scale.setScalar(scale);
    group.current.rotation.y = side * (mobile ? -0.08 : -0.15);
    fold.current.rotation.x = index % 2 === 0 ? 0 : -0.12 - reveal * 0.42;
    glow.current.opacity = 0.14 + reveal * 0.78;
  });

  return (
    <group ref={group} visible={false}>
      <ClearingBase />
      <PaperPanel position={[-0.52, 0.67, 0.04]} rotation={[0, 0.24, -0.025]} />
      <group ref={fold} position={[0.56, 0.28, 0.05]}>
        <PaperPanel position={[0, 0.42, 0]} rotation={[0, -0.22, 0.025]} />
      </group>
      <mesh position={[0, 0.28, 0.72]}>
        <cylinderGeometry args={[0.2, 0.24, 0.58, 20]} />
        <meshStandardMaterial color="#d8cfc3" roughness={0.48} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.28, 0.74]}>
        <circleGeometry args={[0.18, 24]} />
        <meshBasicMaterial ref={glow} color="#edc276" opacity={0.14} transparent />
      </mesh>
    </group>
  );
}

export function StoryClearings({
  progress,
  storyProgress,
}: {
  progress: ProgressRef;
  storyProgress: readonly number[];
}) {
  return (
    <group>
      {storyProgress.map((revealAt, index) => (
        <StoryClearing
          index={index}
          key={`${revealAt}-${index}`}
          progress={progress}
          revealAt={revealAt}
          total={storyProgress.length}
        />
      ))}
    </group>
  );
}

export function WeddingCircle({
  peopleCount,
  progress,
}: {
  peopleCount: number;
  progress: ProgressRef;
}) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const cards = useRef<Array<THREE.Group | null>>([]);
  const placeAngles = useMemo(
    () => Array.from({ length: peopleCount }, (_, index) =>
      peopleCount <= 1
        ? 0
        : THREE.MathUtils.lerp(-0.92, 0.92, index / (peopleCount - 1)),
    ),
    [peopleCount],
  );
  const runnerGeometries = useMemo(
    () => placeAngles.map((angle, index) =>
      createFabricPanelGeometry(0.76, 2.5, angle + index * 0.5),
    ),
    [placeAngles],
  );
  const baseGeometry = useMemo(
    () => createIrregularDiscGeometry(3.2, 3.28, 0.32, 2.1),
    [],
  );

  useEffect(
    () => () => {
      baseGeometry.dispose();
      runnerGeometries.forEach((geometry) => geometry.dispose());
    },
    [baseGeometry, runnerGeometries],
  );

  useFrame(() => {
    if (!group.current || !glow.current) return;
    const current = progress.current;
    const mobile = size.width <= 850;
    const reveal = ease(range(current, 0.505, 0.025));
    const exit = ease(range(current, 0.59, 0.045));

    group.current.visible = peopleCount > 0 && current >= 0.505 && exit < 0.999;
    group.current.position.set(
      mobile ? 0 : -1.6,
      -1.66 + reveal * 0.12 - exit * 1.8,
      mobile ? -25.2 : -26.2,
    );
    group.current.scale.setScalar(mobile ? 0.68 : 0.82);
    glow.current.intensity = reveal * (1 - exit) * 24;

    cards.current.slice(0, peopleCount).forEach((card, index) => {
      if (!card) return;
      const cardReveal = ease(range(current, 0.508 + index * 0.004, 0.02));
      card.position.y = 0.62 + cardReveal * 0.1;
    });
  });

  return (
    <group ref={group} visible={false}>
      <mesh geometry={baseGeometry}>
        <meshStandardMaterial color="#2a1830" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.19, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.05, 0.035, 8, 72]} />
        <meshStandardMaterial color="#c9a565" metalness={0.52} roughness={0.38} />
      </mesh>

      {placeAngles.map((angle, index) => {
        const x = Math.sin(angle) * 2.45;
        const z = Math.cos(angle) * 2.18;
        return (
          <group key={angle}>
            <mesh
              geometry={runnerGeometries[index]}
              position={[Math.sin(angle) * 2.15, 0.2, Math.cos(angle) * 1.78]}
              rotation={[-Math.PI / 2, 0, -angle]}
            >
              <meshPhysicalMaterial
                color="#e9dfd2"
                roughness={0.88}
                sheen={0.22}
                sheenColor="#fff3df"
                side={THREE.DoubleSide}
              />
            </mesh>
            <group
              ref={(node) => {
                cards.current[index] = node;
              }}
              position={[x, 0.62, z]}
              rotation={[0, angle, 0]}
            >
              <RoundedBox args={[1.08, 0.7, 0.055]} radius={0.022} smoothness={4}>
                <PaperMaterial />
              </RoundedBox>
              <HairlineFrame
                height={0.58}
                position={[0, 0, 0.032]}
                width={0.96}
              />
            </group>
          </group>
        );
      })}

      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.24, 0.29, 0.72, 24]} />
        <meshStandardMaterial color="#d6c8b8" roughness={0.5} transparent opacity={0.72} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshBasicMaterial color="#edbd6d" />
      </mesh>
      <pointLight ref={glow} color="#e8b969" distance={9} intensity={0} position={[0, 1.1, 0]} />
    </group>
  );
}
