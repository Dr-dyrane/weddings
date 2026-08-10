import { expect, type Page, test } from "@playwright/test";

const invitationPath = "/the_ogranyas";

type HorizontalAudit = {
  bodyScrollWidth: number;
  documentScrollWidth: number;
  overflow: Array<{
    left: number;
    right: number;
    selector: string;
    width: number;
  }>;
  viewportWidth: number;
};

async function auditHorizontalReflow(
  page: Page,
  selectors: string[],
): Promise<HorizontalAudit> {
  return page.evaluate((auditedSelectors) => {
    const viewportWidth = document.documentElement.clientWidth;
    const overflow = auditedSelectors.flatMap((selector) =>
      Array.from(document.querySelectorAll<HTMLElement>(selector)).flatMap(
        (element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 &&
            (rect.left < -1 || rect.right > viewportWidth + 1)
            ? [
                {
                  left: Number(rect.left.toFixed(2)),
                  right: Number(rect.right.toFixed(2)),
                  selector,
                  width: Number(rect.width.toFixed(2)),
                },
              ]
            : [];
        },
      ),
    );

    return {
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      overflow,
      viewportWidth,
    };
  }, selectors);
}

test("320px and 200%-equivalent reflow preserve the complete semantic journey", async ({
  page,
}, testInfo) => {
  const evidence: Record<string, unknown> = {};

  for (const width of [320, 640]) {
    await test.step(`${width}px CSS viewport`, async () => {
      await page.setViewportSize({ height: 800, width });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(invitationPath);
      await page.getByRole("button", { name: "Open invitation" }).click();

      const chapters = [
        { anchor: "#welcome-copy", audit: ["#welcome-copy", "#welcome-copy h2"] },
        {
          anchor: "#story",
          audit: ["#story .journey-chapter-copy", "#story h2"],
        },
        {
          anchor: ".journey-story-2",
          audit: [
            ".journey-story-2 .journey-chapter-copy",
            ".journey-story-2 h2",
          ],
        },
        {
          anchor: "#details",
          audit: [
            "#details .journey-chapter-copy",
            "#details h2",
            "#details article",
            "#details .journey-actions",
          ],
        },
        {
          anchor: ".journey-dress",
          audit: [
            ".journey-dress .journey-chapter-copy",
            ".journey-dress h2",
            ".journey-palette",
          ],
        },
        {
          anchor: "#rsvp",
          audit: [
            "#rsvp .journey-chapter-copy",
            "#rsvp h2",
            ".journey-rsvp-choices",
            "#rsvp footer",
          ],
        },
      ];

      const chapterEvidence: Array<
        HorizontalAudit & { anchor: string }
      > = [];
      for (const chapter of chapters) {
        await page.locator(chapter.anchor).scrollIntoViewIfNeeded();
        await expect(page.locator(chapter.anchor)).toBeVisible();
        const audit = await auditHorizontalReflow(page, chapter.audit);
        expect(audit.documentScrollWidth).toBeLessThanOrEqual(
          audit.viewportWidth + 1,
        );
        expect(audit.bodyScrollWidth).toBeLessThanOrEqual(audit.viewportWidth + 1);
        expect(audit.overflow).toEqual([]);
        chapterEvidence.push({ anchor: chapter.anchor, ...audit });

        if (["#welcome-copy", "#details", "#rsvp"].includes(chapter.anchor)) {
          await testInfo.attach(
            `phase1-${width}px-${chapter.anchor.slice(1)}.png`,
            {
              body: await page.screenshot(),
              contentType: "image/png",
            },
          );
        }
      }

      await page.locator("#details").scrollIntoViewIfNeeded();
      const actionSizes = await page
        .locator(
          '#details a[href*="maps"], #details a[href$="calendar"], #details button',
        )
        .evaluateAll((actions) =>
          actions.map((action) => {
            const rect = action.getBoundingClientRect();
            return {
              height: Number(rect.height.toFixed(2)),
              label: action.textContent?.trim() ?? "",
              width: Number(rect.width.toFixed(2)),
            };
          }),
        );
      expect(actionSizes.length).toBeGreaterThan(0);
      expect(actionSizes.filter((action) => action.height < 44)).toEqual([]);

      evidence[`${width}px`] = {
        actionSizes,
        chapters: chapterEvidence,
        interpretation:
          width === 640
            ? "CSS reflow equivalent of a 1280px-wide viewport at 200% browser zoom"
            : "Required 320 CSS pixel reflow",
      };
    });
  }

  await testInfo.attach("phase1-reflow-evidence.json", {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: "application/json",
  });
});

test("rapid forward input interrupted by reverse scroll settles coherently", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "One Chromium run retains the synthetic interruption observation.",
  );

  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto(invitationPath);
  await page.getByRole("button", { name: "Open invitation" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-spatial-mode", "webgl");

  const positions = await page.evaluate(() => {
    const story = document.querySelector<HTMLElement>("#story");
    const details = document.querySelector<HTMLElement>("#details");
    const rsvp = document.querySelector<HTMLElement>("#rsvp");
    if (!story || !details || !rsvp) throw new Error("Journey anchors are missing");
    const target = (element: HTMLElement) =>
      element.offsetTop + element.offsetHeight * 0.3;
    return {
      details: target(details),
      rsvp: target(rsvp),
      story: target(story),
    };
  });

  await page.evaluate(async ({ details, rsvp, story }) => {
    const nextFrame = () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    window.scrollTo({ behavior: "instant", top: details });
    await nextFrame();
    window.scrollTo({ behavior: "instant", top: rsvp });
    await nextFrame();
    window.scrollTo({ behavior: "instant", top: story });
  }, positions);

  await expect(page.locator("main")).toHaveAttribute(
    "data-active-chapter",
    "story-one",
  );
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator("#story h2")).toBeVisible();
  await expect(page.locator("#details")).toContainText("The Glass House");

  const result = await page.evaluate(({ details }) => {
    const root = document.querySelector<HTMLElement>("main");
    return {
      activeChapter: root?.dataset.activeChapter,
      finalProgress: Number(
        root?.style.getPropertyValue("--journey-progress") ?? "NaN",
      ),
      finalScrollY: window.scrollY,
      forwardProgress: details /
        Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
    };
  }, positions);

  expect(result.finalScrollY).toBeLessThan(positions.details);
  expect(result.finalProgress).toBeLessThan(result.forwardProgress);
  await testInfo.attach("phase1-reverse-scroll-evidence.json", {
    body: Buffer.from(JSON.stringify({ positions, result }, null, 2)),
    contentType: "application/json",
  });
});

test("Chromium lab vitals and the WebGL demand loop stay within Phase 1 budgets", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Performance instrumentation is retained once in desktop Chromium.",
  );

  await page.addInitScript(() => {
    type Phase1Probe = {
      cls: number;
      drawCalls: number;
      eventDurations: number[];
      lcp: number;
      longAnimationFrames: number[];
    };
    const probe: Phase1Probe = {
      cls: 0,
      drawCalls: 0,
      eventDurations: [],
      lcp: 0,
      longAnimationFrames: [],
    };
    Object.defineProperty(window, "__phase1Probe", {
      configurable: false,
      value: probe,
      writable: false,
    });

    const patchDrawCalls = (prototype: object | undefined) => {
      if (!prototype) return;
      for (const method of ["drawArrays", "drawElements"] as const) {
        const record = prototype as Record<string, unknown>;
        const original = record[method];
        if (typeof original !== "function") continue;
        record[method] = function (this: unknown, ...args: unknown[]) {
          probe.drawCalls += 1;
          return Reflect.apply(original, this, args);
        };
      }
    };
    patchDrawCalls(globalThis.WebGLRenderingContext?.prototype);
    patchDrawCalls(globalThis.WebGL2RenderingContext?.prototype);

    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        probe.lcp = entries.at(-1)?.startTime ?? probe.lcp;
      }).observe({ buffered: true, type: "largest-contentful-paint" });
    } catch {}

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!shift.hadRecentInput) probe.cls += shift.value ?? 0;
        }
      }).observe({ buffered: true, type: "layout-shift" });
    } catch {}

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const event = entry as PerformanceEntry & { interactionId?: number };
          if (event.interactionId) probe.eventDurations.push(event.duration);
        }
      }).observe(
        {
          durationThreshold: 16,
          type: "event",
        } as PerformanceObserverInit & { durationThreshold: number },
      );
    } catch {}

    try {
      new PerformanceObserver((list) => {
        probe.longAnimationFrames.push(
          ...list.getEntries().map((entry) => entry.duration),
        );
      }).observe({ buffered: true, type: "long-animation-frame" });
    } catch {}
  });

  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto(invitationPath, { waitUntil: "networkidle" });
  const open = page.getByRole("button", { name: "Open invitation" });
  await expect(open).toBeEnabled();
  await open.click();
  await expect(page.locator("main")).toHaveAttribute("data-spatial-mode", "webgl");
  await expect(page.locator("canvas")).toBeVisible();

  await page.locator("#story").evaluate((story) =>
    story.scrollIntoView({ behavior: "instant" }),
  );
  await expect(page.locator("main")).toHaveAttribute(
    "data-active-chapter",
    "story-one",
  );

  await expect
    .poll(
      async () => {
        const before = await page.evaluate(
          () =>
            (window as typeof window & {
              __phase1Probe: { drawCalls: number };
            }).__phase1Probe.drawCalls,
        );
        await page.waitForTimeout(300);
        const after = await page.evaluate(
          () =>
            (window as typeof window & {
              __phase1Probe: { drawCalls: number };
            }).__phase1Probe.drawCalls,
        );
        return after - before;
      },
      { message: "the demand-render canvas should settle" },
    )
    .toBe(0);

  const idleStart = await page.evaluate(
    () =>
      (window as typeof window & { __phase1Probe: { drawCalls: number } })
        .__phase1Probe.drawCalls,
  );
  await page.waitForTimeout(1_000);
  const evidence = await page.evaluate((start) => {
    const probe = (
      window as typeof window & {
        __phase1Probe: {
          cls: number;
          drawCalls: number;
          eventDurations: number[];
          lcp: number;
          longAnimationFrames: number[];
        };
      }
    ).__phase1Probe;
    const sortedEvents = [...probe.eventDurations].sort((a, b) => a - b);
    return {
      cls: probe.cls,
      idleDrawCalls: probe.drawCalls - start,
      inpCandidate: sortedEvents.at(-1) ?? null,
      lcpMs: probe.lcp,
      longAnimationFrameCount: probe.longAnimationFrames.length,
      maxLongAnimationFrameMs:
        Math.max(0, ...probe.longAnimationFrames),
      totalDrawCalls: probe.drawCalls,
    };
  }, idleStart);

  await testInfo.attach("phase1-lab-performance-evidence.json", {
    body: Buffer.from(
      JSON.stringify(
        {
          ...evidence,
          caveat:
            "Single-run local lab evidence; it is not field p75 data or physical-device GPU evidence.",
        },
        null,
        2,
      ),
    ),
    contentType: "application/json",
  });

  expect(evidence.lcpMs).toBeGreaterThan(0);
  expect(evidence.lcpMs).toBeLessThanOrEqual(2_500);
  expect(evidence.cls).toBeLessThanOrEqual(0.1);
  expect(evidence.inpCandidate).not.toBeNull();
  expect(evidence.inpCandidate!).toBeLessThanOrEqual(200);
  expect(evidence.idleDrawCalls).toBeLessThanOrEqual(1);
});
