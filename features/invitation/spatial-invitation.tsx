"use client";

import {
  Float,
  MeshReflectorMaterial,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import { Canvas, invalidate, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const range = (progress: number, start: number, length: number) =>
  clamp((progress - start) / length);

function useJourney() {
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const anchors = useRef<Array<{ progress: number; top: number }>>([]);

  useEffect(() => {
    let active = true;
    const measure = () => {
      if (!active) return;
      anchors.current = Array.from(
        document.querySelectorAll<HTMLElement>("[data-journey-progress]"),
      )
        .map((element) => ({
          progress: Number(element.dataset.journeyProgress),
          top: element.offsetTop,
        }))
        .filter((anchor) => Number.isFinite(anchor.progress))
        .sort((first, second) => first.top - second.top);
    };
    const update = () => {
      if (!active) return;
      const point = scrollY + innerHeight * 0.5;
      const measured = anchors.current;
      const first = measured[0];
      const last = measured.at(-1);

      if (!first || !last || point <= first.top) {
        progress.current = first?.progress ?? 0;
      } else {
        const nextIndex = measured.findIndex((anchor) => anchor.top >= point);
        if (nextIndex > 0) {
          const previous = measured[nextIndex - 1];
          const next = measured[nextIndex];
          const distance = Math.max(1, next.top - previous.top);
          const local = clamp((point - previous.top) / distance);
          progress.current =
            previous.progress + (next.progress - previous.progress) * local;
        } else {
          const end =
            document.documentElement.scrollHeight - innerHeight * 0.5;
          const distance = Math.max(1, end - last.top);
          const local = clamp((point - last.top) / distance);
          progress.current = last.progress + (1 - last.progress) * local;
        }
      }
      invalidate();
    };
    const refresh = () => {
      measure();
      update();
    };
    const move = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / innerHeight - 0.5) * 2;
      invalidate();
    };

    refresh();
    addEventListener("scroll", update, { passive: true });
    addEventListener("pointermove", move, { passive: true });
    addEventListener("resize", refresh, { passive: true });
    const experience = document.querySelector(".experience");
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(refresh);
    if (experience) resizeObserver?.observe(experience);
    document.fonts?.ready.then(refresh);
    return () => {
      active = false;
      removeEventListener("scroll", update);
      removeEventListener("pointermove", move);
      removeEventListener("resize", refresh);
      resizeObserver?.disconnect();
    };
  }, []);

  return { progress, pointer };
}

function Envelope({ progress, pointer }: ReturnType<typeof useJourney>) {
  const group = useRef<THREE.Group>(null);
  const flap = useRef<THREE.Mesh>(null);
  const card = useRef<THREE.Group>(null);
  const flapShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.82, 0);
    shape.lineTo(1.82, 0);
    shape.lineTo(0, -1.3);
    shape.closePath();
    return shape;
  }, []);

  useFrame(() => {
    const current = progress.current;
    if (!group.current || !flap.current || !card.current) return;
    const open = range(current, 0.035, 0.075);
    const leave = range(current, 0.13, 0.075);
    flap.current.rotation.x = -Math.PI * open;
    card.current.position.y = open * 2.35;
    card.current.position.z = open * 1.4;
    card.current.rotation.x = -0.08 + pointer.current.y * 0.045;
    card.current.rotation.y = pointer.current.x * 0.08;
    group.current.position.z = -leave * 5;
    group.current.scale.setScalar(1 - leave * 0.82);
  });

  return (
    <group ref={group} position={[0, -0.35, 0]}>
      <RoundedBox args={[3.7, 2.55, 0.12]} radius={0.06} smoothness={5}>
        <meshPhysicalMaterial
          clearcoat={0.25}
          color="#e8dfd1"
          metalness={0.04}
          roughness={0.62}
        />
      </RoundedBox>
      <mesh ref={flap} position={[0, 1.25, 0.07]} rotation={[0, 0, Math.PI]}>
        <shapeGeometry args={[flapShape]} />
        <meshPhysicalMaterial
          color="#f3ebdf"
          roughness={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
      <group ref={card} position={[0, 0.05, 0.2]}>
        <RoundedBox args={[3.05, 2.05, 0.07]} radius={0.045} smoothness={5}>
          <meshPhysicalMaterial
            clearcoat={1}
            color="#d8d2e2"
            metalness={0.12}
            roughness={0.18}
            thickness={0.6}
            transmission={0.42}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.065]}>
          <ringGeometry args={[0.38, 0.46, 64]} />
          <meshStandardMaterial color="#c39b54" metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <circleGeometry args={[0.18, 64]} />
          <meshStandardMaterial color="#7d5d93" metalness={0.7} roughness={0.23} />
        </mesh>
      </group>
    </group>
  );
}

function RibbonPath({ progress }: { progress: React.MutableRefObject<number> }) {
  const ribbon = useRef<THREE.Mesh>(null);
  const cup = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-7, -1, -4),
        new THREE.Vector3(-3, 1, -8),
        new THREE.Vector3(1, -0.4, -12),
        new THREE.Vector3(5, 1.4, -17),
        new THREE.Vector3(0, 0, -22),
      ]),
    [],
  );

  useFrame(() => {
    const reveal = range(progress.current, 0.17, 0.22);
    if (ribbon.current) ribbon.current.scale.y = reveal;
    if (cup.current) {
      cup.current.scale.setScalar(
        range(progress.current, 0.22, 0.05) *
          (1 - range(progress.current, 0.35, 0.04)),
      );
    }
    if (ring.current) {
      ring.current.scale.setScalar(
        range(progress.current, 0.36, 0.05) *
          (1 - range(progress.current, 0.5, 0.04)),
      );
    }
  });

  return (
    <group>
      <mesh ref={ribbon}>
        <tubeGeometry args={[curve, 160, 0.045, 12, false]} />
        <meshStandardMaterial
          color="#c6a5ef"
          emissive="#633b91"
          emissiveIntensity={2}
        />
      </mesh>
      <group ref={cup} position={[-3, 1, -8]} scale={0}>
        <mesh>
          <cylinderGeometry args={[0.55, 0.43, 0.8, 48]} />
          <meshPhysicalMaterial color="#f0e9dd" roughness={0.28} clearcoat={0.8} />
        </mesh>
        <mesh position={[0.57, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.29, 0.08, 16, 32]} />
          <meshStandardMaterial color="#f0e9dd" />
        </mesh>
        <Sparkles count={18} scale={2} size={2} speed={0.25} color="#dbc1ff" />
      </group>
      <group ref={ring} position={[4.8, 1.3, -17]} scale={0}>
        <RoundedBox args={[1.6, 1.3, 1.35]} radius={0.18} smoothness={5}>
          <meshPhysicalMaterial color="#4c263f" roughness={0.38} />
        </RoundedBox>
        <mesh position={[0, 0.85, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.075, 20, 64]} />
          <meshStandardMaterial color="#d9b15f" metalness={1} roughness={0.12} />
        </mesh>
        <mesh position={[0, 1.18, 0.1]}>
          <octahedronGeometry args={[0.16]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.5} roughness={0} />
        </mesh>
      </group>
    </group>
  );
}

function Venue({ progress }: { progress: React.MutableRefObject<number> }) {
  const arch = useRef<THREE.Group>(null);
  const calendar = useRef<THREE.Group>(null);

  useFrame(() => {
    const show = range(progress.current, 0.53, 0.08);
    if (arch.current) arch.current.scale.setScalar(show);
    if (calendar.current) {
      calendar.current.position.y = range(progress.current, 0.63, 0.06) * 1.2;
      calendar.current.rotation.y = progress.current * 0.4;
    }
  });

  return (
    <group position={[0, 0, -30]}>
      <group ref={arch} scale={0}>
        <mesh>
          <torusGeometry args={[3.4, 0.28, 28, 96, Math.PI]} />
          <meshPhysicalMaterial
            clearcoat={1}
            color="#e9dfd2"
            metalness={0.18}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[-3.4, -2, 0]}>
          <cylinderGeometry args={[0.28, 0.38, 4, 32]} />
          <meshStandardMaterial color="#e9dfd2" />
        </mesh>
        <mesh position={[3.4, -2, 0]}>
          <cylinderGeometry args={[0.28, 0.38, 4, 32]} />
          <meshStandardMaterial color="#e9dfd2" />
        </mesh>
        {Array.from({ length: 18 }).map((_, index) => (
          <Float key={index} speed={1 + (index % 3)} floatIntensity={0.6}>
            <mesh
              position={[
                (index % 2 ? 1 : -1) * (2.6 + (index % 4) * 0.25),
                1.1 - (index % 6) * 0.5,
                (index % 3) * 0.2,
              ]}
              rotation={[index, 0.2 * index, 0]}
            >
              <sphereGeometry args={[0.16, 12, 8]} />
              <meshStandardMaterial
                color={index % 3 === 0 ? "#b78fe2" : "#f0dfd2"}
              />
            </mesh>
          </Float>
        ))}
      </group>
      <group ref={calendar} position={[0, 0, 1]}>
        <RoundedBox args={[3.4, 2.35, 0.12]} radius={0.12} smoothness={5}>
          <meshPhysicalMaterial
            clearcoat={1}
            color="#f4eee5"
            roughness={0.12}
            thickness={0.5}
            transmission={0.22}
          />
        </RoundedBox>
        <mesh position={[0, 0.45, 0.09]}>
          <planeGeometry args={[2.2, 0.06]} />
          <meshStandardMaterial color="#a78abc" />
        </mesh>
        <mesh position={[0, -0.15, 0.09]}>
          <planeGeometry args={[1.25, 0.08]} />
          <meshStandardMaterial color="#332b38" />
        </mesh>
        <mesh position={[0, -0.46, 0.09]}>
          <planeGeometry args={[1.65, 0.035]} />
          <meshStandardMaterial color="#867d87" />
        </mesh>
      </group>
    </group>
  );
}

function CameraRig({ progress, pointer }: ReturnType<typeof useJourney>) {
  const { camera } = useThree();
  const points = useMemo(
    () => [
      new THREE.Vector3(0, 0, 7),
      new THREE.Vector3(0, 0.2, 4.5),
      new THREE.Vector3(-2, 1, -3),
      new THREE.Vector3(-3, 1, -7),
      new THREE.Vector3(3, 1, -15),
      new THREE.Vector3(0, 0, -23),
      new THREE.Vector3(0, 0.2, -26.5),
      new THREE.Vector3(0, 0, -35),
    ],
    [],
  );

  useFrame(() => {
    const scaled = clamp(progress.current / 0.86) * (points.length - 1);
    const index = Math.min(points.length - 2, Math.floor(scaled));
    const target = points[index].clone().lerp(points[index + 1], scaled - index);
    target.x += pointer.current.x * 0.16;
    target.y -= pointer.current.y * 0.1;
    camera.position.copy(target);
    camera.lookAt(0, 0, camera.position.z - 6);
  });

  return null;
}

function ContextGuard({ onUnavailable }: { onUnavailable: () => void }) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      onUnavailable();
    };

    canvas.addEventListener("webglcontextlost", handleContextLoss);
    return () =>
      canvas.removeEventListener("webglcontextlost", handleContextLoss);
  }, [gl, onUnavailable]);

  return null;
}

export function SpatialInvitation({
  onUnavailable,
}: {
  onUnavailable: () => void;
}) {
  const journey = useJourney();

  return (
    <Canvas
      aria-hidden="true"
      className="world-canvas"
      dpr={[1, 1.5]}
      frameloop="demand"
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#120e17"]} />
      <fog attach="fog" args={["#120e17", 10, 35]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 7, 6]} intensity={3.2} color="#ffe1bd" />
      <pointLight position={[-4, 1, -12]} intensity={35} color="#a36dde" />
      <Suspense fallback={null}>
        <Envelope {...journey} />
        <RibbonPath progress={journey.progress} />
        <Venue progress={journey.progress} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.15, -15]}>
          <planeGeometry args={[70, 70]} />
          <MeshReflectorMaterial
            blur={[600, 120]}
            color="#171018"
            depthScale={1}
            metalness={0.22}
            mixBlur={1}
            mixStrength={25}
            resolution={512}
            roughness={0.72}
          />
        </mesh>
        <Sparkles
          count={90}
          scale={[22, 8, 42]}
          size={1.5}
          speed={0.12}
          color="#e7d7ff"
        />
      </Suspense>
      <ContextGuard onUnavailable={onUnavailable} />
      <CameraRig {...journey} />
    </Canvas>
  );
}
