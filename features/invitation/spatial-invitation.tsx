"use client";

import { RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";

import {
  CoupleMonogram3D,
  createCurtainPanelGeometry,
  PaperMaterial,
} from "@/features/invitation/spatial-craft";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const range = (progress: number, start: number, length: number) =>
  clamp((progress - start) / length);
const ease = (value: number) => value * value * (3 - 2 * value);

type JourneyState = ReturnType<typeof useJourney>;
type CameraPoint = {
  progress: number;
  position: readonly [number, number, number];
  target: readonly [number, number, number];
};

const DESKTOP_CAMERA: readonly CameraPoint[] = [
  { progress: 0, position: [0, 0, 8.3], target: [0, -0.28, 0] },
  { progress: 0.13, position: [0, 0, 8.05], target: [0, -0.22, -0.4] },
  { progress: 0.2, position: [0, 0.1, -2.8], target: [0, -0.25, -10] },
  { progress: 0.31, position: [-1.4, 0.7, -7.5], target: [0.8, -0.6, -14] },
  { progress: 0.53, position: [1.2, 0.8, -18], target: [-0.8, -0.7, -25] },
  { progress: 0.64, position: [0, 0.5, -26], target: [0, 0.1, -39] },
  { progress: 0.75, position: [-1.4, 0.4, -31], target: [0.8, 0, -43] },
  { progress: 0.83, position: [1.2, 0.3, -35], target: [0, 0.1, -45] },
  { progress: 0.91, position: [0, 0.1, -40], target: [0, -0.45, -48] },
  { progress: 1, position: [0, 0.2, -44], target: [0, -0.3, -49] },
] as const;

const MOBILE_CAMERA: readonly CameraPoint[] = DESKTOP_CAMERA.map((point) => ({
  ...point,
  position: [0, point.position[1] + 0.22, point.position[2]],
  target: [0, point.target[1], point.target[2]],
}));

function sampleCamera(
  points: readonly CameraPoint[],
  progress: number,
  position: THREE.Vector3,
  target: THREE.Vector3,
) {
  const first = points[0];
  const last = points.at(-1);
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

  const upperIndex = points.findIndex((point) => point.progress >= progress);
  const lower = points[Math.max(0, upperIndex - 1)];
  const upper = points[upperIndex];
  const local = clamp(
    (progress - lower.progress) /
      Math.max(0.001, upper.progress - lower.progress),
  );

  position.set(
    THREE.MathUtils.lerp(lower.position[0], upper.position[0], local),
    THREE.MathUtils.lerp(lower.position[1], upper.position[1], local),
    THREE.MathUtils.lerp(lower.position[2], upper.position[2], local),
  );
  target.set(
    THREE.MathUtils.lerp(lower.target[0], upper.target[0], local),
    THREE.MathUtils.lerp(lower.target[1], upper.target[1], local),
    THREE.MathUtils.lerp(lower.target[2], upper.target[2], local),
  );
}

function useJourney() {
  const progress = useRef(0);
  const targetProgress = useRef(0);
  const pointer = useRef(new THREE.Vector2());
  const targetPointer = useRef(new THREE.Vector2());
  const preparing = useRef(true);
  const anchors = useRef<Array<{ progress: number; top: number }>>([]);

  useEffect(() => {
    let active = true;
    let initialized = false;

    const measure = () => {
      if (!active) return;
      anchors.current = Array.from(
        document.querySelectorAll<HTMLElement>("[data-journey-progress]"),
      )
        .map((element) => ({
          progress: Number(element.dataset.journeyProgress),
          top:
            element.offsetTop +
            Math.min(element.offsetHeight, window.innerHeight) * 0.5,
        }))
        .filter((anchor) => Number.isFinite(anchor.progress))
        .sort((first, second) => first.top - second.top);
    };

    const update = () => {
      if (!active) return;
      const point = window.scrollY + window.innerHeight * 0.5;
      const measured = anchors.current;
      const first = measured[0];
      const last = measured.at(-1);
      let nextProgress = 0;

      if (!first || !last || point <= first.top) {
        nextProgress = first?.progress ?? 0;
      } else {
        const nextIndex = measured.findIndex((anchor) => anchor.top >= point);
        if (nextIndex > 0) {
          const previous = measured[nextIndex - 1];
          const next = measured[nextIndex];
          const local = clamp(
            (point - previous.top) / Math.max(1, next.top - previous.top),
          );
          nextProgress = THREE.MathUtils.lerp(
            previous.progress,
            next.progress,
            local,
          );
        } else {
          const end =
            document.documentElement.scrollHeight - window.innerHeight * 0.5;
          const local = clamp((point - last.top) / Math.max(1, end - last.top));
          nextProgress = THREE.MathUtils.lerp(last.progress, 1, local);
        }
      }

      targetProgress.current = nextProgress;
      if (!initialized) {
        progress.current = nextProgress;
        initialized = true;
      }
    };

    const move = (event: PointerEvent) => {
      targetPointer.current.set(
        (event.clientX / window.innerWidth - 0.5) * 2,
        (event.clientY / window.innerHeight - 0.5) * 2,
      );
    };

    const refresh = () => {
      measure();
      update();
    };

    refresh();
    addEventListener("scroll", update, { passive: true });
    addEventListener("pointermove", move, { passive: true });
    addEventListener("resize", refresh, { passive: true });
    const experience = document.querySelector(".experience");
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(refresh);
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

  return { pointer, preparing, progress, targetPointer, targetProgress };
}

function JourneySmoother({
  pointer: pointerRef,
  preparing: preparingRef,
  progress: progressRef,
  targetPointer: targetPointerRef,
  targetProgress: targetProgressRef,
}: JourneyState) {
  useFrame((_, delta) => {
    if (preparingRef.current) return;
    progressRef.current = THREE.MathUtils.damp(
      progressRef.current,
      targetProgressRef.current,
      5.5,
      delta,
    );
    pointerRef.current.x = THREE.MathUtils.damp(
      pointerRef.current.x,
      targetPointerRef.current.x,
      6,
      delta,
    );
    pointerRef.current.y = THREE.MathUtils.damp(
      pointerRef.current.y,
      targetPointerRef.current.y,
      6,
      delta,
    );
  }, -100);

  return null;
}

function PaperEnvelope({
  initials,
  pointer,
  progress,
}: Pick<JourneyState, "pointer" | "progress"> & {
  initials: readonly [string, string];
}) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const flap = useRef<THREE.Mesh>(null);
  const card = useRef<THREE.Group>(null);
  const cardFace = useRef<THREE.MeshPhysicalMaterial>(null);
  const seal = useRef<THREE.Group>(null);
  const folds = useMemo(() => {
    const flapShape = new THREE.Shape();
    flapShape.moveTo(-2.1, 0);
    flapShape.lineTo(2.1, 0);
    flapShape.lineTo(0, -1.48);
    flapShape.closePath();
    const left = new THREE.Shape();
    left.moveTo(-2.1, -1.38);
    left.lineTo(-2.1, 1.38);
    left.lineTo(0, -0.15);
    left.closePath();
    const right = new THREE.Shape();
    right.moveTo(2.1, -1.38);
    right.lineTo(2.1, 1.38);
    right.lineTo(0, -0.15);
    right.closePath();
    const pocket = new THREE.Shape();
    pocket.moveTo(-2.1, -1.38);
    pocket.lineTo(2.1, -1.38);
    pocket.lineTo(0, 0.48);
    pocket.closePath();
    return { flap: flapShape, left, pocket, right };
  }, []);

  useFrame((state, delta) => {
    if (
      !group.current ||
      !flap.current ||
      !card.current ||
      !cardFace.current ||
      !seal.current
    ) {
      return;
    }

    const current = progress.current;
    const mobile = size.width <= 850;
    const lift = ease(range(current, 0.012, 0.028));
    const release = ease(range(current, 0.022, 0.026));
    const open = ease(range(current, 0.04, 0.07));
    const cardRise = ease(range(current, 0.06, 0.07));
    const cardExit = ease(range(current, 0.1, 0.04));
    const leave = ease(range(current, 0.105, 0.045));
    const baseScale = mobile ? 0.76 : 1;
    const baseY = mobile ? -1.02 : -0.34;
    const idle = Math.sin(state.clock.elapsedTime * 0.65) * 0.025 * (1 - open);

    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      -leave * (mobile ? 0 : 0.24),
      8,
      delta,
    );
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      baseY + idle + lift * 0.08 + leave * 0.72,
      8,
      delta,
    );
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      -leave * 1.8,
      8,
      delta,
    );
    const scale = THREE.MathUtils.damp(
      group.current.scale.x,
      baseScale * (1 + Math.sin(lift * Math.PI) * 0.025) * (1 - leave * 0.99),
      8,
      delta,
    );
    group.current.scale.setScalar(Math.max(0.001, scale));
    group.current.visible = current < 0.19 || scale > 0.018;
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -0.045 + pointer.current.y * 0.025 * (1 - open),
      4,
      delta,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      pointer.current.x * 0.045 * (1 - open),
      4,
      delta,
    );

    flap.current.rotation.x = THREE.MathUtils.damp(
      flap.current.rotation.x,
      -Math.PI * 0.96 * open,
      5,
      delta,
    );
    card.current.position.y = THREE.MathUtils.damp(
      card.current.position.y,
      0.04 + cardRise * 1.62,
      5,
      delta,
    );
    card.current.position.z = THREE.MathUtils.damp(
      card.current.position.z,
      0.2 + cardRise * 0.82,
      5,
      delta,
    );
    const cardScale = THREE.MathUtils.damp(
      card.current.scale.x,
      1 - cardExit * 0.12,
      6,
      delta,
    );
    card.current.scale.setScalar(cardScale);
    cardFace.current.opacity = THREE.MathUtils.damp(
      cardFace.current.opacity,
      1 - cardExit,
      7,
      delta,
    );
    seal.current.scale.setScalar(
      THREE.MathUtils.damp(
        seal.current.scale.x,
        Math.max(0.001, 1 - release),
        8,
        delta,
      ),
    );
    seal.current.position.y = THREE.MathUtils.damp(
      seal.current.position.y,
      0.05 - release * 0.16,
      7,
      delta,
    );
    seal.current.rotation.z = THREE.MathUtils.damp(
      seal.current.rotation.z,
      release * 0.26,
      7,
      delta,
    );
  });

  return (
    <group ref={group} position={[0, -0.34, 0]}>
      <RoundedBox args={[4.25, 2.8, 0.14]} radius={0.14} smoothness={6}>
        <PaperMaterial color="#e8ddce" />
      </RoundedBox>
      <group ref={card} position={[0, 0.04, 0.2]}>
        <RoundedBox args={[3.5, 2.28, 0.08]} radius={0.1} smoothness={6}>
          <meshPhysicalMaterial
            ref={cardFace}
            clearcoat={0.6}
            color="#d8d0df"
            metalness={0.04}
            opacity={1}
            roughness={0.28}
            transparent
          />
        </RoundedBox>
      </group>
      <mesh position={[0, 0, 0.09]}>
        <shapeGeometry args={[folds.left]} />
        <PaperMaterial color="#e8ddcf" />
      </mesh>
      <mesh position={[0, 0, 0.095]}>
        <shapeGeometry args={[folds.right]} />
        <PaperMaterial color="#eee4d6" />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <shapeGeometry args={[folds.pocket]} />
        <PaperMaterial color="#f2e8da" />
      </mesh>
      <mesh ref={flap} position={[0, 1.38, 0.11]}>
        <shapeGeometry args={[folds.flap]} />
        <PaperMaterial color="#f4ebdf" side={THREE.DoubleSide} />
      </mesh>
      <group ref={seal} position={[0, 0.05, 0.32]}>
        <mesh>
          <circleGeometry args={[0.38, 48]} />
          <meshStandardMaterial
            color="#b58e53"
            metalness={0.42}
            roughness={0.52}
          />
        </mesh>
        <CoupleMonogram3D initials={initials} />
      </group>
    </group>
  );
}

function GoldenCurtainThreshold({
  progress,
}: Pick<JourneyState, "progress">) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const geometries = useMemo(
    () => [
      createCurtainPanelGeometry(4.55, 7.25, 0.25),
      createCurtainPanelGeometry(4.55, 7.25, Math.PI + 0.25),
      createCurtainPanelGeometry(9.5, 1.3, 1.1),
    ],
    [],
  );

  useEffect(
    () => () => geometries.forEach((geometry) => geometry.dispose()),
    [geometries],
  );

  useFrame((state, delta) => {
    if (!group.current || !left.current || !right.current || !light.current) {
      return;
    }
    const current = progress.current;
    const mobile = size.width <= 850;
    const reveal = ease(range(current, 0.125, 0.045));
    const part = ease(range(current, 0.145, 0.06));
    const exit = ease(range(current, 0.225, 0.075));
    const baseScale = mobile ? 0.67 : 0.82;
    const scale = THREE.MathUtils.damp(
      group.current.scale.x,
      Math.max(0.001, baseScale * reveal),
      4.8,
      delta,
    );
    group.current.scale.setScalar(scale * (1 - exit * 0.08));
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      THREE.MathUtils.lerp(-0.35, 0.05, reveal),
      4.8,
      delta,
    );
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      THREE.MathUtils.lerp(1.3, -2.2, reveal) - exit * 0.65,
      4.8,
      delta,
    );

    const sway = Math.sin(state.clock.elapsedTime * 0.72) * 0.012 * reveal;
    left.current.position.x = THREE.MathUtils.damp(
      left.current.position.x,
      THREE.MathUtils.lerp(-2.24, -3.7, part),
      4.5,
      delta,
    );
    right.current.position.x = THREE.MathUtils.damp(
      right.current.position.x,
      THREE.MathUtils.lerp(2.24, 3.7, part),
      4.5,
      delta,
    );
    left.current.scale.x = THREE.MathUtils.damp(
      left.current.scale.x,
      THREE.MathUtils.lerp(1, 0.42, part),
      4.5,
      delta,
    );
    right.current.scale.x = THREE.MathUtils.damp(
      right.current.scale.x,
      THREE.MathUtils.lerp(1, 0.42, part),
      4.5,
      delta,
    );
    left.current.rotation.y = -part * 0.12 + sway;
    right.current.rotation.y = part * 0.12 - sway;
    light.current.intensity = THREE.MathUtils.damp(
      light.current.intensity,
      24 * reveal * (1 - exit * 0.55),
      5,
      delta,
    );
  });

  const material = (
    <meshPhysicalMaterial
      color="#b88b35"
      metalness={0.06}
      roughness={0.5}
      sheen={0.9}
      sheenColor="#f7d58c"
      side={THREE.DoubleSide}
    />
  );

  return (
    <group ref={group} position={[0, -0.35, 1.3]} scale={0.001}>
      <mesh position={[0, 0, -0.24]}>
        <planeGeometry args={[9.6, 7.4]} />
        <meshStandardMaterial color="#130918" roughness={0.96} />
      </mesh>
      <group ref={left} position={[-2.24, 0, 0]}>
        <mesh geometry={geometries[0]}>{material}</mesh>
      </group>
      <group ref={right} position={[2.24, 0, 0]}>
        <mesh geometry={geometries[1]}>{material}</mesh>
      </group>
      <mesh geometry={geometries[2]} position={[0, 3.25, 0.12]}>
        <meshPhysicalMaterial
          color="#c59b48"
          metalness={0.06}
          roughness={0.48}
          sheen={0.92}
          sheenColor="#ffe1a0"
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight
        ref={light}
        color="#f4c978"
        distance={12}
        intensity={0}
        position={[0, 0.2, -1.5]}
      />
    </group>
  );
}

function createJourneyCurve() {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, -1.55, -4),
      new THREE.Vector3(-1.8, -0.65, -9),
      new THREE.Vector3(1.2, -0.95, -15),
      new THREE.Vector3(2.5, -0.45, -21),
      new THREE.Vector3(0, -1.1, -28),
      new THREE.Vector3(0, -1.3, -46),
    ],
    false,
    "catmullrom",
    0.42,
  );
}

function SparseWeddingWorld({ progress }: Pick<JourneyState, "progress">) {
  const { size } = useThree();
  const world = useRef<THREE.Group>(null);
  const conversation = useRef<THREE.Group>(null);
  const proposal = useRef<THREE.Group>(null);
  const pavilion = useRef<THREE.Group>(null);
  const palette = useRef<THREE.Group>(null);
  const candle = useRef<THREE.Group>(null);
  const ribbon = useRef<THREE.MeshBasicMaterial>(null);
  const pavilionLight = useRef<THREE.PointLight>(null);
  const curve = useMemo(() => createJourneyCurve(), []);

  useFrame((state, delta) => {
    if (
      !world.current ||
      !conversation.current ||
      !proposal.current ||
      !pavilion.current ||
      !palette.current ||
      !candle.current ||
      !ribbon.current ||
      !pavilionLight.current
    ) {
      return;
    }

    const current = progress.current;
    const mobile = size.width <= 850;
    const reveal = ease(range(current, 0.13, 0.09));
    const worldScale = THREE.MathUtils.damp(
      world.current.scale.x,
      Math.max(0.001, reveal),
      4.5,
      delta,
    );
    world.current.scale.setScalar(worldScale);
    ribbon.current.opacity = THREE.MathUtils.damp(
      ribbon.current.opacity,
      0.82 * reveal,
      5,
      delta,
    );

    const setTokenScale = (
      group: THREE.Group,
      start: number,
      end: number,
      settle = 1,
    ) => {
      const show = ease(range(current, start, 0.055));
      const hide = ease(range(current, end, 0.055));
      const next = THREE.MathUtils.damp(
        group.scale.x,
        Math.max(0.001, show * (1 - hide) * settle),
        5,
        delta,
      );
      group.scale.setScalar(next);
    };

    setTokenScale(conversation.current, 0.24, 0.38);
    setTokenScale(proposal.current, 0.37, 0.54);
    const pavilionShow = ease(range(current, 0.54, 0.09));
    const pavilionScale = THREE.MathUtils.damp(
      pavilion.current.scale.x,
      Math.max(0.001, pavilionShow),
      4.5,
      delta,
    );
    pavilion.current.scale.setScalar(pavilionScale);
    setTokenScale(palette.current, 0.7, 0.86, 0.9);
    const candleShow = ease(range(current, 0.84, 0.08));
    const candleScale = THREE.MathUtils.damp(
      candle.current.scale.x,
      Math.max(0.001, candleShow),
      4.5,
      delta,
    );
    candle.current.scale.setScalar(candleScale);

    const float = Math.sin(state.clock.elapsedTime * 0.8) * 0.045;
    conversation.current.position.x = mobile ? -0.42 : -1.8;
    conversation.current.position.y = (mobile ? 0.76 : 0.4) + float;
    proposal.current.position.x = mobile ? 0.58 : 2.5;
    proposal.current.position.y = mobile ? 0.38 : -0.15;
    proposal.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.08;
    palette.current.position.x = mobile ? -0.7 : -1.4;
    palette.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.52) * 0.025;
    pavilionLight.current.intensity = 26 * pavilionShow *
      (0.92 + Math.sin(state.clock.elapsedTime * 0.7) * 0.08);
  });

  return (
    <group ref={world} scale={0.001}>
      <mesh>
        <tubeGeometry args={[curve, 180, 0.038, 10, false]} />
        <meshBasicMaterial
          ref={ribbon}
          color="#d6b56f"
          opacity={0}
          toneMapped={false}
          transparent
        />
      </mesh>

      <group ref={conversation} position={[-1.8, 0.4, -9]} scale={0.001}>
        <mesh rotation={[Math.PI / 2, 0.15, 0]}>
          <torusGeometry args={[0.44, 0.045, 12, 64, Math.PI * 1.45]} />
          <meshStandardMaterial color="#d9c6df" roughness={0.44} />
        </mesh>
        <mesh position={[0.26, 0.18, 0.05]}>
          <sphereGeometry args={[0.12, 24, 16]} />
          <meshPhysicalMaterial color="#f5eee4" clearcoat={0.8} roughness={0.2} />
        </mesh>
      </group>

      <group ref={proposal} position={[2.5, -0.15, -21]} scale={0.001}>
        <RoundedBox args={[1.55, 1.1, 1.28]} radius={0.2} smoothness={6}>
          <meshPhysicalMaterial color="#43223b" roughness={0.42} />
        </RoundedBox>
        <mesh position={[0, 0.72, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.07, 20, 64]} />
          <meshStandardMaterial color="#d6ae5c" metalness={0.92} roughness={0.16} />
        </mesh>
        <mesh position={[0, 1.04, 0.08]}>
          <octahedronGeometry args={[0.15]} />
          <meshPhysicalMaterial color="#fff" roughness={0.04} transmission={0.35} />
        </mesh>
      </group>

      <group ref={pavilion} position={[0, -0.1, -40]} scale={0.001}>
        <mesh>
          <torusGeometry args={[3.4, 0.24, 24, 96, Math.PI]} />
          <meshPhysicalMaterial
            clearcoat={0.7}
            color="#e9dfd2"
            metalness={0.14}
            roughness={0.28}
          />
        </mesh>
        <mesh position={[-3.4, -2, 0]}>
          <cylinderGeometry args={[0.24, 0.34, 4, 32]} />
          <meshStandardMaterial color="#e9dfd2" roughness={0.4} />
        </mesh>
        <mesh position={[3.4, -2, 0]}>
          <cylinderGeometry args={[0.24, 0.34, 4, 32]} />
          <meshStandardMaterial color="#e9dfd2" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.2, -0.2]}>
          <planeGeometry args={[6.2, 4.7]} />
          <meshPhysicalMaterial
            color="#2a1a2e"
            opacity={0.26}
            roughness={0.18}
            transparent
          />
        </mesh>
        <pointLight
          ref={pavilionLight}
          color="#efc77b"
          distance={15}
          intensity={0}
          position={[0, 0.8, -2]}
        />
      </group>

      <group ref={palette} position={[-1.4, 0.2, -43.5]} scale={0.001}>
        {["#efe7db", "#a97ed1", "#37293c", "#c7a05a"].map(
          (color, index) => (
            <mesh key={color} position={[index * 0.48, Math.sin(index) * 0.1, 0]}>
              <sphereGeometry args={[0.22, 28, 18]} />
              <meshPhysicalMaterial color={color} clearcoat={0.42} roughness={0.34} />
            </mesh>
          ),
        )}
      </group>

      <group ref={candle} position={[0, -0.65, -48]} scale={0.001}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.36, 1.25, 40]} />
          <meshPhysicalMaterial color="#f3e9dc" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.11, 24, 16]} />
          <meshBasicMaterial color="#f7c174" toneMapped={false} />
        </mesh>
        <pointLight color="#f0a65e" distance={6} intensity={12} position={[0, 0.8, 0]} />
      </group>

    </group>
  );
}

function CameraRig({
  pointer,
  progress,
}: Pick<JourneyState, "pointer" | "progress">) {
  const { camera, size } = useThree();
  const desiredPositionRef = useRef(new THREE.Vector3());
  const desiredTargetRef = useRef(new THREE.Vector3());
  const currentTargetRef = useRef(new THREE.Vector3(0, -0.28, 0));

  useFrame((_, delta) => {
    const mobile = size.width <= 850;
    const desiredPosition = desiredPositionRef.current;
    const desiredTarget = desiredTargetRef.current;
    const currentTarget = currentTargetRef.current;
    sampleCamera(
      mobile ? MOBILE_CAMERA : DESKTOP_CAMERA,
      progress.current,
      desiredPosition,
      desiredTarget,
    );
    const pointerStrength = THREE.MathUtils.lerp(0.14, 0.05, progress.current);
    desiredPosition.set(
      desiredPosition.x + pointer.current.x * pointerStrength,
      desiredPosition.y - pointer.current.y * pointerStrength * 0.7,
      desiredPosition.z,
    );

    camera.position.set(
      THREE.MathUtils.damp(camera.position.x, desiredPosition.x, 2.6, delta),
      THREE.MathUtils.damp(camera.position.y, desiredPosition.y, 2.6, delta),
      THREE.MathUtils.damp(camera.position.z, desiredPosition.z, 2.6, delta),
    );
    currentTarget.set(
      THREE.MathUtils.damp(currentTarget.x, desiredTarget.x, 2.6, delta),
      THREE.MathUtils.damp(currentTarget.y, desiredTarget.y, 2.6, delta),
      THREE.MathUtils.damp(currentTarget.z, desiredTarget.z, 2.6, delta),
    );
    camera.lookAt(currentTarget);
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
    return () => canvas.removeEventListener("webglcontextlost", handleContextLoss);
  }, [gl, onUnavailable]);

  return null;
}

function ReadySignal({
  onReady,
  preparing: preparingRef,
}: Pick<JourneyState, "preparing"> & { onReady: () => void }) {
  const { camera, gl, scene } = useThree();
  const sent = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const prepare = async () => {
      try {
        await gl.compileAsync(scene, camera);
      } catch {
        gl.compile(scene, camera);
      }
      if (cancelled || sent.current) return;
      preparingRef.current = false;
      sent.current = true;
      requestAnimationFrame(onReady);
    };
    void prepare();
    return () => {
      cancelled = true;
    };
  }, [camera, gl, onReady, preparingRef, scene]);

  return null;
}

export function SpatialInvitation({
  initials,
  onPending,
  onReady,
  onUnavailable,
}: {
  initials: readonly [string, string];
  onPending: () => void;
  onReady: () => void;
  onUnavailable: () => void;
}) {
  const journey = useJourney();

  useLayoutEffect(() => onPending(), [onPending]);

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 8.3], fov: 38, near: 0.1, far: 120 }}
      className="world-canvas"
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0b0710"]} />
      <fog attach="fog" args={["#0b0710", 22, 72]} />
      <ambientLight color="#d9c6db" intensity={0.58} />
      <directionalLight color="#ffe3c2" intensity={2.7} position={[5, 8, 7]} />
      <pointLight color="#c9a565" distance={14} intensity={22} position={[3, 0, 3]} />
      <JourneySmoother {...journey} />
      <Suspense fallback={null}>
        <PaperEnvelope
          initials={initials}
          pointer={journey.pointer}
          progress={journey.progress}
        />
        <GoldenCurtainThreshold progress={journey.progress} />
        <SparseWeddingWorld progress={journey.progress} />
        <ReadySignal onReady={onReady} preparing={journey.preparing} />
      </Suspense>
      <CameraRig pointer={journey.pointer} progress={journey.progress} />
      <ContextGuard onUnavailable={onUnavailable} />
    </Canvas>
  );
}
