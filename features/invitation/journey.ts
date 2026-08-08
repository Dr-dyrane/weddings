export type JourneyChapterId =
  | "invitation"
  | "threshold"
  | "story"
  | "circle"
  | "pavilion"
  | "dress"
  | "vendors"
  | "rsvp";

export type CopySurface = "night" | "paper";
export type CopySide = "left" | "right" | "center";
export type VectorTuple = readonly [number, number, number];

export type JourneyChapter = {
  id: JourneyChapterId;
  progress: number;
  scene: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  copySide: CopySide;
  copySurface: CopySurface;
  camera: {
    desktop: { position: VectorTuple; target: VectorTuple };
    mobile: { position: VectorTuple; target: VectorTuple };
  };
};

export const journeyChapters = [
  {
    id: "invitation",
    progress: 0,
    scene: 1,
    copySide: "left",
    copySurface: "night",
    camera: {
      desktop: { position: [0, 0, 8.8], target: [1.8, -0.35, 0] },
      mobile: { position: [0, 0, 9.6], target: [0, -1.15, 0] },
    },
  },
  {
    id: "threshold",
    progress: 0.2,
    scene: 2,
    copySide: "left",
    copySurface: "night",
    camera: {
      desktop: { position: [0.45, 0.05, -4], target: [0, 0, -12] },
      mobile: { position: [0, 0.1, -3.2], target: [0, -0.2, -11] },
    },
  },
  {
    id: "story",
    progress: 0.31,
    scene: 3,
    copySide: "left",
    copySurface: "night",
    camera: {
      desktop: { position: [-1.35, 0.7, -7.8], target: [1.1, -0.6, -14.4] },
      mobile: { position: [0, 0.95, -7], target: [0, -0.7, -13.4] },
    },
  },
  {
    id: "circle",
    progress: 0.53,
    scene: 4,
    copySide: "right",
    copySurface: "night",
    camera: {
      desktop: { position: [1.4, 1, -18.2], target: [-1.2, -0.75, -25.8] },
      mobile: { position: [0, 1.25, -17.6], target: [0, -1.1, -25.2] },
    },
  },
  {
    id: "pavilion",
    progress: 0.64,
    scene: 5,
    copySide: "right",
    copySurface: "paper",
    camera: {
      desktop: { position: [0, 0.5, -26], target: [0, 0.15, -40.4] },
      mobile: { position: [0, 0.45, -25], target: [0, 0.75, -41.5] },
    },
  },
  {
    id: "dress",
    progress: 0.75,
    scene: 6,
    copySide: "left",
    copySurface: "night",
    camera: {
      desktop: { position: [-2, 0.35, -31], target: [1.45, -0.15, -42.7] },
      mobile: { position: [0, 0.3, -30], target: [0, 0.55, -43.3] },
    },
  },
  {
    id: "vendors",
    progress: 0.83,
    scene: 6,
    copySide: "center",
    copySurface: "paper",
    camera: {
      desktop: { position: [1.5, 0.25, -35], target: [0, 0.3, -45.4] },
      mobile: { position: [0, 0.2, -34], target: [0, 0.5, -45.2] },
    },
  },
  {
    id: "rsvp",
    progress: 0.91,
    scene: 7,
    copySide: "center",
    copySurface: "paper",
    camera: {
      desktop: { position: [0, 0.1, -40], target: [-1.65, -0.55, -47.8] },
      mobile: { position: [0, 0, -39], target: [0, -0.55, -47.8] },
    },
  },
] as const satisfies readonly JourneyChapter[];

export const journeyById = Object.fromEntries(
  journeyChapters.map((chapter) => [chapter.id, chapter]),
) as Record<JourneyChapterId, (typeof journeyChapters)[number]>;

export function milestoneProgress(index: number, total: number) {
  if (total <= 1) return journeyById.story.progress;
  const span = journeyById.circle.progress - journeyById.story.progress - 0.04;
  return journeyById.story.progress + (index / (total - 1)) * span;
}
