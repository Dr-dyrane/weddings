"use client";

import { RoundedBox } from "@react-three/drei";
import { Canvas, invalidate, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { journeyChapters } from "@/features/invitation/journey";
import {
  StoryClearings,
  WeddingCircle,
} from "@/features/invitation/spatial-story";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const range = (progress: number, start: number, length: number) =>
  clamp((progress - start) / length);
const ease = (value: number) => value * value * (3 - 2 * value);

type JourneyState = ReturnType<typeof useJourney>;

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
          top:
            element.offsetTop +
            Math.min(element.offsetHeight, window.innerHeight) * 0.5,
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
            previous.progress + (next.progress - previous.progress) * ease(local);
        } else {
          const end = document.documentElement.scrollHeight - innerHeight * 0.5;
          const distance = Math.max(1, end - last.top);
          const local = clamp((point - last.top) / distance);
          progress.current = last.progress + (1 - last.progress) * ease(local);
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

  return { progress, pointer };
}

function PaperEnvelope({ progress, pointer }: JourneyState) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const flap = useRef<THREE.Mesh>(null);
  const seal = useRef<THREE.Group>(null);
  const folds = useMemo(() => {
    const flap = new THREE.Shape();
    flap.moveTo(-2.1, 0);
    flap.lineTo(2.1, 0);
    flap.lineTo(0, -1.48);
    flap.closePath();
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
    return { flap, left, pocket, right };
  }, []);

  useFrame(() => {
    if (!group.current || !flap.current || !seal.current) return;
    const current = progress.current;
    const mobile = size.width <= 700;
    const open = ease(range(current, 0.025, 0.075));
    const release = ease(range(current, 0.018, 0.028));
    const leave = ease(range(current, 0.048, 0.052));
    const baseScale = mobile ? 0.7 : 0.72;

    group.current.position.set(
      mobile ? 0 : 4 - open * 2.35,
      mobile ? -2.4 : -0.55,
      0,
    );
    group.current.rotation.set(
      -0.055 + pointer.current.y * 0.018 * (1 - open),
      pointer.current.x * 0.028 * (1 - open),
      0,
    );
    group.current.scale.setScalar(baseScale * (1 - leave));
    group.current.position.z = -leave * 2.5;
    flap.current.rotation.x = -Math.PI * 0.94 * open;
    seal.current.scale.setScalar(1 - release);
  });

  return (
    <group ref={group}>
      <RoundedBox args={[4.25, 2.8, 0.14]} radius={0.065} smoothness={5}>
        <meshStandardMaterial color="#e8ddce" roughness={0.82} />
      </RoundedBox>
      <mesh position={[0, 0, 0.09]}>
        <shapeGeometry args={[folds.left]} />
        <meshStandardMaterial color="#e8ddcf" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0, 0.095]}>
        <shapeGeometry args={[folds.right]} />
        <meshStandardMaterial color="#eee4d6" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <shapeGeometry args={[folds.pocket]} />
        <meshStandardMaterial color="#f2e8da" roughness={0.88} />
      </mesh>
      <mesh ref={flap} position={[0, 1.38, 0.11]}>
        <shapeGeometry args={[folds.flap]} />
        <meshStandardMaterial
          color="#f4ebdf"
          roughness={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>
      <group ref={seal} position={[0, 0.05, 0.32]}>
        <mesh>
          <circleGeometry args={[0.38, 48]} />
          <meshStandardMaterial color="#b58e53" metalness={0.42} roughness={0.52} />
        </mesh>
        <mesh position={[0, 0, 0.018]}>
          <ringGeometry args={[0.25, 0.275, 48]} />
          <meshStandardMaterial color="#d8b878" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

function InvitationThreshold({ progress }: Pick<JourneyState, "progress">) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const cardFace = useRef<THREE.MeshBasicMaterial>(null);
  const leftDoor = useRef<THREE.Group>(null);
  const rightDoor = useRef<THREE.Group>(null);

  useFrame(() => {
    if (
      !group.current ||
      !cardFace.current ||
      !leftDoor.current ||
      !rightDoor.current
    ) return;
    const current = progress.current;
    const mobile = size.width <= 700;
    const open = ease(range(current, 0.025, 0.075));
    const expand = ease(range(current, 0.055, 0.07));
    const doorway = ease(range(current, 0.092, 0.05));
    const cross = ease(range(current, 0.115, 0.085));
    const baseScale = mobile ? 0.7 : 0.72;
    const startScale = baseScale * 0.225;
    const endScale = mobile ? 0.75 : 0.88;
    const envelopeX = mobile ? 0 : 4 - open * 2.35;
    const liftedY = (mobile ? -2.4 : -0.55) + open * 2.65 * baseScale;
    const targetX = mobile ? 0 : 1.55;
    const targetY = mobile ? -0.1 : 0.05;

    group.current.position.set(
      THREE.MathUtils.lerp(envelopeX, targetX, expand) * (1 - cross),
      THREE.MathUtils.lerp(liftedY, targetY, expand),
      THREE.MathUtils.lerp(-0.12 + open * 0.9, -0.65, expand) - cross * 0.5,
    );
    group.current.scale.setScalar(THREE.MathUtils.lerp(startScale, endScale, expand));
    cardFace.current.opacity = 1 - doorway;
    cardFace.current.visible = doorway < 0.999;
    leftDoor.current.position.x = -0.93 - doorway * 1.86;
    rightDoor.current.position.x = 0.93 + doorway * 1.86;
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, 0.14]}>
        <planeGeometry args={[15.78, 9.38]} />
        <meshBasicMaterial
          ref={cardFace}
          color="#f4ede3"
          depthWrite={false}
          transparent
        />
      </mesh>
      <mesh position={[-7.94, 0, -0.08]}>
        <boxGeometry args={[0.08, 9.48, 0.04]} />
        <meshStandardMaterial color="#c9a565" metalness={0.56} roughness={0.34} />
      </mesh>
      <mesh position={[7.94, 0, -0.08]}>
        <boxGeometry args={[0.08, 9.48, 0.04]} />
        <meshStandardMaterial color="#c9a565" metalness={0.56} roughness={0.34} />
      </mesh>
      <mesh position={[0, 4.74, -0.08]}>
        <boxGeometry args={[15.96, 0.08, 0.04]} />
        <meshStandardMaterial color="#c9a565" metalness={0.56} roughness={0.34} />
      </mesh>
      <mesh position={[0, -4.74, -0.08]}>
        <boxGeometry args={[15.96, 0.08, 0.04]} />
        <meshStandardMaterial color="#c9a565" metalness={0.56} roughness={0.34} />
      </mesh>
      <RoundedBox args={[5.8, 7.2, 0.12]} radius={0.04} position={[-5, 0, -0.04]}>
        <meshStandardMaterial color="#f4ede3" roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[5.8, 7.2, 0.12]} radius={0.04} position={[5, 0, -0.04]}>
        <meshStandardMaterial color="#f4ede3" roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[4.25, 2.3, 0.12]} radius={0.04} position={[0, 3.55, -0.04]}>
        <meshStandardMaterial color="#f4ede3" roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[4.25, 2.3, 0.12]} radius={0.04} position={[0, -3.55, -0.04]}>
        <meshStandardMaterial color="#f4ede3" roughness={0.82} />
      </RoundedBox>
      <RoundedBox args={[0.48, 5.25, 0.18]} radius={0.035} position={[-2.1, 0, 0]}>
        <meshStandardMaterial color="#f4ede3" roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.48, 5.25, 0.18]} radius={0.035} position={[2.1, 0, 0]}>
        <meshStandardMaterial color="#f4ede3" roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[4.7, 0.48, 0.18]} radius={0.035} position={[0, 2.38, 0]}>
        <meshStandardMaterial color="#f4ede3" roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[4.7, 0.48, 0.18]} radius={0.035} position={[0, -2.38, 0]}>
        <meshStandardMaterial color="#f4ede3" roughness={0.8} />
      </RoundedBox>
      <group ref={leftDoor} position={[-0.93, 0, 0.035]}>
        <RoundedBox args={[1.86, 4.28, 0.13]} radius={0.025} smoothness={4}>
          <meshStandardMaterial color="#f4ede3" roughness={0.82} />
        </RoundedBox>
        <mesh position={[0.91, 0, 0.08]}>
          <planeGeometry args={[0.045, 4.18]} />
          <meshBasicMaterial color="#c9a565" />
        </mesh>
      </group>
      <group ref={rightDoor} position={[0.93, 0, 0.035]}>
        <RoundedBox args={[1.86, 4.28, 0.13]} radius={0.025} smoothness={4}>
          <meshStandardMaterial color="#f4ede3" roughness={0.82} />
        </RoundedBox>
        <mesh position={[-0.91, 0, 0.08]}>
          <planeGeometry args={[0.045, 4.18]} />
          <meshBasicMaterial color="#c9a565" />
        </mesh>
      </group>
      <pointLight color="#f2c878" intensity={42} distance={10} position={[0, 0, -2]} />
    </group>
  );
}

function createGardenCurve() {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, -1.88, -1.5),
      new THREE.Vector3(-0.45, -1.88, -6),
      new THREE.Vector3(-1.35, -1.88, -11),
      new THREE.Vector3(0.65, -1.88, -17),
      new THREE.Vector3(1.2, -1.88, -23),
      new THREE.Vector3(0, -1.88, -31),
      new THREE.Vector3(0, -1.88, -43),
    ],
    false,
    "catmullrom",
    0.42,
  );
}

function createPathGeometry(curve: THREE.CatmullRomCurve3) {
  const samples = 48;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const width = THREE.MathUtils.lerp(1.7, 0.72, t);
    const left = point.clone().addScaledVector(side, width);
    const right = point.clone().addScaledVector(side, -width);
    positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
  }
  for (let index = 0; index < samples; index += 1) {
    const cursor = index * 2;
    indices.push(cursor, cursor + 1, cursor + 2, cursor + 1, cursor + 3, cursor + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function GardenFoliage() {
  const ivory = useRef<THREE.InstancedMesh>(null);
  const foliage = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const euler = new THREE.Euler();
    for (let index = 0; index < 54; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const depth = -4.5 - (index % 27) * 1.45;
      const clearingGap =
        (side > 0 && depth < -11 && depth > -16.5) ||
        (side < 0 && depth < -18.5 && depth > -23.8) ||
        (depth < -23.5 && depth > -30.5);
      const offset = 2.75 + (index % 6) * 0.26 + (clearingGap ? 1.85 : 0);
      position.set(
        side * offset + Math.sin(index * 1.7) * 0.2,
        -1.24 + (index % 5) * 0.17,
        depth,
      );
      euler.set(0, 0, side * (0.08 + (index % 4) * 0.08));
      rotation.setFromEuler(euler);
      const size = 0.3 + (index % 5) * 0.075;
      scale.set(size * 1.35, size, 1);
      matrix.compose(position, rotation, scale);
      foliage.current?.setMatrixAt(index, matrix);
      foliage.current?.setColorAt(
        index,
        new THREE.Color(index % 5 === 0 ? "#4a3047" : "#35483c"),
      );

      position.set(
        side * (offset - 0.24),
        -0.8 + (index % 4) * 0.17,
        depth + 0.16,
      );
      const flowerSize = index % 3 === 0 ? 0.12 + (index % 4) * 0.025 : 0.001;
      scale.set(flowerSize, flowerSize, 1);
      matrix.compose(position, rotation, scale);
      ivory.current?.setMatrixAt(index, matrix);
      ivory.current?.setColorAt(
        index,
        new THREE.Color(index % 4 === 0 ? "#b89bcb" : "#e4dbd0"),
      );
    }
    if (foliage.current) {
      foliage.current.instanceMatrix.needsUpdate = true;
      if (foliage.current.instanceColor) foliage.current.instanceColor.needsUpdate = true;
    }
    if (ivory.current) {
      ivory.current.instanceMatrix.needsUpdate = true;
      if (ivory.current.instanceColor) ivory.current.instanceColor.needsUpdate = true;
    }
    invalidate();
  }, []);

  return (
    <group>
      <instancedMesh ref={foliage} args={[undefined, undefined, 54]}>
        <circleGeometry args={[1, 12]} />
        <meshBasicMaterial color="#ffffff" vertexColors />
      </instancedMesh>
      <instancedMesh ref={ivory} args={[undefined, undefined, 54]}>
        <circleGeometry args={[1, 12]} />
        <meshBasicMaterial color="#ffffff" vertexColors />
      </instancedMesh>
    </group>
  );
}

function DistantPavilion() {
  return (
    <group position={[0, -0.45, -44]}>
      <mesh position={[0, 1.2, 0]}>
        <planeGeometry args={[8.6, 5.2]} />
        <meshBasicMaterial color="#5c3c36" transparent opacity={0.42} />
      </mesh>
      {[-4.1, -2.05, 0, 2.05, 4.1].map((x) => (
        <mesh key={x} position={[x, 1.25, 0.15]}>
          <boxGeometry args={[0.12, 5.3, 0.12]} />
          <meshStandardMaterial color="#59412f" metalness={0.36} roughness={0.48} />
        </mesh>
      ))}
      <mesh position={[0, 3.9, 0.08]} rotation={[0, 0, 0]}>
        <boxGeometry args={[9.4, 0.16, 0.2]} />
        <meshStandardMaterial color="#6f5236" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, -1.35, 0.22]}>
        <planeGeometry args={[7.2, 0.12]} />
        <meshBasicMaterial color="#e5b76b" />
      </mesh>
      <pointLight color="#f0b96f" intensity={55} distance={22} position={[0, 1, 2]} />
    </group>
  );
}

function LivingGarden({
  peopleCount,
  progress,
  storyProgress,
}: Pick<JourneyState, "progress"> & {
  peopleCount: number;
  storyProgress: readonly number[];
}) {
  const group = useRef<THREE.Group>(null);
  const ribbonCurve = useMemo(() => createGardenCurve(), []);
  const pathGeometry = useMemo(() => createPathGeometry(ribbonCurve), [ribbonCurve]);

  useEffect(() => () => pathGeometry.dispose(), [pathGeometry]);
  useFrame(() => {
    if (group.current) group.current.visible = progress.current >= 0.085;
  });

  return (
    <group ref={group} visible={false}>
      <mesh geometry={pathGeometry}>
        <meshBasicMaterial color="#94857a" side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <tubeGeometry args={[ribbonCurve, 120, 0.035, 8, false]} />
        <meshBasicMaterial color="#d9b56f" toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.94, -23]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#11140f" roughness={1} />
      </mesh>
      <GardenFoliage />
      <StoryClearings progress={progress} storyProgress={storyProgress} />
      <WeddingCircle peopleCount={peopleCount} progress={progress} />
      <DistantPavilion />
    </group>
  );
}

function CameraRig({ progress, pointer }: JourneyState) {
  const { camera, size } = useThree();
  const curves = useMemo(() => {
    const make = (mode: "desktop" | "mobile", key: "position" | "target") =>
      new THREE.CatmullRomCurve3(
        journeyChapters.map(
          (chapter) => new THREE.Vector3(...chapter.camera[mode][key]),
        ),
        false,
        "catmullrom",
        0.38,
      );
    return {
      desktopPosition: make("desktop", "position"),
      desktopTarget: make("desktop", "target"),
      mobilePosition: make("mobile", "position"),
      mobileTarget: make("mobile", "target"),
    };
  }, []);

  useFrame(() => {
    const current = progress.current;
    const nextIndex = journeyChapters.findIndex(
      (chapter) => chapter.progress >= current,
    );
    const upper =
      nextIndex === -1
        ? journeyChapters.length - 1
        : nextIndex === 0
          ? 1
          : nextIndex;
    const lower = Math.max(0, upper - 1);
    const previous = journeyChapters[lower];
    const next = journeyChapters[Math.min(upper, journeyChapters.length - 1)];
    const segment = Math.max(0.001, next.progress - previous.progress);
    const local =
      lower === 0
        ? ease(range(current, 0.08, 0.12))
        : ease(clamp((current - previous.progress) / segment));
    const curveProgress = clamp((lower + local) / (journeyChapters.length - 1));
    const mobile = size.width <= 700;
    const positionCurve = mobile ? curves.mobilePosition : curves.desktopPosition;
    const targetCurve = mobile ? curves.mobileTarget : curves.desktopTarget;
    const position = positionCurve.getPoint(curveProgress);
    const target = targetCurve.getPoint(curveProgress);
    const pointerStrength = current < 0.2 ? 0.055 : 0.09;
    position.x += pointer.current.x * pointerStrength;
    position.y -= pointer.current.y * pointerStrength * 0.6;
    camera.position.copy(position);
    camera.lookAt(target);
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

function ReadySignal({ onReady }: { onReady: () => void }) {
  const sent = useRef(false);

  useFrame(() => {
    if (sent.current) return;
    sent.current = true;
    onReady();
  });

  return null;
}

export function SpatialInvitation({
  onPending,
  onReady,
  onUnavailable,
  peopleCount,
  storyProgress,
}: {
  onPending: () => void;
  onReady: () => void;
  onUnavailable: () => void;
  peopleCount: number;
  storyProgress: readonly number[];
}) {
  const journey = useJourney();

  useLayoutEffect(() => onPending(), [onPending]);

  return (
    <Canvas
      aria-hidden="true"
      className="world-canvas"
      dpr={[1, 1.5]}
      frameloop="demand"
      camera={{ position: [0, 0, 8.8], fov: 32, near: 0.1, far: 180 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#100a14"]} />
      <fog attach="fog" args={["#100a14", 9, 52]} />
      <ambientLight intensity={0.72} color="#d4c1d4" />
      <directionalLight position={[5, 8, 7]} intensity={2.8} color="#ffe3c2" />
      <pointLight position={[4, -0.4, 3]} intensity={24} distance={12} color="#c9a565" />
      <Suspense fallback={null}>
        <LivingGarden
          peopleCount={peopleCount}
          progress={journey.progress}
          storyProgress={storyProgress}
        />
        <PaperEnvelope {...journey} />
        <InvitationThreshold progress={journey.progress} />
      </Suspense>
      <ContextGuard onUnavailable={onUnavailable} />
      <ReadySignal onReady={onReady} />
      <CameraRig {...journey} />
    </Canvas>
  );
}
