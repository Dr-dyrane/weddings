"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  type RefObject,
  Suspense,
  useEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const ease = (value: number) => value * value * (3 - 2 * value);
const range = (value: number, start: number, end: number) =>
  ease(clamp((value - start) / Math.max(0.001, end - start)));
const windowOpacity = (
  value: number,
  enterStart: number,
  enterEnd: number,
  leaveStart: number,
  leaveEnd: number,
) => range(value, enterStart, enterEnd) * (1 - range(value, leaveStart, leaveEnd));

type JourneyMotion = {
  pointer: RefObject<THREE.Vector2>;
  progress: RefObject<number>;
  targetPointer: RefObject<THREE.Vector2>;
  targetProgress: RefObject<number>;
};

type CameraPoint = {
  progress: number;
  position: readonly [number, number, number];
  target: readonly [number, number, number];
};

const CAMERA_POINTS: readonly CameraPoint[] = [
  { progress: 0, position: [0, 0, 8], target: [0, 0, 0] },
  { progress: 0.18, position: [0, 0, 8], target: [1.8, -0.2, 0] },
  { progress: 0.38, position: [0.4, 0.15, -2], target: [-1.7, 0, -10] },
  { progress: 0.57, position: [-0.25, 0.2, -12], target: [1.5, 0, -20] },
  { progress: 0.78, position: [0.35, 0.1, -22], target: [1.7, -0.1, -30] },
  { progress: 0.96, position: [0, 0, -34], target: [1.6, -0.8, -42] },
  { progress: 1, position: [0, 0, -37], target: [1.4, -0.7, -42] },
] as const;

function sampleCamera(
  progress: number,
  position: THREE.Vector3,
  target: THREE.Vector3,
) {
  const first = CAMERA_POINTS[0];
  const last = CAMERA_POINTS.at(-1);
  if (!first || !last) return;

  if (progress <= first.progress) {
    position.set(...first.position);
    target.set(...first.target);
    return;
  }
  if (progress >= last.progress) {
    position.set(...last.position);
    target.set(...last.target);
    return;
  }

  const upperIndex = CAMERA_POINTS.findIndex(
    (point) => point.progress >= progress,
  );
  const lower = CAMERA_POINTS[Math.max(0, upperIndex - 1)];
  const upper = CAMERA_POINTS[upperIndex];
  const local = clamp(
    (progress - lower.progress) /
      Math.max(0.001, upper.progress - lower.progress),
  );
  const eased = ease(local);

  position.set(
    THREE.MathUtils.lerp(lower.position[0], upper.position[0], eased),
    THREE.MathUtils.lerp(lower.position[1], upper.position[1], eased),
    THREE.MathUtils.lerp(lower.position[2], upper.position[2], eased),
  );
  target.set(
    THREE.MathUtils.lerp(lower.target[0], upper.target[0], eased),
    THREE.MathUtils.lerp(lower.target[1], upper.target[1], eased),
    THREE.MathUtils.lerp(lower.target[2], upper.target[2], eased),
  );
}

function createRibbonGeometry(
  curve: THREE.CatmullRomCurve3,
  width = 0.36,
  segments = 120,
) {
  const positions: number[] = [];
  const indices: number[] = [];
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const viewAxis = new THREE.Vector3(0, 0, 1);

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    curve.getPointAt(t, point);
    curve.getTangentAt(t, tangent).normalize();
    side.crossVectors(viewAxis, tangent).normalize().multiplyScalar(width / 2);
    positions.push(
      point.x + side.x,
      point.y + side.y,
      point.z + side.z,
      point.x - side.x,
      point.y - side.y,
      point.z - side.z,
    );

    if (index < segments) {
      const current = index * 2;
      const next = current + 2;
      indices.push(current, next, current + 1, next, next + 1, current + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function ConversationThread({ motion }: { motion: JourneyMotion }) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const yellow = useRef<THREE.MeshBasicMaterial>(null);
  const white = useRef<THREE.MeshBasicMaterial>(null);
  const thread = useRef<THREE.MeshBasicMaterial>(null);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.25, -0.18, 0),
        new THREE.Vector3(-0.92, 0.18, 0.1),
        new THREE.Vector3(-0.42, 0.32, -0.08),
        new THREE.Vector3(0.08, 0.03, 0.12),
        new THREE.Vector3(0.5, -0.28, -0.04),
        new THREE.Vector3(0.9, -0.08, 0.08),
        new THREE.Vector3(1.22, 0.2, 0),
      ]),
    [],
  );
  const geometry = useMemo(
    () => new THREE.TubeGeometry(curve, 100, 0.007, 6, false),
    [curve],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    if (!group.current || !yellow.current || !white.current || !thread.current) {
      return;
    }
    const opacity = windowOpacity(motion.progress.current, 0.12, 0.19, 0.31, 0.37);
    group.current.visible = opacity > 0.004;
    const mobile = size.width <= 700;
    const fidelity = mobile ? 0.5 : 1;
    group.current.position.set(mobile ? 1.08 : 2.85, -0.08, 0);
    group.current.scale.setScalar(mobile ? 0.7 : 0.82);
    group.current.rotation.y = motion.pointer.current.x * 0.08;
    group.current.rotation.x = -motion.pointer.current.y * 0.05;
    yellow.current.opacity = opacity * 0.42 * fidelity;
    white.current.opacity = opacity * 0.3 * fidelity;
    thread.current.opacity = opacity * 0.34 * fidelity;
  });

  return (
    <group ref={group} position={[2.85, -0.08, 0]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#ffd21e"
          depthWrite={false}
          opacity={0}
          ref={thread}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh position={[-1.25, -0.18, 0]}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshBasicMaterial
          color="#ffd21e"
          depthWrite={false}
          opacity={0}
          ref={yellow}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh position={[1.22, 0.2, 0]}>
        <sphereGeometry args={[0.045, 24, 24]} />
        <meshBasicMaterial
          color="#ffffff"
          depthWrite={false}
          opacity={0}
          ref={white}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}

function ProposalBand({ motion }: { motion: JourneyMotion }) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const yellow = useRef<THREE.MeshBasicMaterial>(null);
  const white = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!group.current || !yellow.current || !white.current) return;
    const opacity = windowOpacity(motion.progress.current, 0.29, 0.36, 0.48, 0.55);
    const local = range(motion.progress.current, 0.3, 0.53);
    const mobile = size.width <= 700;
    const fidelity = mobile ? 0.48 : 1;
    group.current.visible = opacity > 0.004;
    group.current.position.set(mobile ? 1.22 : -2.7, -0.08, -10);
    group.current.scale.setScalar(mobile ? 0.72 : 0.92);
    group.current.rotation.set(
      1.18 + local * 0.2,
      -0.18 + motion.pointer.current.x * 0.12,
      -0.38 + local * 0.32,
    );
    yellow.current.opacity = opacity * 0.28 * fidelity;
    white.current.opacity = opacity * 0.09 * fidelity;
  });

  return (
    <group ref={group} position={[-2.7, -0.08, -10]}>
      <mesh>
        <torusGeometry args={[0.94, 0.015, 16, 128]} />
        <meshBasicMaterial
          color="#ffd21e"
          depthWrite={false}
          opacity={0}
          ref={yellow}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh position={[0, 0, 0.025]} rotation={[0.015, -0.01, 0.02]}>
        <torusGeometry args={[0.94, 0.005, 10, 128]} />
        <meshBasicMaterial
          color="#ffffff"
          depthWrite={false}
          opacity={0}
          ref={white}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}

function LightPavilion({ motion }: { motion: JourneyMotion }) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const materials = useRef<THREE.MeshBasicMaterial[]>([]);
  const archCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.72, 0.22, 0),
        new THREE.Vector3(-1.1, 1.42, 0),
        new THREE.Vector3(0, 1.82, 0),
        new THREE.Vector3(1.1, 1.42, 0),
        new THREE.Vector3(1.72, 0.22, 0),
      ]),
    [],
  );
  const archGeometry = useMemo(
    () => new THREE.TubeGeometry(archCurve, 100, 0.009, 6, false),
    [archCurve],
  );

  useEffect(() => () => archGeometry.dispose(), [archGeometry]);

  useFrame(() => {
    if (!group.current) return;
    const opacity = windowOpacity(motion.progress.current, 0.47, 0.54, 0.68, 0.74);
    const local = range(motion.progress.current, 0.48, 0.72);
    const mobile = size.width <= 700;
    const fidelity = mobile ? 0.42 : 1;
    group.current.visible = opacity > 0.004;
    group.current.position.set(mobile ? 1.32 : 3.25, -0.72, -20);
    group.current.rotation.y = -0.12 + local * 0.22 + motion.pointer.current.x * 0.06;
    group.current.scale.setScalar((mobile ? 0.58 : 0.7) + local * 0.05);
    materials.current.forEach((material, index) => {
      material.opacity = opacity * (index === 0 ? 0.24 : 0.12) * fidelity;
    });
  });

  const addMaterial = (material: THREE.MeshBasicMaterial | null) => {
    if (material && !materials.current.includes(material)) {
      materials.current.push(material);
    }
  };

  return (
    <group ref={group} position={[3.25, -0.72, -20]}>
      <mesh geometry={archGeometry}>
        <meshBasicMaterial
          color="#ffd21e"
          depthWrite={false}
          opacity={0}
          ref={addMaterial}
          toneMapped={false}
          transparent
        />
      </mesh>
      {[-1.58, 1.58].map((x) => (
        <mesh key={x} position={[x, -1.5, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 3.45, 8]} />
          <meshBasicMaterial
            color="#ffffff"
            depthWrite={false}
            opacity={0}
            ref={addMaterial}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

function DressRibbon({ motion }: { motion: JourneyMotion }) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const fabric = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.MeshBasicMaterial>(null);
  const ribbonCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.2, 2.5, 0),
        new THREE.Vector3(-0.9, 1.2, 0.3),
        new THREE.Vector3(0.7, 0.15, -0.2),
        new THREE.Vector3(-0.5, -1.1, 0.16),
        new THREE.Vector3(0.35, -2.5, 0),
      ]),
    [],
  );
  const edgeCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.32, 2.55, 0.1),
        new THREE.Vector3(-0.76, 1.2, 0.4),
        new THREE.Vector3(0.82, 0.12, -0.1),
        new THREE.Vector3(-0.36, -1.08, 0.26),
        new THREE.Vector3(0.48, -2.46, 0.1),
      ]),
    [],
  );
  const ribbonGeometry = useMemo(
    () => createRibbonGeometry(ribbonCurve, 0.42, 130),
    [ribbonCurve],
  );
  const edgeGeometry = useMemo(
    () => new THREE.TubeGeometry(edgeCurve, 120, 0.007, 6, false),
    [edgeCurve],
  );

  useEffect(
    () => () => {
      ribbonGeometry.dispose();
      edgeGeometry.dispose();
    },
    [edgeGeometry, ribbonGeometry],
  );

  useFrame(() => {
    if (!group.current || !fabric.current || !light.current) return;
    const opacity = windowOpacity(motion.progress.current, 0.68, 0.75, 0.87, 0.92);
    const local = range(motion.progress.current, 0.69, 0.9);
    const mobile = size.width <= 700;
    const fidelity = mobile ? 0.42 : 1;
    group.current.visible = opacity > 0.004;
    group.current.position.set(mobile ? 1.4 : 3.05, 0, -30);
    group.current.rotation.set(0.05, -0.35 + local * 0.34, -0.08);
    group.current.scale.set(mobile ? 0.58 : 0.7, mobile ? 0.85 : 1, 0.7);
    fabric.current.opacity = opacity * 0.035 * fidelity;
    light.current.opacity = opacity * 0.28 * fidelity;
  });

  return (
    <group ref={group} position={[3.05, 0, -30]}>
      <mesh geometry={ribbonGeometry}>
        <meshStandardMaterial
          color="#ffffff"
          depthWrite={false}
          metalness={0}
          opacity={0}
          ref={fabric}
          roughness={0.78}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>
      <mesh geometry={edgeGeometry}>
        <meshBasicMaterial
          color="#ffd21e"
          depthWrite={false}
          opacity={0}
          ref={light}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}

function RsvpHorizon({ motion }: { motion: JourneyMotion }) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const disc = useRef<THREE.MeshBasicMaterial>(null);
  const horizon = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!group.current || !disc.current || !horizon.current) return;
    const opacity = range(motion.progress.current, 0.84, 0.94);
    const local = range(motion.progress.current, 0.85, 1);
    const mobile = size.width <= 700;
    const fidelity = mobile ? 0.4 : 1;
    group.current.visible = opacity > 0.004;
    group.current.position.set(mobile ? 1.55 : 3.6, -1.05 + local * 0.12, -42);
    group.current.scale.setScalar((mobile ? 0.68 : 0.82) + local * 0.08);
    disc.current.opacity = opacity * 0.2 * fidelity;
    horizon.current.opacity = opacity * 0.2 * fidelity;
  });

  return (
    <group ref={group} position={[3.6, -1.05, -42]}>
      <mesh position={[0, 0.4, 0]}>
        <ringGeometry args={[1.12, 1.135, 96]} />
        <meshBasicMaterial
          color="#ffd21e"
          depthWrite={false}
          opacity={0}
          ref={disc}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh position={[0, -0.06, 0.08]}>
        <planeGeometry args={[3.25, 0.012]} />
        <meshBasicMaterial
          color="#ffd21e"
          depthWrite={false}
          opacity={0}
          ref={horizon}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh position={[0, -0.96, 0.15]}>
        <planeGeometry args={[4, 1.8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
}

function SpatialJourney() {
  const { camera, invalidate, size } = useThree();
  const pointer = useRef(new THREE.Vector2());
  const progress = useRef(0);
  const targetPointer = useRef(new THREE.Vector2());
  const targetProgress = useRef(0);
  const cameraPosition = useMemo(() => new THREE.Vector3(), []);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const motion = useMemo<JourneyMotion>(
    () => ({ pointer, progress, targetPointer, targetProgress }),
    [],
  );

  useEffect(() => {
    let frame = 0;
    let initialized = false;

    const updateScroll = () => {
      frame = 0;
      const root = document.querySelector<HTMLElement>(".editorial-experience");
      const maxScroll = Math.max(
        1,
        (root?.scrollHeight ?? document.documentElement.scrollHeight) -
          window.innerHeight,
      );
      const next = clamp(window.scrollY / maxScroll);
      targetProgress.current = next;
      if (!initialized) {
        progress.current = next;
        initialized = true;
      }
      invalidate();
    };

    const requestScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(updateScroll);
    };

    const updatePointer = (event: PointerEvent) => {
      targetPointer.current.set(
        (event.clientX / innerWidth - 0.5) * 2,
        (event.clientY / innerHeight - 0.5) * 2,
      );
      invalidate();
    };

    updateScroll();
    addEventListener("scroll", requestScroll, { passive: true });
    addEventListener("resize", requestScroll, { passive: true });
    addEventListener("pointermove", updatePointer, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      removeEventListener("scroll", requestScroll);
      removeEventListener("resize", requestScroll);
      removeEventListener("pointermove", updatePointer);
    };
  }, [invalidate]);

  useFrame((_, delta) => {
    progress.current = THREE.MathUtils.damp(
      progress.current,
      targetProgress.current,
      5.5,
      delta,
    );
    pointer.current.x = THREE.MathUtils.damp(
      pointer.current.x,
      targetPointer.current.x,
      6,
      delta,
    );
    pointer.current.y = THREE.MathUtils.damp(
      pointer.current.y,
      targetPointer.current.y,
      6,
      delta,
    );

    sampleCamera(progress.current, cameraPosition, cameraTarget);
    const mobile = size.width <= 700;
    camera.position.set(
      cameraPosition.x + pointer.current.x * (mobile ? 0 : 0.12),
      cameraPosition.y - pointer.current.y * (mobile ? 0 : 0.08),
      cameraPosition.z,
    );
    camera.lookAt(cameraTarget);

    if (
      Math.abs(progress.current - targetProgress.current) > 0.0002 ||
      pointer.current.distanceTo(targetPointer.current) > 0.001
    ) {
      invalidate();
    }
  }, -100);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight color="#ffd21e" intensity={7} position={[3, 2, 4]} />
      <ConversationThread motion={motion} />
      <ProposalBand motion={motion} />
      <LightPavilion motion={motion} />
      <DressRibbon motion={motion} />
      <RsvpHorizon motion={motion} />
    </>
  );
}

export function JourneySpatialWorld() {
  return (
    <Canvas
      camera={{ far: 90, fov: 38, near: 0.1, position: [0, 0, 8] }}
      className="journey-spatial"
      dpr={[1, 1.25]}
      frameloop="demand"
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Suspense fallback={null}>
        <SpatialJourney />
      </Suspense>
    </Canvas>
  );
}
