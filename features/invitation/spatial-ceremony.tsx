"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import {
  createCanopyGeometry,
  createFabricPanelGeometry,
  PaperMaterial,
} from "@/features/invitation/spatial-craft";

type ProgressRef = { current: number };

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const range = (progress: number, start: number, length: number) =>
  clamp((progress - start) / length);
const ease = (value: number) => value * value * (3 - 2 * value);

const timber = "#3b271f";
const brass = "#b88a4c";
const ivory = "#eee4d6";

function DoorPanel({ side }: { side: -1 | 1 }) {
  return (
    <group position={[side * 3.15, 1.02, 6.62]} rotation={[0, side * -0.56, 0]}>
      <RoundedBox args={[0.12, 5.2, 0.12]} position={[-1.14, 0, 0]} radius={0.02} smoothness={3}>
        <meshStandardMaterial color={timber} metalness={0.24} roughness={0.62} />
      </RoundedBox>
      <RoundedBox args={[0.12, 5.2, 0.12]} position={[1.14, 0, 0]} radius={0.02} smoothness={3}>
        <meshStandardMaterial color={timber} metalness={0.24} roughness={0.62} />
      </RoundedBox>
      {[-2.54, 2.54].map((y) => (
        <RoundedBox
          args={[2.4, 0.12, 0.12]}
          key={y}
          position={[0, y, 0]}
          radius={0.02}
          smoothness={3}
        >
          <meshStandardMaterial color={timber} metalness={0.24} roughness={0.62} />
        </RoundedBox>
      ))}
      <mesh>
        <planeGeometry args={[2.28, 5.08]} />
        <meshPhysicalMaterial
          color="#3d3341"
          depthWrite={false}
          opacity={0.18}
          roughness={0.2}
          transparent
        />
      </mesh>
    </group>
  );
}

function PavilionArchitecture({ progress }: { progress: ProgressRef }) {
  const group = useRef<THREE.Group>(null);
  const arrivalLight = useRef<THREE.PointLight>(null);
  const canopyGeometries = useMemo(
    () => [-3.35, -1.12, 1.12, 3.35].map((_, index) =>
      createCanopyGeometry(1.72, 12.6, index * 0.7),
    ),
    [],
  );

  useEffect(
    () => () => canopyGeometries.forEach((geometry) => geometry.dispose()),
    [canopyGeometries],
  );

  useFrame(() => {
    if (!group.current || !arrivalLight.current) return;
    const current = progress.current;
    const arrival = ease(range(current, 0.53, 0.11));

    group.current.visible = current >= 0.08;
    group.current.position.set(0, -1.84 + arrival * 0.1, -41);
    arrivalLight.current.intensity = 16 + arrival * 34;
  });

  return (
    <group ref={group} visible={false}>
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.2, 13.2]} />
        <meshStandardMaterial color="#8c7c6d" roughness={0.94} />
      </mesh>
      <mesh position={[0, 0, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.09, 13]} />
        <meshBasicMaterial color="#d8b469" toneMapped={false} />
      </mesh>

      {[-6.5, 0, 6.5].flatMap((z) =>
        ([-4.58, 4.58] as const).map((x) => (
          <RoundedBox
            args={[0.16, 5.7, 0.16]}
            key={`${x}-${z}`}
            position={[x, 1.02, z]}
            radius={0.025}
            smoothness={3}
          >
            <meshStandardMaterial color={timber} metalness={0.26} roughness={0.58} />
          </RoundedBox>
        )),
      )}
      {[-6.5, 0, 6.5].map((z) => (
        <RoundedBox
          args={[9.35, 0.18, 0.22]}
          key={z}
          position={[0, 3.84, z]}
          radius={0.025}
          smoothness={3}
        >
          <meshStandardMaterial color={timber} metalness={0.26} roughness={0.58} />
        </RoundedBox>
      ))}
      {[-4.58, 4.58].map((x) => (
        <RoundedBox
          args={[0.18, 0.18, 13.2]}
          key={x}
          position={[x, 3.84, 0]}
          radius={0.025}
          smoothness={3}
        >
          <meshStandardMaterial color={timber} metalness={0.26} roughness={0.58} />
        </RoundedBox>
      ))}

      {([-4.56, 4.56] as const).map((x) => (
        <mesh key={x} position={[x, 1.05, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[13, 5.45]} />
          <meshPhysicalMaterial
            color="#493949"
            depthWrite={false}
            opacity={0.12}
            roughness={0.18}
            transparent
          />
        </mesh>
      ))}
      <mesh position={[0, 1.05, -6.46]}>
        <planeGeometry args={[9.05, 5.45]} />
        <meshPhysicalMaterial
          color="#493949"
          depthWrite={false}
          opacity={0.15}
          roughness={0.18}
          transparent
        />
      </mesh>

      {[-3.35, -1.12, 1.12, 3.35].map((x, index) => (
        <mesh
          geometry={canopyGeometries[index]}
          key={x}
          position={[x, 3.7, 0]}
        >
          <meshPhysicalMaterial
            color={ivory}
            opacity={0.34}
            roughness={0.72}
            sheen={0.45}
            sheenColor="#fff3e3"
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
      ))}

      <DoorPanel side={-1} />
      <DoorPanel side={1} />
      <pointLight
        color="#efbd77"
        distance={23}
        intensity={16}
        position={[0, 1.3, -2.5]}
        ref={arrivalLight}
      />
    </group>
  );
}

function DressTableau({
  palette,
  progress,
  vendorCount,
}: {
  palette: readonly string[];
  progress: ProgressRef;
  vendorCount: number;
}) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const vendorCards = useRef<THREE.Group>(null);
  const panelWidth = Math.max(0.72, 4.8 / Math.max(1, palette.length) * 0.82);
  const panelSpecs = useMemo(
    () => Array.from({ length: palette.length }, (_, index) => ({
      height: 3.38 + (index % 3) * 0.24,
      width: panelWidth * (0.88 + (index % 2) * 0.1),
    })),
    [palette.length, panelWidth],
  );
  const fabricPanels = useMemo(
    () => panelSpecs.map((spec, index) =>
      createFabricPanelGeometry(spec.width, spec.height, index * 0.82),
    ),
    [panelSpecs],
  );
  const fabricSamples = useMemo(
    () => Array.from({ length: palette.length }, (_, index) =>
      createFabricPanelGeometry(1.25, 0.72, index * 1.1),
    ),
    [palette.length],
  );

  useEffect(
    () => () => [...fabricPanels, ...fabricSamples].forEach((geometry) => geometry.dispose()),
    [fabricPanels, fabricSamples],
  );

  useFrame(() => {
    if (!group.current || !vendorCards.current) return;
    const current = progress.current;
    const mobile = size.width <= 850;
    const reveal = ease(range(current, 0.69, 0.055));
    const vendorReveal = ease(range(current, 0.79, 0.045));
    const exit = ease(range(current, 0.855, 0.035));

    group.current.visible = current >= 0.67 && exit < 0.999;
    group.current.position.set(
      mobile ? 0 : 2.05,
      -1.78 + reveal * 0.16 - exit * 1.4,
      mobile ? -40.7 : -41.5,
    );
    group.current.scale.setScalar(mobile ? 0.72 : 1);
    vendorCards.current.visible = vendorCount > 0 && vendorReveal > 0.01;
    vendorCards.current.position.y = 0.54 + vendorReveal * 0.12;
  });

  return (
    <group ref={group} visible={false}>
      <mesh position={[0, 4.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 5.9, 16]} />
        <meshStandardMaterial color={brass} metalness={0.58} roughness={0.4} />
      </mesh>
      {palette.map((colour, index) => {
        const step = 4.8 / Math.max(1, palette.length);
        const x = -2.4 + step * (index + 0.5);
        return (
          <group
            key={`${colour}-${index}`}
            position={[x, 3.98 - panelSpecs[index].height / 2, 0]}
          >
            <mesh
              geometry={fabricPanels[index]}
              rotation={[
                0,
                (index % 2 === 0 ? -1 : 1) * 0.025,
                (index % 2 === 0 ? -1 : 1) * 0.035,
              ]}
            >
              <meshPhysicalMaterial
                color={colour}
                roughness={0.72}
                sheen={0.48}
                sheenColor="#fff0e8"
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      <mesh position={[0, 0.25, 0.05]}>
        <boxGeometry args={[5.9, 0.38, 2.2]} />
        <meshStandardMaterial color="#35231f" roughness={0.9} />
      </mesh>
      {palette.map((colour, index) => (
        <mesh
          geometry={fabricSamples[index]}
          key={`sample-${colour}`}
          position={[-2 + index * 0.48, 0.52 + index * 0.055, 0.35]}
          rotation={[-Math.PI / 2, 0, 0.06 * index]}
        >
          <meshPhysicalMaterial
            color={colour}
            roughness={0.78}
            sheen={0.38}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      <group ref={vendorCards} visible={false}>
        {Array.from({ length: Math.min(vendorCount, 8) }, (_, index) => {
          const visibleCount = Math.min(vendorCount, 8);
          const spacing = Math.min(1.45, 4.6 / Math.max(1, visibleCount));
          const x = (index - (visibleCount - 1) / 2) * spacing;
          return (
            <group key={index} position={[x, 0, -0.72]} rotation={[-0.1, 0, 0]}>
              <RoundedBox args={[1.15, 0.72, 0.045]} radius={0.07} smoothness={6}>
                <PaperMaterial color="#f2e9de" />
              </RoundedBox>
            </group>
          );
        })}
      </group>
    </group>
  );
}

function RSVPPlace({
  palette,
  progress,
}: {
  palette: readonly string[];
  progress: ProgressRef;
}) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const placeCard = useRef<THREE.Group>(null);
  const napkinGeometry = useMemo(
    () => createFabricPanelGeometry(0.72, 2.8, 0.9),
    [],
  );

  useEffect(() => () => napkinGeometry.dispose(), [napkinGeometry]);

  useFrame(() => {
    if (!group.current || !placeCard.current) return;
    const current = progress.current;
    const mobile = size.width <= 850;
    const reveal = ease(range(current, 0.86, 0.055));

    group.current.visible = current >= 0.84;
    group.current.position.set(
      mobile ? 0 : -2.55,
      (mobile ? -0.76 : -1.62) + reveal * 0.14,
      mobile ? -47.6 : -47,
    );
    group.current.scale.setScalar(mobile ? 0.7 : 0.94);
    placeCard.current.position.y = 0.83 + reveal * 0.1;
  });

  return (
    <group ref={group} visible={false}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[5.8, 0.3, 3.9]} />
        <meshStandardMaterial color="#34221e" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[1.38, 1.42, 0.08, 48]} />
        <meshStandardMaterial color={brass} metalness={0.34} roughness={0.56} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[1.13, 1.18, 0.08, 48]} />
        <meshStandardMaterial color="#e5d9ca" roughness={0.92} />
      </mesh>
      <mesh
        geometry={napkinGeometry}
        position={[0.2, 0.43, 0]}
        rotation={[-Math.PI / 2, 0, 0.28]}
      >
        <meshPhysicalMaterial
          color={palette[1] ?? "#a97ed1"}
          roughness={0.72}
          sheen={0.48}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={placeCard} position={[0.95, 0.83, -0.52]} rotation={[-0.09, -0.14, 0]}>
        <RoundedBox args={[1.7, 0.92, 0.05]} radius={0.09} smoothness={6}>
          <PaperMaterial />
        </RoundedBox>
      </group>

      <mesh position={[-1.78, 0.65, -0.55]}>
        <cylinderGeometry args={[0.3, 0.34, 0.86, 24]} />
        <meshStandardMaterial color="#d8cabc" opacity={0.76} roughness={0.5} transparent />
      </mesh>
      <mesh position={[-1.78, 1.12, -0.55]}>
        <sphereGeometry args={[0.14, 16, 12]} />
        <meshBasicMaterial color="#efbd72" />
      </mesh>
    </group>
  );
}

export function CeremonyWorld({
  palette,
  progress,
  vendorCount,
}: {
  palette: readonly string[];
  progress: ProgressRef;
  vendorCount: number;
}) {
  return (
    <group>
      <PavilionArchitecture progress={progress} />
      <DressTableau palette={palette} progress={progress} vendorCount={vendorCount} />
      <RSVPPlace palette={palette} progress={progress} />
    </group>
  );
}
