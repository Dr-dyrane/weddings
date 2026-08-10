import { z } from "zod";

import {
  createCredit,
  createPhotoCollection,
  setHubVisibility,
} from "@/domains/event-collaboration/event-store";
import {
  getStudioIdentity,
  isTrustedStudioMutation,
} from "@/domains/event-collaboration/studio-auth";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

type StudioRouteProps = {
  params: Promise<{ weddingSlug: string }>;
};

const studioActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("visibility"),
    visibility: z.enum(["closed", "public"]),
  }),
  z.object({
    action: z.literal("credit"),
    kind: z.enum(["person", "vendor"]),
    displayName: z.string().trim().min(1).max(80),
    role: z.string().trim().min(1).max(80),
    groupName: z.string().trim().min(1).max(64),
    sortOrder: z.number().int().min(0).max(999),
    approvedForPublicDisplay: z.boolean(),
  }),
  z.object({
    action: z.literal("collection"),
    label: z.string().trim().min(1).max(64),
    opensAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
    retentionDays: z.number().int().min(1).max(365),
  }),
]);

function response(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request, { params }: StudioRouteProps) {
  if (!isTrustedStudioMutation(request)) {
    return response({ error: "Untrusted request." }, 403);
  }
  const identity = await getStudioIdentity();
  if (!identity) return response({ error: "Studio access required." }, 401);
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) return response({ error: "Wedding not found." }, 404);

  let parsed: z.infer<typeof studioActionSchema>;
  try {
    parsed = studioActionSchema.parse(await request.json());
  } catch {
    return response({ error: "Check the form and try again." }, 400);
  }

  if (parsed.action === "visibility") {
    try {
      await setHubVisibility(wedding.id, parsed.visibility);
      return response({ ok: true });
    } catch (error) {
      return response(
        {
          error:
            error instanceof Error ? error.message : "The hub did not publish.",
        },
        400,
      );
    }
  }

  if (parsed.action === "credit") {
    const id = await createCredit(wedding.id, {
      kind: parsed.kind,
      displayName: parsed.displayName,
      role: parsed.role,
      groupName: parsed.groupName,
      sortOrder: parsed.sortOrder,
      visibility: parsed.approvedForPublicDisplay ? "public" : "private",
      consent: parsed.approvedForPublicDisplay ? "approved" : "pending",
    });
    return response({ id }, 201);
  }

  const opensAt = new Date(parsed.opensAt);
  const expiresAt = new Date(parsed.expiresAt);
  if (
    !Number.isFinite(opensAt.getTime()) ||
    !Number.isFinite(expiresAt.getTime()) ||
    opensAt >= expiresAt ||
    expiresAt.getTime() - opensAt.getTime() > 31 * 24 * 60 * 60 * 1000
  ) {
    return response(
      { error: "The collection must close after it opens and within 31 days." },
      400,
    );
  }

  const issued = await createPhotoCollection({
    weddingId: wedding.id,
    label: parsed.label,
    opensAt: opensAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    retentionDays: parsed.retentionDays,
    createdBy: identity.email,
  });
  const target = new URL(
    `/${wedding.slug}/celebration/photos/${issued.credential}`,
    request.url,
  ).href;
  return response({ collectionId: issued.id, target }, 201);
}
