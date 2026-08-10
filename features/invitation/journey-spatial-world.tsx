"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
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

const PAVILION_TEXTURES = [
  "/journey/pavilion-depth-desktop.webp",
  "/journey/pavilion-depth-mobile.webp",
];

const STORY_TEXTURES = [
  "/concepts/scene-3-story-garden-desktop.webp",
  "/concepts/scene-3-story-garden-mobile.webp",
];

const PROPOSAL_TEXTURES = [
  "/concepts/scene-4-wedding-circle-desktop.webp",
  "/concepts/scene-4-wedding-circle-mobile.webp",
];

const DRESS_TEXTURES = [
  "/concepts/scene-6-dress-atmosphere-desktop.webp",
  "/concepts/scene-6-dress-atmosphere-mobile.webp",
];

const RSVP_TEXTURES = [
  "/concepts/scene-7-rsvp-desktop.webp",
  "/concepts/scene-7-rsvp-mobile.webp",
];

const PAVILION_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PAVILION_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uReveal;
  uniform vec2 uParallax;
  varying vec2 vUv;

  void main() {
    vec3 source = texture2D(uMap, vUv).rgb;
    float luminance = dot(source, vec3(0.299, 0.587, 0.114));
    float rightPlane = smoothstep(0.34, 1.0, vUv.x);
    float floorPlane = smoothstep(0.18, 1.0, 1.0 - vUv.y);
    float lightPlane = smoothstep(0.025, 0.55, luminance);
    float depth = clamp(
      rightPlane * 0.4 + floorPlane * 0.34 + lightPlane * 0.26,
      0.0,
      1.0
    );
    vec2 shiftedUv = clamp(
      vUv + uParallax * (depth - 0.24),
      vec2(0.002),
      vec2(0.998)
    );
    vec3 colour = texture2D(uMap, shiftedUv).rgb;
    float warmSignal = smoothstep(0.08, 0.56, colour.r - colour.b);
    float colourLuminance = dot(colour, vec3(0.299, 0.587, 0.114));
    vec3 signalYellow = vec3(1.0, 0.8235, 0.1176) * max(colourLuminance, 0.025);
    colour = mix(colour, signalYellow, warmSignal * 0.24);

    float reveal = 1.0 - smoothstep(uReveal - 0.055, uReveal + 0.08, vUv.x);
    gl_FragColor = vec4(colour, uOpacity * reveal);
    #include <colorspace_fragment>
  }
`;

const JOURNEY_PLATE_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uYellowMix;
  uniform vec2 uParallax;
  varying vec2 vUv;

  void main() {
    vec3 baseSample = texture2D(uMap, vUv).rgb;
    float sourceLuminance = dot(baseSample, vec3(0.299, 0.587, 0.114));
    float foreground = smoothstep(0.2, 0.94, 1.0 - vUv.y);
    float lightDepth = smoothstep(0.06, 0.82, sourceLuminance);
    float foregroundMask = smoothstep(
      0.58,
      0.94,
      foreground * 0.86 + lightDepth * 0.14
    );
    float middleMask =
      smoothstep(0.18, 0.62, foreground * 0.58 + lightDepth * 0.42) *
      (1.0 - foregroundMask);
    vec2 backgroundUv = clamp(
      vUv - uParallax * 0.18,
      vec2(0.002),
      vec2(0.998)
    );
    vec2 middleUv = clamp(
      vUv + uParallax * 0.3,
      vec2(0.002),
      vec2(0.998)
    );
    vec2 foregroundUv = clamp(
      vUv + uParallax * 0.86,
      vec2(0.002),
      vec2(0.998)
    );
    vec3 colourSample = texture2D(uMap, backgroundUv).rgb;
    colourSample = mix(
      colourSample,
      texture2D(uMap, middleUv).rgb,
      middleMask
    );
    colourSample = mix(
      colourSample,
      texture2D(uMap, foregroundUv).rgb,
      foregroundMask
    );
    float luminance = dot(colourSample, vec3(0.299, 0.587, 0.114));
    float ink = pow(smoothstep(0.025, 0.9, luminance), 1.18);
    vec3 colour = vec3(ink * 0.56);
    float paper = smoothstep(0.58, 0.94, luminance);
    colour = mix(colour, vec3(0.96), paper * 0.76);

    float warmth = smoothstep(0.025, 0.3, colourSample.r - colourSample.b);
    float signalBand =
      smoothstep(0.28, 0.68, luminance) *
      (1.0 - smoothstep(0.83, 0.98, luminance));
    float signal = warmth * signalBand * uYellowMix;
    colour = mix(colour, vec3(1.0, 0.8235, 0.1176), signal);

    float feather =
      smoothstep(0.0, 0.055, vUv.x) *
      smoothstep(0.0, 0.055, 1.0 - vUv.x) *
      smoothstep(0.0, 0.045, vUv.y) *
      smoothstep(0.0, 0.045, 1.0 - vUv.y);
    gl_FragColor = vec4(colour, uOpacity * feather);
    #include <colorspace_fragment>
  }
`;

const GOLDEN_THREAD_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GOLDEN_THREAD_FRAGMENT_SHADER = /* glsl */ `
  uniform float uOpacity;
  uniform float uReveal;
  uniform float uStart;
  uniform float uSpan;
  uniform float uTail;
  varying vec2 vUv;

  void main() {
    float positionOnThread = uStart + vUv.x * uSpan;
    float reveal = 1.0 - smoothstep(
      uReveal,
      uReveal + 0.045,
      positionOnThread
    );
    float tail = smoothstep(
      uTail - 0.045,
      uTail + 0.018,
      positionOnThread
    );
    float openingLight = exp(
      -pow((positionOnThread - 0.13) / 0.13, 2.0)
    );
    float pavilionLight = exp(
      -pow((positionOnThread - 0.59) / 0.12, 2.0)
    );
    float intensity = mix(
      0.36,
      1.0,
      max(openingLight, pavilionLight)
    );
    gl_FragColor = vec4(
      vec3(1.0, 0.8235, 0.1176),
      uOpacity * reveal * tail * intensity
    );
    #include <colorspace_fragment>
  }
`;

type JourneyMotion = {
  pointer: RefObject<THREE.Vector2>;
  progress: RefObject<number>;
  targetPointer: RefObject<THREE.Vector2>;
  targetProgress: RefObject<number>;
};

type WorldPoint = readonly [number, number, number];

const DESKTOP_WORLD_PATH: readonly WorldPoint[] = [
  [0, 0, 8],
  [0.15, 0.04, 6.2],
  [0.55, -0.1, 1.6],
  [1.7, 0.35, -5.2],
  [2.25, 0.05, -10.2],
  [1, -0.28, -15.2],
  [0.35, 0.12, -19.4],
  [0.18, 0.03, -22],
  [0.12, 0, -25.1],
  [0.85, -0.08, -29.6],
  [2, 0.1, -34],
  [0.8, -0.08, -38.8],
  [0, -0.25, -43],
] as const;

const MOBILE_WORLD_PATH: readonly WorldPoint[] = [
  [0, 0, 8],
  [0.05, 0.02, 6.2],
  [0.24, -0.05, 1.6],
  [0.72, 0.15, -5.2],
  [0.82, 0, -10.2],
  [0.38, -0.15, -15.2],
  [0.12, 0.05, -19.4],
  [0.06, 0.02, -22],
  [0.04, 0, -25.1],
  [0.36, -0.05, -29.6],
  [0.76, 0.07, -34],
  [0.32, -0.05, -38.8],
  [0, -0.15, -43],
] as const;

const DESKTOP_GOLDEN_THREAD_PATH: readonly WorldPoint[] = [
  [1.35, -0.35, 4],
  [1.5, -1.45, 2.2],
  [0.8, -2.4, -0.4],
  [-1.4, -2.8, -3.4],
  [-2.3, -2.8, -6.5],
  [-0.5, -3.2, -9.4],
  [1.6, -2.6, -12.4],
  [-1.8, -1.8, -16.5],
  [2.3, 0.4, -20.5],
  [3.1, -1, -24],
  [0.6, -1.7, -27.5],
  [-2.2, -2.5, -30.5],
  [-0.6, -3.2, -34],
  [3, -3.4, -37],
  [1.4, -3.4, -40],
  [-2.2, -2.8, -43],
  [0.5, -1.2, -46],
  [2.2, -0.5, -49],
] as const;

const MOBILE_GOLDEN_THREAD_PATH: readonly WorldPoint[] = [
  [0.3, -0.4, 4],
  [0.5, -1.45, 2],
  [0.35, -2.35, -0.8],
  [-0.35, -2.5, -4],
  [-0.55, -2.8, -7],
  [0.25, -3.1, -10],
  [-0.55, -2.4, -14],
  [0.8, -1.5, -18],
  [0.95, -0.9, -22],
  [0.2, -1.4, -26],
  [-0.75, -2.4, -30],
  [-0.2, -3.1, -34],
  [0.9, -3.3, -38],
  [0.4, -3.2, -41],
  [-0.65, -2.7, -44],
  [0.15, -1.1, -47],
] as const;

function createWorldCurve(points: readonly WorldPoint[]) {
  return new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "catmullrom",
    0.42,
  );
}

type GoldenThreadSegmentProps = {
  additive?: boolean;
  curve: THREE.CatmullRomCurve3;
  end: number;
  motion: JourneyMotion;
  opacity: number;
  radius: number;
  start: number;
};

function GoldenThreadSegment({
  additive = false,
  curve,
  end,
  motion,
  opacity: peakOpacity,
  radius,
  start,
}: GoldenThreadSegmentProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const segmentCurve = useMemo(() => {
    const points = Array.from({ length: 17 }, (_, index) =>
      curve.getPointAt(start + (end - start) * (index / 16)),
    );
    return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.42);
  }, [curve, end, start]);
  const uniforms = useMemo(
    () => ({
      uOpacity: { value: 0 },
      uReveal: { value: 0 },
      uSpan: { value: end - start },
      uStart: { value: start },
      uTail: { value: -0.08 },
    }),
    [end, start],
  );

  useFrame(() => {
    if (!material.current || !mesh.current) return;
    const value = clamp(motion.progress.current);
    const threadOpacity =
      range(value, -0.02, 0.015) * (1 - range(value, 0.84, 0.9));
    const reveal = clamp(value * 1.02 + 0.14);
    const tail = value * 1.02 - 0.04;
    mesh.current.visible =
      threadOpacity > 0.003 && reveal >= start - 0.05 && tail <= end + 0.05;
    material.current.uniforms.uOpacity.value = threadOpacity * peakOpacity;
    material.current.uniforms.uReveal.value = reveal;
    material.current.uniforms.uTail.value = tail;
  });

  return (
    <mesh ref={mesh}>
      <tubeGeometry args={[segmentCurve, 72, radius, 8, false]} />
      <shaderMaterial
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        depthWrite={false}
        fragmentShader={GOLDEN_THREAD_FRAGMENT_SHADER}
        ref={material}
        toneMapped={false}
        transparent
        uniforms={uniforms}
        vertexShader={GOLDEN_THREAD_VERTEX_SHADER}
      />
    </mesh>
  );
}

function GoldenThread({ motion }: { motion: JourneyMotion }) {
  const { size } = useThree();
  const mobile = size.width <= 700;
  const curve = useMemo(
    () =>
      createWorldCurve(
        mobile ? MOBILE_GOLDEN_THREAD_PATH : DESKTOP_GOLDEN_THREAD_PATH,
      ),
    [mobile],
  );

  return (
    <group>
      <GoldenThreadSegment
        curve={curve}
        end={0.22}
        motion={motion}
        opacity={0.52}
        radius={mobile ? 0.004 : 0.006}
        start={0}
      />
      <GoldenThreadSegment
        curve={curve}
        end={0.39}
        motion={motion}
        opacity={0.86}
        radius={mobile ? 0.009 : 0.014}
        start={0.18}
      />
      <GoldenThreadSegment
        additive
        curve={curve}
        end={0.39}
        motion={motion}
        opacity={0.07}
        radius={mobile ? 0.026 : 0.04}
        start={0.18}
      />
      <GoldenThreadSegment
        curve={curve}
        end={0.62}
        motion={motion}
        opacity={0.54}
        radius={mobile ? 0.005 : 0.008}
        start={0.35}
      />
      <GoldenThreadSegment
        curve={curve}
        end={0.75}
        motion={motion}
        opacity={0.92}
        radius={mobile ? 0.012 : 0.018}
        start={0.58}
      />
      <GoldenThreadSegment
        additive
        curve={curve}
        end={0.75}
        motion={motion}
        opacity={0.08}
        radius={mobile ? 0.035 : 0.052}
        start={0.58}
      />
      <GoldenThreadSegment
        curve={curve}
        end={1}
        motion={motion}
        opacity={0.48}
        radius={mobile ? 0.005 : 0.007}
        start={0.7}
      />
    </group>
  );
}

const OCCLUSION_LEAVES: ReadonlyArray<{
  position: WorldPoint;
  rotation: WorldPoint;
  scale: WorldPoint;
}> = [
  {
    position: [-0.42, 1.1, 0.08],
    rotation: [0.1, -0.45, -0.72],
    scale: [0.34, 0.82, 0.12],
  },
  {
    position: [0.35, 1.55, -0.04],
    rotation: [-0.2, 0.38, 0.64],
    scale: [0.3, 0.7, 0.1],
  },
  {
    position: [-0.7, 0.35, 0.14],
    rotation: [0.24, -0.3, -0.46],
    scale: [0.42, 0.96, 0.14],
  },
  {
    position: [0.58, 0.62, -0.08],
    rotation: [-0.16, 0.52, 0.52],
    scale: [0.36, 0.88, 0.12],
  },
  {
    position: [-0.46, -0.58, 0.06],
    rotation: [0.18, -0.5, -0.82],
    scale: [0.38, 0.9, 0.13],
  },
  {
    position: [0.62, -0.42, -0.1],
    rotation: [-0.2, 0.42, 0.76],
    scale: [0.32, 0.78, 0.11],
  },
] as const;

function FoliageOcclusionMaterial() {
  return (
    <meshStandardMaterial
      color="#161712"
      emissive="#3a3107"
      emissiveIntensity={0.08}
      metalness={0}
      opacity={0}
      roughness={0.98}
      transparent
    />
  );
}

function FabricOcclusionMaterial({ colour }: { colour: string }) {
  return (
    <meshStandardMaterial
      color={colour}
      emissive="#2b2405"
      emissiveIntensity={0.08}
      metalness={0.015}
      opacity={0}
      roughness={0.96}
      side={THREE.DoubleSide}
      transparent
    />
  );
}

function FoliageOccluder() {
  return (
    <>
      <mesh position={[0, 0.12, 0]} rotation={[0, 0, -0.18]}>
        <cylinderGeometry args={[0.035, 0.065, 4.2, 7]} />
        <FoliageOcclusionMaterial />
      </mesh>
      <mesh position={[-0.2, 0.45, 0.02]} rotation={[0, 0, 0.36]}>
        <cylinderGeometry args={[0.022, 0.045, 2.7, 7]} />
        <FoliageOcclusionMaterial />
      </mesh>
      {OCCLUSION_LEAVES.map((leaf, index) => (
        <mesh
          key={index}
          position={leaf.position as [number, number, number]}
          rotation={leaf.rotation as [number, number, number]}
          scale={leaf.scale as [number, number, number]}
        >
          <sphereGeometry args={[0.72, 9, 7]} />
          <FoliageOcclusionMaterial />
        </mesh>
      ))}
    </>
  );
}

function ForegroundOcclusionGates({ motion }: { motion: JourneyMotion }) {
  const { size } = useThree();
  const storyGate = useRef<THREE.Group>(null);
  const proposalGate = useRef<THREE.Group>(null);
  const fabricGate = useRef<THREE.Group>(null);
  const storyLight = useRef<THREE.PointLight>(null);
  const proposalLight = useRef<THREE.PointLight>(null);
  const fabricLight = useRef<THREE.PointLight>(null);
  const fabricShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.28, -4.3);
    shape.bezierCurveTo(-1.05, -2.4, -0.38, -0.25, -0.9, 2.25);
    shape.bezierCurveTo(-1.05, 3.1, -0.62, 4.15, -0.42, 4.45);
    shape.lineTo(0.72, 4.45);
    shape.bezierCurveTo(0.34, 2.75, 1.02, 0.8, 0.48, -1.25);
    shape.bezierCurveTo(0.16, -2.65, 0.58, -3.72, 0.48, -4.3);
    shape.closePath();
    return shape;
  }, []);

  useFrame((_, delta) => {
    if (
      !storyGate.current ||
      !proposalGate.current ||
      !fabricGate.current ||
      !storyLight.current ||
      !proposalLight.current ||
      !fabricLight.current
    ) {
      return;
    }
    const value = clamp(motion.progress.current);
    const mobile = size.width <= 700;
    const storyOpacity = windowOpacity(value, 0.14, 0.2, 0.33, 0.4);
    const proposalOpacity = windowOpacity(value, 0.29, 0.35, 0.46, 0.53);
    const fabricOpacity = windowOpacity(value, 0.64, 0.7, 0.84, 0.91);
    const storyLocal = range(value, 0.14, 0.4);
    const proposalLocal = range(value, 0.29, 0.53);
    const fabricLocal = range(value, 0.64, 0.91);

    storyGate.current.visible = storyOpacity > 0.004;
    proposalGate.current.visible = proposalOpacity > 0.004;
    fabricGate.current.visible = fabricOpacity > 0.004;

    storyGate.current.position.x = THREE.MathUtils.damp(
      storyGate.current.position.x,
      (mobile ? 1.16 : 2.7) +
        motion.pointer.current.x * (mobile ? 0.1 : 0.22) +
        (storyLocal - 0.5) * (mobile ? 0.72 : 1.2),
      5.2,
      delta,
    );
    storyGate.current.rotation.z = THREE.MathUtils.damp(
      storyGate.current.rotation.z,
      -0.22 + (storyLocal - 0.5) * 0.24,
      4.6,
      delta,
    );
    proposalGate.current.position.x = THREE.MathUtils.damp(
      proposalGate.current.position.x,
      (mobile ? -1.05 : -1.68) -
        motion.pointer.current.x * (mobile ? 0.09 : 0.2) -
        (proposalLocal - 0.5) * (mobile ? 0.66 : 1.08),
      5,
      delta,
    );
    proposalGate.current.rotation.z = THREE.MathUtils.damp(
      proposalGate.current.rotation.z,
      0.28 - (proposalLocal - 0.5) * 0.22,
      4.4,
      delta,
    );
    fabricGate.current.position.x = THREE.MathUtils.damp(
      fabricGate.current.position.x,
      (mobile ? 1.18 : 2.42) +
        motion.pointer.current.x * (mobile ? 0.08 : 0.18) +
        (fabricLocal - 0.5) * (mobile ? 0.78 : 1.32),
      4.8,
      delta,
    );
    fabricGate.current.rotation.y = THREE.MathUtils.damp(
      fabricGate.current.rotation.y,
      -0.38 + (fabricLocal - 0.5) * 0.24,
      4.2,
      delta,
    );

    storyGate.current.traverse((object) => {
      if (
        object instanceof THREE.Mesh &&
        object.material instanceof THREE.MeshStandardMaterial
      ) {
        object.material.opacity = storyOpacity * (mobile ? 0.64 : 0.86);
        object.material.emissiveIntensity = 0.08 + storyOpacity * 0.22;
      }
    });
    proposalGate.current.traverse((object) => {
      if (
        object instanceof THREE.Mesh &&
        object.material instanceof THREE.MeshStandardMaterial
      ) {
        object.material.opacity = proposalOpacity * (mobile ? 0.6 : 0.82);
        object.material.emissiveIntensity = 0.08 + proposalOpacity * 0.2;
      }
    });
    fabricGate.current.traverse((object) => {
      if (
        object instanceof THREE.Mesh &&
        object.material instanceof THREE.MeshStandardMaterial
      ) {
        object.material.opacity = fabricOpacity * (mobile ? 0.68 : 0.88);
        object.material.emissiveIntensity = 0.08 + fabricOpacity * 0.2;
      }
    });
    storyLight.current.intensity = storyOpacity * (mobile ? 3.2 : 6.4);
    proposalLight.current.intensity = proposalOpacity * (mobile ? 3 : 5.8);
    fabricLight.current.intensity = fabricOpacity * (mobile ? 4 : 7.2);
  });

  return (
    <>
      <group
        position={[3.25, -0.2, -9.6]}
        ref={storyGate}
        scale={size.width <= 700 ? 0.78 : 1.25}
      >
        <FoliageOccluder />
        <pointLight
          color="#ffd21e"
          decay={2}
          distance={5.5}
          intensity={0}
          position={[-1.1, 0.1, 1.25]}
          ref={storyLight}
        />
      </group>
      <group
        position={[-1.95, 0.2, -17]}
        ref={proposalGate}
        scale={size.width <= 700 ? 0.74 : 1.08}
      >
        <FoliageOccluder />
        <pointLight
          color="#ffd21e"
          decay={2}
          distance={5}
          intensity={0}
          position={[1, -0.2, 1.1]}
          ref={proposalLight}
        />
      </group>
      <group
        position={[3, -0.15, -35.2]}
        ref={fabricGate}
        rotation={[0.03, -0.38, -0.04]}
        scale={size.width <= 700 ? 0.78 : 1.15}
      >
        <mesh position={[0, 0, 0.08]}>
          <shapeGeometry args={[fabricShape, 18]} />
          <FabricOcclusionMaterial colour="#4b214f" />
        </mesh>
        <mesh position={[0.62, 0.2, -0.38]} scale={[0.72, 0.92, 1]}>
          <shapeGeometry args={[fabricShape, 18]} />
          <FabricOcclusionMaterial colour="#1f0e20" />
        </mesh>
        <pointLight
          color="#ffd21e"
          decay={2}
          distance={7}
          intensity={0}
          position={[-1.45, 0.6, 1.6]}
          ref={fabricLight}
        />
      </group>
    </>
  );
}

type JourneyDepthPlateProps = {
  desktopPosition: WorldPoint;
  desktopSize: readonly [number, number];
  enter: readonly [number, number];
  leave: readonly [number, number];
  mobileOpacity: number;
  mobilePosition: WorldPoint;
  mobileSize: readonly [number, number];
  motion: JourneyMotion;
  opacity: number;
  parallax: number;
  textures: string[];
  yellowMix: number;
};

function JourneyDepthPlate({
  desktopPosition,
  desktopSize,
  enter,
  leave,
  mobileOpacity,
  mobilePosition,
  mobileSize,
  motion,
  opacity: peakOpacity,
  parallax,
  textures,
  yellowMix,
}: JourneyDepthPlateProps) {
  const { gl, size } = useThree();
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const [desktopTexture, mobileTexture] = useLoader(
    THREE.TextureLoader,
    textures,
  );
  const uniforms = useMemo(
    () => ({
      uMap: { value: desktopTexture },
      uOpacity: { value: 0 },
      uParallax: { value: new THREE.Vector2() },
      uYellowMix: { value: yellowMix },
    }),
    [desktopTexture, yellowMix],
  );

  useEffect(() => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    [desktopTexture, mobileTexture].forEach((texture) => {
      texture.anisotropy = anisotropy;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    });
  }, [desktopTexture, gl, mobileTexture]);

  useFrame(() => {
    if (!group.current || !material.current) return;
    const value = motion.progress.current;
    const plateOpacity = windowOpacity(
      value,
      enter[0],
      enter[1],
      leave[0],
      leave[1],
    );
    const local = range(value, enter[0], leave[1]);
    const mobile = size.width <= 700;
    const position = mobile ? mobilePosition : desktopPosition;
    group.current.visible = plateOpacity > 0.004;
    group.current.position.set(position[0], position[1], position[2]);
    group.current.rotation.set(0, 0, 0);
    material.current.uniforms.uMap.value = mobile
      ? mobileTexture
      : desktopTexture;
    material.current.uniforms.uOpacity.value =
      plateOpacity * (mobile ? mobileOpacity : peakOpacity);
    material.current.uniforms.uParallax.value.set(
      motion.pointer.current.x * parallax + (local - 0.5) * parallax * 0.72,
      -motion.pointer.current.y * parallax * 0.62,
    );
  });

  const mobile = size.width <= 700;

  return (
    <group ref={group} position={desktopPosition as [number, number, number]}>
      <mesh>
        <planeGeometry args={mobile ? mobileSize : desktopSize} />
        <shaderMaterial
          depthWrite={false}
          fragmentShader={JOURNEY_PLATE_FRAGMENT_SHADER}
          ref={material}
          transparent
          uniforms={uniforms}
          vertexShader={PAVILION_VERTEX_SHADER}
        />
      </mesh>
    </group>
  );
}

function PavilionStoneMaterial() {
  return (
    <meshStandardMaterial
      color="#151515"
      emissive="#2a2107"
      emissiveIntensity={0.035}
      metalness={0.04}
      opacity={0}
      roughness={0.92}
      transparent
    />
  );
}

function PavilionSignalMaterial() {
  return (
    <meshBasicMaterial
      color="#ffd21e"
      opacity={0}
      toneMapped={false}
      transparent
    />
  );
}

function PavilionDepthScene({ motion }: { motion: JourneyMotion }) {
  const { gl, size } = useThree();
  const group = useRef<THREE.Group>(null);
  const threshold = useRef<THREE.Group>(null);
  const thresholdLight = useRef<THREE.PointLight>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const [desktopTexture, mobileTexture] = useLoader(
    THREE.TextureLoader,
    PAVILION_TEXTURES,
  );
  const uniforms = useMemo(
    () => ({
      uMap: { value: desktopTexture },
      uOpacity: { value: 0 },
      uParallax: { value: new THREE.Vector2() },
      uReveal: { value: -0.15 },
    }),
    [desktopTexture],
  );

  useEffect(() => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    [desktopTexture, mobileTexture].forEach((texture) => {
      texture.anisotropy = anisotropy;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    });
  }, [desktopTexture, gl, mobileTexture]);

  useFrame(() => {
    if (
      !group.current ||
      !material.current ||
      !threshold.current ||
      !thresholdLight.current
    ) {
      return;
    }
    const plateOpacity = windowOpacity(
      motion.progress.current,
      0.405,
      0.485,
      0.55,
      0.62,
    );
    const thresholdOpacity = windowOpacity(
      motion.progress.current,
      0.49,
      0.55,
      0.68,
      0.75,
    );
    const local = range(motion.progress.current, 0.43, 0.7);
    const reveal = range(motion.progress.current, 0.42, 0.51);
    const mobile = size.width <= 700;
    group.current.visible = plateOpacity > 0.004;
    group.current.rotation.set(0, 0, 0);
    threshold.current.visible = thresholdOpacity > 0.004;

    material.current.uniforms.uMap.value = mobile
      ? mobileTexture
      : desktopTexture;
    material.current.uniforms.uOpacity.value =
      plateOpacity * (mobile ? 0.72 : 0.96);
    material.current.uniforms.uReveal.value = -0.15 + reveal * 1.3;
    material.current.uniforms.uParallax.value.set(
      motion.pointer.current.x * (mobile ? 0.002 : 0.004) +
        (local - 0.5) * (mobile ? 0.0015 : 0.003),
      -motion.pointer.current.y * (mobile ? 0.0015 : 0.003),
    );
    threshold.current.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || Array.isArray(object.material)) {
        return;
      }
      if (object.material instanceof THREE.MeshBasicMaterial) {
        object.material.opacity =
          thresholdOpacity * (mobile ? 0.24 : 0.32);
      } else if (object.material instanceof THREE.MeshStandardMaterial) {
        object.material.opacity =
          thresholdOpacity * (mobile ? 0.3 : 0.4);
      }
    });
    thresholdLight.current.intensity =
      thresholdOpacity * (mobile ? 3.5 : 5.5);
  });

  const mobile = size.width <= 700;
  const jambX = mobile ? 1.65 : 4.25;
  const jambWidth = mobile ? 0.32 : 0.72;
  const thresholdHeight = mobile ? 5.5 : 6.2;

  return (
    <>
      <group ref={group} position={[0.12, -0.08, -24.8]}>
        <mesh>
          <planeGeometry
            args={mobile ? [4.5, 6.75, 1, 1] : [12.6, 8.4, 1, 1]}
          />
          <shaderMaterial
            depthWrite={false}
            fragmentShader={PAVILION_FRAGMENT_SHADER}
            ref={material}
            transparent
            uniforms={uniforms}
            vertexShader={PAVILION_VERTEX_SHADER}
          />
        </mesh>
      </group>
      <group ref={threshold} position={[0.12, -0.08, -23.55]}>
        <mesh position={[jambX, 0, 0]}>
          <boxGeometry args={[jambWidth, thresholdHeight, 1.3]} />
          <PavilionStoneMaterial />
        </mesh>
        <mesh
          position={[mobile ? 0.72 : 2.05, thresholdHeight / 2 - 0.2, 0]}
        >
          <boxGeometry args={[mobile ? 2.25 : 5.1, 0.4, 1.3]} />
          <PavilionStoneMaterial />
        </mesh>
        <mesh
          position={[mobile ? 0.2 : 1.2, -thresholdHeight / 2, -0.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[mobile ? 4.5 : 8, 10]} />
          <PavilionStoneMaterial />
        </mesh>
        <mesh position={[jambX - jambWidth / 2 - 0.025, 0, 0.66]}>
          <boxGeometry args={[0.035, thresholdHeight - 0.55, 0.025]} />
          <PavilionSignalMaterial />
        </mesh>
        <pointLight
          color="#ffd21e"
          decay={2}
          distance={9}
          intensity={0}
          position={[jambX - 1.1, 0.55, 1.4]}
          ref={thresholdLight}
        />
      </group>
    </>
  );
}

function SpatialJourney() {
  const { camera, invalidate, size } = useThree();
  const pointer = useRef(new THREE.Vector2());
  const progress = useRef(0);
  const progressVelocity = useRef(0);
  const targetPointer = useRef(new THREE.Vector2());
  const targetProgress = useRef(0);
  const cameraBank = useRef(0);
  const mobile = size.width <= 700;
  const worldCurve = useMemo(
    () => createWorldCurve(mobile ? MOBILE_WORLD_PATH : DESKTOP_WORLD_PATH),
    [mobile],
  );
  const cameraPosition = useMemo(() => new THREE.Vector3(), []);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const tangentBefore = useMemo(() => new THREE.Vector3(), []);
  const tangentAfter = useMemo(() => new THREE.Vector3(), []);
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
    const step = Math.min(delta, 1 / 30);
    const displacement = targetProgress.current - progress.current;
    progressVelocity.current +=
      (displacement * 38 - progressVelocity.current * 12) * step;
    progress.current += progressVelocity.current * step;
    if (
      Math.abs(displacement) < 0.00001 &&
      Math.abs(progressVelocity.current) < 0.0001
    ) {
      progress.current = targetProgress.current;
      progressVelocity.current = 0;
    }
    if (progress.current <= 0 && progressVelocity.current < 0) {
      progress.current = 0;
      progressVelocity.current = 0;
    } else if (progress.current >= 1 && progressVelocity.current > 0) {
      progress.current = 1;
      progressVelocity.current = 0;
    }
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

    const travel = clamp(progress.current);
    const pavilionAlignment = windowOpacity(travel, 0.38, 0.45, 0.67, 0.74);
    const travelEnergy = clamp(Math.abs(progressVelocity.current) * 0.42);
    const lookAhead = Math.min(
      1,
      travel +
        (mobile ? 0.03 : 0.046) +
        travelEnergy * (mobile ? 0.01 : 0.018),
    );
    worldCurve.getPointAt(travel, cameraPosition);
    worldCurve.getPointAt(lookAhead, cameraTarget);
    worldCurve.getTangentAt(Math.max(0, travel - 0.018), tangentBefore);
    worldCurve.getTangentAt(Math.min(1, travel + 0.018), tangentAfter);
    const bankTarget =
      clamp(
        (tangentAfter.x - tangentBefore.x) * (mobile ? -0.3 : -0.72),
        mobile ? -0.038 : -0.085,
        mobile ? 0.038 : 0.085,
      ) *
      (1 - pavilionAlignment) *
      (0.72 + travelEnergy * 0.28);
    cameraBank.current = THREE.MathUtils.damp(
      cameraBank.current,
      bankTarget,
      4.5,
      delta,
    );
    camera.position.set(
      cameraPosition.x +
        pointer.current.x *
          (mobile ? 0.03 : 0.12) *
          (1 - pavilionAlignment * 0.9),
      cameraPosition.y -
        pointer.current.y *
          (mobile ? 0.02 : 0.075) *
          (1 - pavilionAlignment * 0.9),
      cameraPosition.z,
    );
    camera.lookAt(cameraTarget);
    camera.rotateZ(cameraBank.current);

    if (
      Math.abs(progress.current - targetProgress.current) > 0.0002 ||
      Math.abs(progressVelocity.current) > 0.0001 ||
      pointer.current.distanceTo(targetPointer.current) > 0.001
    ) {
      invalidate();
    }
  }, -100);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight color="#ffd21e" intensity={7} position={[3, 2, 4]} />
      <GoldenThread motion={motion} />
      <ForegroundOcclusionGates motion={motion} />
      <JourneyDepthPlate
        desktopPosition={[2.35, -0.55, -7.5]}
        desktopSize={[8.5, 5.67]}
        enter={[0.17, 0.23]}
        leave={[0.31, 0.37]}
        mobileOpacity={0.5}
        mobilePosition={[0.05, -0.75, -7.5]}
        mobileSize={[4.2, 8.4]}
        motion={motion}
        opacity={0.62}
        parallax={0.012}
        textures={STORY_TEXTURES}
        yellowMix={0.42}
      />
      <JourneyDepthPlate
        desktopPosition={[-1.35, -0.45, -16]}
        desktopSize={[8.5, 5.67]}
        enter={[0.31, 0.38]}
        leave={[0.45, 0.51]}
        mobileOpacity={0.48}
        mobilePosition={[0, -0.55, -16]}
        mobileSize={[4.2, 6.3]}
        motion={motion}
        opacity={0.58}
        parallax={0.01}
        textures={PROPOSAL_TEXTURES}
        yellowMix={0.36}
      />
      <PavilionDepthScene motion={motion} />
      <JourneyDepthPlate
        desktopPosition={[2.1, -0.3, -36.5]}
        desktopSize={[8.8, 5.87]}
        enter={[0.67, 0.74]}
        leave={[0.87, 0.93]}
        mobileOpacity={0.46}
        mobilePosition={[0, -0.45, -36.5]}
        mobileSize={[4.2, 7.46]}
        motion={motion}
        opacity={0.6}
        parallax={0.009}
        textures={DRESS_TEXTURES}
        yellowMix={0.32}
      />
      <JourneyDepthPlate
        desktopPosition={[4.4, -0.3, -48]}
        desktopSize={[9.8, 6.53]}
        enter={[0.87, 0.94]}
        leave={[1.08, 1.12]}
        mobileOpacity={0.34}
        mobilePosition={[1.45, -0.2, -48]}
        mobileSize={[4.4, 7.82]}
        motion={motion}
        opacity={0.46}
        parallax={0.007}
        textures={RSVP_TEXTURES}
        yellowMix={0.36}
      />
    </>
  );
}

export function JourneySpatialWorld({
  onUnavailable,
}: {
  onUnavailable: () => void;
}) {
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
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            onUnavailable();
          },
          { once: true },
        );
        gl.domElement.dataset.contextLossReady = "true";
      }}
    >
      <Suspense fallback={null}>
        <SpatialJourney />
      </Suspense>
    </Canvas>
  );
}
