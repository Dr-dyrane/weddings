import {
  deletePhotoSubmission,
  getPhotoObject,
  getPhotoSubmission,
  moderatePhotoSubmission,
} from "@/domains/event-collaboration/event-store";
import {
  getStudioIdentity,
  isTrustedStudioMutation,
} from "@/domains/event-collaboration/studio-auth";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

type SubmissionRouteProps = {
  params: Promise<{ weddingSlug: string; submissionId: string }>;
};

function safeFilename(value: string) {
  return value.replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 120) || "photo";
}

async function authorize(params: SubmissionRouteProps["params"]) {
  const identity = await getStudioIdentity();
  const { weddingSlug, submissionId } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!identity || !wedding) return null;
  return { identity, wedding, submissionId };
}

export async function GET(request: Request, { params }: SubmissionRouteProps) {
  const access = await authorize(params);
  if (!access) return new Response(null, { status: 401 });
  const submission = await getPhotoSubmission(
    access.wedding.id,
    access.submissionId,
  );
  if (!submission) return new Response(null, { status: 404 });
  const object = await getPhotoObject(submission.objectKey);
  if (!object) return new Response(null, { status: 404 });
  const inline = new URL(request.url).searchParams.get("inline") === "1";
  return new Response(object.body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${safeFilename(submission.originalFilename)}"`,
      "Content-Type": submission.mediaType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function PATCH(request: Request, { params }: SubmissionRouteProps) {
  if (!isTrustedStudioMutation(request)) {
    return new Response(null, { status: 403 });
  }
  const access = await authorize(params);
  if (!access) return new Response(null, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    state?: unknown;
  } | null;
  if (body?.state !== "approved" && body?.state !== "rejected") {
    return Response.json({ error: "Invalid moderation state." }, { status: 400 });
  }
  await moderatePhotoSubmission({
    weddingId: access.wedding.id,
    submissionId: access.submissionId,
    state: body.state,
    moderatedBy: access.identity.email,
  });
  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function DELETE(request: Request, { params }: SubmissionRouteProps) {
  if (!isTrustedStudioMutation(request)) {
    return new Response(null, { status: 403 });
  }
  const access = await authorize(params);
  if (!access) return new Response(null, { status: 401 });
  await deletePhotoSubmission(
    access.wedding.id,
    access.submissionId,
    access.identity.email,
  );
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "private, no-store" },
  });
}
