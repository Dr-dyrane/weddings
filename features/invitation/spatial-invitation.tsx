"use client";

import { RoundedBox } from "@react-three/drei";
import { Canvas, invalidate, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { CeremonyWorld } from "@/features/invitation/spatial-ceremony";
import { journeyChapters } from "@/features/invitation/journey";
import {
  createFlowerGeometry,
  createLeafGeometry,
  HairlineFrame,
  PaperMaterial,
  SealMark3D,
} from "@/features/invitation/spatial-craft";
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

type CameraMode = "desktop" | "mobile";
type CameraVector = "position" | "target";
type CameraTrackPoint = {
  progress: number;
  tangent: THREE.Vector3;
  value: THREE.Vector3;
};

const CAMERA_TENSION = 0.72;

function createCameraTrack(mode: CameraMode, key: CameraVector) {
  const points = journeyChapters.map((chapter) => ({
    progress: chapter.progress,
    value: new THREE.Vector3(...chapter.camera[mode][key]),
  }));

  return points.map((point, index): CameraTrackPoint => {
    const tangent = new THREE.Vector3();
    if (index > 0 && index < points.length - 1) {
      const previous = points[index - 1];
      const next = points[index + 1];
      tangent
        .copy(next.value)
        .sub(previous.value)
        .multiplyScalar(
          CAMERA_TENSION / Math.max(0.001, next.progress - previous.progress),
        );
    }
    return { ...point, tangent };
  });
}

function sampleCameraTrack(
  track: CameraTrackPoint[],
  progress: number,
  target: THREE.Vector3,
) {
  const first = track[0];
  const last = track.at(-1);
  if (!first || !last) return target.set(0, 0, 0);
  if (progress <= first.progress) return target.copy(first.value);
  if (progress >= last.progress) return target.copy(last.value);

  const upperIndex = track.findIndex((point) => point.progress >= progress);
  const lower = track[Math.max(0, upperIndex - 1)];
  const upper = track[upperIndex];
  const duration = Math.max(0.001, upper.progress - lower.progress);
  const time = clamp((progress - lower.progress) / duration);
  const timeSquared = time * time;
  const timeCubed = timeSquared * time;
  const startWeight = 2 * timeCubed - 3 * timeSquared + 1;
  const startTangentWeight = timeCubed - 2 * timeSquared + time;
  const endWeight = -2 * timeCubed + 3 * timeSquared;
  const endTangentWeight = timeCubed - timeSquared;

  return target
    .set(0, 0, 0)
    .addScaledVector(lower.value, startWeight)
    .addScaledVector(lower.tangent, startTangentWeight * duration)
    .addScaledVector(upper.value, endWeight)
    .addScaledVector(upper.tangent, endTangentWeight * duration);
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
      const point = scrollY + innerHeight * 0.5;
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
          const distance = Math.max(1, next.top - previous.top);
          const local = clamp((point - previous.top) / distance);
          nextProgress =
            previous.progress + (next.progress - previous.progress) * local;
        } else {
          const end = document.documentElement.scrollHeight - innerHeight * 0.5;
          const distance = Math.max(1, end - last.top);
          const local = clamp((point - last.top) / distance);
          nextProgress = last.progress + (1 - last.progress) * local;
        }
      }
      targetProgress.current = nextProgress;
      if (nextProgress > 0.08) targetPointer.current.set(0, 0);
      if (!initialized) {
        progress.current = nextProgress;
        initialized = true;
      }
      invalidate();
    };
    const refresh = () => {
      measure();
      update();
    };
    const move = (event: PointerEvent) => {
      if (targetProgress.current > 0.08) return;
      targetPointer.current.set(
        (event.clientX / innerWidth - 0.5) * 2,
        (event.clientY / innerHeight - 0.5) * 2,
      );
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

  return { pointer, preparing, progress, targetPointer, targetProgress };
}

function JourneySmoother({
  pointer: pointerRef,
  preparing,
  progress: progressRef,
  targetPointer: targetPointerRef,
  targetProgress: targetProgressRef,
}: JourneyState) {
  useFrame((_, delta) => {
    if (preparing.current) return;

    const nextProgress = THREE.MathUtils.damp(
      progressRef.current,
      targetProgressRef.current,
      14,
      delta,
    );
    const nextPointerX = THREE.MathUtils.damp(
      pointerRef.current.x,
      targetPointerRef.current.x,
      10,
      delta,
    );
    const nextPointerY = THREE.MathUtils.damp(
      pointerRef.current.y,
      targetPointerRef.current.y,
      10,
      delta,
    );
    const unsettled =
      Math.abs(targetProgressRef.current - nextProgress) > 0.00004 ||
      Math.abs(targetPointerRef.current.x - nextPointerX) > 0.0004 ||
      Math.abs(targetPointerRef.current.y - nextPointerY) > 0.0004;

    progressRef.current = unsettled ? nextProgress : targetProgressRef.current;
    pointerRef.current.set(
      unsettled ? nextPointerX : targetPointerRef.current.x,
      unsettled ? nextPointerY : targetPointerRef.current.y,
    );
    if (unsettled) invalidate();
  }, -100);

  return null;
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
    const mobile = size.width <= 850;
    const open = ease(range(current, 0.025, 0.075));
    const release = ease(range(current, 0.018, 0.028));
    const leave = ease(range(current, 0.048, 0.052));
    const baseScale = mobile ? 0.7 : 0.72;

    group.current.visible = leave < 0.999;

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
        <PaperMaterial color="#e8ddce" />
      </RoundedBox>
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
      <HairlineFrame
        color="#b58e53"
        height={2.67}
        opacity={0.68}
        position={[0, 0, 0.122]}
        width={4.12}
      />
      <group ref={seal} position={[0, 0.05, 0.32]}>
        <mesh>
          <circleGeometry args={[0.38, 48]} />
          <meshStandardMaterial color="#b58e53" metalness={0.42} roughness={0.52} />
        </mesh>
        <mesh position={[0, 0, 0.018]}>
          <ringGeometry args={[0.25, 0.275, 48]} />
          <meshStandardMaterial color="#d8b878" metalness={0.5} roughness={0.4} />
        </mesh>
        <SealMark3D />
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
    const mobile = size.width <= 850;
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

    group.current.visible = current < 0.235;

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
      <HairlineFrame
        height={9.46}
        opacity={0.88}
        position={[0, 0, 0.16]}
        width={15.88}
      />
      <RoundedBox args={[5.8, 7.2, 0.12]} radius={0.04} position={[-5, 0, -0.04]}>
        <PaperMaterial />
      </RoundedBox>
      <RoundedBox args={[5.8, 7.2, 0.12]} radius={0.04} position={[5, 0, -0.04]}>
        <PaperMaterial />
      </RoundedBox>
      <RoundedBox args={[4.25, 2.3, 0.12]} radius={0.04} position={[0, 3.55, -0.04]}>
        <PaperMaterial />
      </RoundedBox>
      <RoundedBox args={[4.25, 2.3, 0.12]} radius={0.04} position={[0, -3.55, -0.04]}>
        <PaperMaterial />
      </RoundedBox>
      <RoundedBox args={[0.48, 5.25, 0.18]} radius={0.035} position={[-2.1, 0, 0]}>
        <PaperMaterial />
      </RoundedBox>
      <RoundedBox args={[0.48, 5.25, 0.18]} radius={0.035} position={[2.1, 0, 0]}>
        <PaperMaterial />
      </RoundedBox>
      <RoundedBox args={[4.7, 0.48, 0.18]} radius={0.035} position={[0, 2.38, 0]}>
        <PaperMaterial />
      </RoundedBox>
      <RoundedBox args={[4.7, 0.48, 0.18]} radius={0.035} position={[0, -2.38, 0]}>
        <PaperMaterial />
      </RoundedBox>
      <group ref={leftDoor} position={[-0.93, 0, 0.035]}>
        <RoundedBox args={[1.86, 4.28, 0.13]} radius={0.025} smoothness={4}>
          <PaperMaterial />
        </RoundedBox>
        <mesh position={[0.91, 0, 0.08]}>
          <planeGeometry args={[0.045, 4.18]} />
          <meshBasicMaterial color="#c9a565" />
        </mesh>
      </group>
      <group ref={rightDoor} position={[0.93, 0, 0.035]}>
        <RoundedBox args={[1.86, 4.28, 0.13]} radius={0.025} smoothness={4}>
          <PaperMaterial />
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
  const flowerGeometry = useMemo(() => createFlowerGeometry(), []);
  const leafGeometry = useMemo(() => createLeafGeometry(), []);

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
      euler.set(
        Math.sin(index * 0.8) * 0.1,
        Math.cos(index * 1.1) * 0.16,
        side * (0.08 + (index % 4) * 0.08),
      );
      rotation.setFromEuler(euler);
      const size = 0.3 + (index % 5) * 0.075;
      scale.set(size * 0.78, size * 0.92, 1);
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

  useEffect(
    () => () => {
      flowerGeometry.dispose();
      leafGeometry.dispose();
    },
    [flowerGeometry, leafGeometry],
  );

  return (
    <group>
      <instancedMesh
        ref={foliage}
        args={[leafGeometry, undefined, 54]}
      >
        <meshStandardMaterial
          color="#ffffff"
          emissive="#19261f"
          emissiveIntensity={0.72}
          roughness={0.92}
          side={THREE.DoubleSide}
          vertexColors
        />
      </instancedMesh>
      <instancedMesh
        ref={ivory}
        args={[flowerGeometry, undefined, 54]}
      >
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.82}
          side={THREE.DoubleSide}
          vertexColors
        />
      </instancedMesh>
    </group>
  );
}

function LivingGarden({
  palette,
  peopleCount,
  progress,
  storyProgress,
  vendorCount,
}: Pick<JourneyState, "progress"> & {
  palette: readonly string[];
  peopleCount: number;
  storyProgress: readonly number[];
  vendorCount: number;
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
      <CeremonyWorld
        palette={palette}
        progress={progress}
        vendorCount={vendorCount}
      />
    </group>
  );
}

function CameraRig({ progress }: Pick<JourneyState, "progress">) {
  const { camera, size } = useThree();
  const tracks = useMemo(() => {
    return {
      desktopPosition: createCameraTrack("desktop", "position"),
      desktopTarget: createCameraTrack("desktop", "target"),
      mobilePosition: createCameraTrack("mobile", "position"),
      mobileTarget: createCameraTrack("mobile", "target"),
    };
  }, []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const current = progress.current;
    const mobile = size.width <= 850;
    sampleCameraTrack(
      mobile ? tracks.mobilePosition : tracks.desktopPosition,
      current,
      position,
    );
    sampleCameraTrack(
      mobile ? tracks.mobileTarget : tracks.desktopTarget,
      current,
      target,
    );
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

function ReadySignal({
  onReady,
  preparing,
  progress,
  targetProgress,
  warmupProgress,
}: Pick<JourneyState, "preparing" | "progress" | "targetProgress"> & {
  onReady: () => void;
  warmupProgress: readonly number[];
}) {
  const { advance, camera, gl, invalidate, scene } = useThree();
  const sent = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let idleCallback = 0;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    const prepare = () => {
      const originalVisibility = new Map<THREE.Object3D, boolean>();
      scene.traverse((object) => {
        originalVisibility.set(object, object.visible);
        if (!object.visible) {
          object.visible = true;
        }
      });

      const variantLights: THREE.Light[] = [];
      scene.traverse((object) => {
        if (!(object as THREE.Light).isLight) return;
        let ancestor: THREE.Object3D | null = object;
        while (ancestor) {
          if (originalVisibility.get(ancestor) === false) {
            variantLights.push(object as THREE.Light);
            return;
          }
          ancestor = ancestor.parent;
        }
      });

      const compilations: Promise<unknown>[] = [];
      const variantCount = 2 ** variantLights.length;
      for (let variant = 0; variant < variantCount; variant += 1) {
        variantLights.forEach((light, index) => {
          light.visible = (variant & (1 << index)) !== 0;
        });
        try {
          compilations.push(gl.compileAsync(scene, camera));
        } catch {
          gl.compile(scene, camera);
        }
      }

      originalVisibility.forEach((visible, object) => {
        object.visible = visible;
      });

      void Promise.allSettled(compilations).then(() => {
        if (cancelled || sent.current) return;

        const originalCulling = new Map<THREE.Object3D, boolean>();
        scene.traverse((object) => {
          originalVisibility.set(object, object.visible);
          object.visible = true;
          if ((object as THREE.Mesh).isMesh) {
            originalCulling.set(object, object.frustumCulled);
            object.frustumCulled = false;
          }
        });
        try {
          gl.render(scene, camera);
        } finally {
          originalVisibility.forEach((visible, object) => {
            object.visible = visible;
          });
          originalCulling.forEach((frustumCulled, object) => {
            object.frustumCulled = frustumCulled;
          });
        }

        const timestamp = performance.now();
        warmupProgress.forEach((warmProgress, index) => {
          progress.current = warmProgress;
          advance(timestamp + index * 16.7, true);
        });
        progress.current = targetProgress.current;
        advance(timestamp + warmupProgress.length * 16.7, true);
        preparing.current = false;
        sent.current = true;
        invalidate();
        onReady();
      });
    };

    if ("requestIdleCallback" in window) {
      idleCallback = window.requestIdleCallback(prepare, { timeout: 450 });
    } else {
      fallbackTimer = setTimeout(prepare, 0);
    }

    return () => {
      cancelled = true;
      if (idleCallback) window.cancelIdleCallback(idleCallback);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [
    advance,
    camera,
    gl,
    invalidate,
    onReady,
    preparing,
    progress,
    scene,
    targetProgress,
    warmupProgress,
  ]);

  return null;
}

export function SpatialInvitation({
  onPending,
  onReady,
  onUnavailable,
  palette,
  peopleCount,
  storyProgress,
  vendorCount,
}: {
  onPending: () => void;
  onReady: () => void;
  onUnavailable: () => void;
  palette: readonly string[];
  peopleCount: number;
  storyProgress: readonly number[];
  vendorCount: number;
}) {
  const journey = useJourney();
  const warmupProgress = useMemo(
    () =>
      Array.from(
        new Set([
          ...journeyChapters.map((chapter) => Math.min(1, chapter.progress + 0.012)),
          ...storyProgress.map((progress) => Math.min(0.5, progress + 0.012)),
          0.515,
          0.64,
          0.7,
          0.8,
          0.86,
          0.94,
        ]),
      ).sort((first, second) => first - second),
    [storyProgress],
  );

  useLayoutEffect(() => onPending(), [onPending]);

  return (
    <Canvas
      aria-hidden="true"
      className="world-canvas"
      dpr={[1, 1.25]}
      frameloop="demand"
      camera={{ position: [0, 0, 8.8], fov: 32, near: 0.1, far: 180 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#100a14"]} />
      <fog attach="fog" args={["#100a14", 9, 52]} />
      <ambientLight intensity={0.72} color="#d4c1d4" />
      <directionalLight position={[5, 8, 7]} intensity={2.8} color="#ffe3c2" />
      <pointLight position={[4, -0.4, 3]} intensity={24} distance={12} color="#c9a565" />
      <JourneySmoother {...journey} />
      <Suspense fallback={null}>
        <LivingGarden
          palette={palette}
          peopleCount={peopleCount}
          progress={journey.progress}
          storyProgress={storyProgress}
          vendorCount={vendorCount}
        />
        <PaperEnvelope {...journey} />
        <InvitationThreshold progress={journey.progress} />
      </Suspense>
      <ContextGuard onUnavailable={onUnavailable} />
      <ReadySignal
        onReady={onReady}
        preparing={journey.preparing}
        progress={journey.progress}
        targetProgress={journey.targetProgress}
        warmupProgress={warmupProgress}
      />
      <CameraRig progress={journey.progress} />
    </Canvas>
  );
}
