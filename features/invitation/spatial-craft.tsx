"use client";

import { useMemo } from "react";
import * as THREE from "three";

const PAPER_GRAIN_SIZE = 64;

function createPaperGrain() {
  const data = new Uint8Array(PAPER_GRAIN_SIZE * PAPER_GRAIN_SIZE * 4);
  let seed = 0x4f475241;

  for (let index = 0; index < data.length; index += 4) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    const noise = 112 + (Math.abs(seed) % 96);
    data[index] = noise;
    data[index + 1] = noise;
    data[index + 2] = noise;
    data[index + 3] = 255;
  }

  const texture = new THREE.DataTexture(
    data,
    PAPER_GRAIN_SIZE,
    PAPER_GRAIN_SIZE,
    THREE.RGBAFormat,
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}

const paperGrain = createPaperGrain();

export function PaperMaterial({
  color = "#f4ede3",
  opacity = 1,
  side = THREE.FrontSide,
}: {
  color?: THREE.ColorRepresentation;
  opacity?: number;
  side?: THREE.Side;
}) {
  return (
    <meshStandardMaterial
      bumpMap={paperGrain}
      bumpScale={0.012}
      color={color}
      opacity={opacity}
      roughness={0.88}
      roughnessMap={paperGrain}
      side={side}
      transparent={opacity < 1}
    />
  );
}

export function FoilMaterial({ color = "#c9a565" }: { color?: string }) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0.58}
      roughness={0.38}
    />
  );
}

class InfinitySealCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

  override getPoint(t: number, target = new THREE.Vector3()) {
    // Start at the outer edge, not the crossing, so the closed tube has no
    // visible join or heavy centre knot.
    const angle = t * Math.PI * 2 - Math.PI / 2;
    return target.set(
      Math.sin(angle) * 0.31,
      Math.sin(angle * 2) * 0.16,
      0,
    );
  }
}

export function SealMark3D() {
  const curve = useMemo(() => new InfinitySealCurve(), []);

  return (
    <group position={[0, 0, 0.028]}>
      <mesh>
        <tubeGeometry args={[curve, 128, 0.0125, 12, true]} />
        <meshStandardMaterial
          color="#6f4b25"
          metalness={0.34}
          roughness={0.48}
        />
      </mesh>
    </group>
  );
}

export function createLeafGeometry() {
  const leaf = (
    x: number,
    y: number,
    scale: number,
    rotation: number,
  ) => {
    const shape = new THREE.Shape();
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    const point = (localX: number, localY: number) => ({
      x: x + (localX * cosine - localY * sine) * scale,
      y: y + (localX * sine + localY * cosine) * scale,
    });
    const start = point(0, -1);
    const first = point(0.62, -0.5);
    const second = point(0.72, 0.38);
    const tip = point(0, 1);
    const third = point(-0.72, 0.38);
    const fourth = point(-0.62, -0.5);

    shape.moveTo(start.x, start.y);
    shape.bezierCurveTo(first.x, first.y, second.x, second.y, tip.x, tip.y);
    shape.bezierCurveTo(third.x, third.y, fourth.x, fourth.y, start.x, start.y);
    return shape;
  };

  return new THREE.ShapeGeometry(
    [
      leaf(0, 0.18, 0.82, 0.02),
      leaf(-0.46, -0.18, 0.66, -0.72),
      leaf(0.44, -0.2, 0.62, 0.76),
      leaf(-0.28, 0.38, 0.48, -0.42),
    ],
    5,
  );
}

export function createFlowerGeometry() {
  const shape = new THREE.Shape();
  const points = 50;

  for (let index = 0; index <= points; index += 1) {
    const angle = (index / points) * Math.PI * 2;
    const radius = 0.68 + Math.cos(angle * 5) * 0.28;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape, 3);
}

export function createIrregularDiscGeometry(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  seed: number,
) {
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    52,
    1,
    false,
  );
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    const angle = Math.atan2(z, x);
    const irregularity =
      1 +
      Math.sin(angle * 5 + seed) * 0.018 +
      Math.sin(angle * 11 - seed * 0.7) * 0.009;
    positions.setXYZ(index, x * irregularity, positions.getY(index), z * irregularity);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export function createFabricPanelGeometry(
  width: number,
  height: number,
  phase: number,
) {
  const columns = 8;
  const rows = 18;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;
      const widthScale =
        1 - Math.sin(v * Math.PI) * 0.1 + Math.sin(v * Math.PI * 2 + phase) * 0.025;
      const sway =
        (Math.sin(v * Math.PI * 1.35 + phase) - Math.sin(phase)) *
        width *
        0.055;
      const x = (u - 0.5) * width * widthScale + sway;
      const baseY = (0.5 - v) * height;
      const hemProgress = THREE.MathUtils.smoothstep(v, 0.8, 1);
      const hem =
        hemProgress *
        (Math.sin(u * Math.PI * 2.5 + phase) * 0.11 +
          Math.cos(u * Math.PI * 5 - phase) * 0.045);
      const z =
        Math.sin(u * Math.PI * 4 + phase) *
          (0.045 + Math.sin(v * Math.PI) * 0.085) +
        Math.sin(v * Math.PI * 2 + phase) * 0.024;
      positions.push(x, baseY + hem, z);
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cursor = row * (columns + 1) + column;
      indices.push(
        cursor,
        cursor + columns + 1,
        cursor + 1,
        cursor + 1,
        cursor + columns + 1,
        cursor + columns + 2,
      );
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

export function createCanopyGeometry(width: number, length: number, phase: number) {
  const columns = 6;
  const rows = 24;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;
      const x = (u - 0.5) * width;
      const z = (v - 0.5) * length;
      const edgeLift = Math.pow(Math.abs(u - 0.5) * 2, 1.7) * 0.09;
      const y =
        -0.12 +
        edgeLift +
        Math.sin(v * Math.PI * 3 + phase) * 0.025 +
        Math.sin(u * Math.PI * 2 + phase) * 0.018;
      positions.push(x, y, z);
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cursor = row * (columns + 1) + column;
      indices.push(
        cursor,
        cursor + columns + 1,
        cursor + 1,
        cursor + 1,
        cursor + columns + 1,
        cursor + columns + 2,
      );
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
