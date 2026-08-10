import {
  isOpaqueCollectionCredential,
} from "@/domains/event-collaboration/celebration";
import {
  hashCollectionCredential,
  resolvePhotoCollection,
  savePhotoSubmission,
} from "@/domains/event-collaboration/event-store";
import {
  MAX_PHOTO_BYTES,
  PHOTO_CONSENT_VERSION,
} from "@/domains/event-collaboration/event-policy";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

type UploadRouteProps = {
  params: Promise<{
    weddingSlug: string;
    opaqueCollectionCredential: string;
  }>;
};

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request, { params }: UploadRouteProps) {
  const { weddingSlug, opaqueCollectionCredential } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding || !isOpaqueCollectionCredential(opaqueCollectionCredential)) {
    return json({ error: "Guest camera unavailable." }, 404);
  }

  const collection = await resolvePhotoCollection(
    wedding.id,
    opaqueCollectionCredential,
  ).catch(() => null);
  if (!collection) return json({ error: "Guest camera unavailable." }, 404);
  if (collection.availability !== "active") {
    return json({ error: "This guest camera is not accepting photos." }, 409);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_PHOTO_BYTES + 1024 * 1024) {
    return json({ error: "Choose one photo smaller than 12 MB." }, 413);
  }

  try {
    const form = await request.formData();
    const photo = form.get("photo");
    const consent = form.get("consent");
    const idempotencyKey = String(form.get("idempotencyKey") ?? "");
    const uploaderName = String(form.get("uploaderName") ?? "").trim();
    const sourceAddress =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (!(photo instanceof File)) {
      return json({ error: "Choose one photo to send." }, 400);
    }
    if (consent !== PHOTO_CONSENT_VERSION) {
      return json({ error: "Please accept the photo terms before sending." }, 400);
    }
    if (!/^[A-Za-z0-9_-]{16,128}$/.test(idempotencyKey)) {
      return json({ error: "Refresh the page and try again." }, 400);
    }

    const submission = await savePhotoSubmission({
      collection,
      file: photo,
      idempotencyKey,
      sourceFingerprint: await hashCollectionCredential(
        `${opaqueCollectionCredential}:${sourceAddress}`,
      ),
      uploaderName: uploaderName || null,
    });
    return json({ submissionId: submission.id, state: "received" }, 201);
  } catch (error) {
    const candidate = error instanceof Error ? error.message : "";
    const knownMessages = [
      "Choose one photo smaller than 12 MB.",
      "Use a JPEG, PNG, WebP, or HEIC photo.",
      "The guest camera is busy. Please try again shortly.",
      "This guest camera is not accepting photos.",
    ];
    const message = knownMessages.includes(candidate)
      ? candidate
      : "The photo could not be sent. Please try again.";
    const status = message.includes("busy") ? 429 : 400;
    return json({ error: message }, status);
  }
}
