import { z } from "zod";

import {
  hashCollectionCredential,
  saveRsvpResponse,
} from "@/domains/event-collaboration/event-store";
import { getPublishedWedding } from "@/domains/weddings/published-wedding";

type RSVPRouteProps = {
  params: Promise<{ weddingSlug: string }>;
};

const rsvpSchema = z.object({
  attendance: z.enum(["yes", "no"]),
  guestName: z.string().trim().min(1).max(96),
  idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{16,128}$/),
  menuChoice: z
    .enum(["Celebration menu", "Vegetarian menu", "Tell us privately"])
    .nullable(),
  note: z.string().trim().max(600).nullable(),
});

function response(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request, { params }: RSVPRouteProps) {
  const { weddingSlug } = await params;
  const wedding = getPublishedWedding(weddingSlug);
  if (!wedding) return response({ error: "Invitation not found." }, 404);

  let input: z.infer<typeof rsvpSchema>;
  try {
    input = rsvpSchema.parse(await request.json());
  } catch {
    return response({ error: "Check your response and try again." }, 400);
  }

  const sourceAddress =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  try {
    const saved = await saveRsvpResponse({
      weddingId: wedding.id,
      idempotencyKey: input.idempotencyKey,
      attendance: input.attendance,
      guestName: input.guestName,
      menuChoice: input.attendance === "yes" ? input.menuChoice : null,
      note: input.note,
      sourceFingerprint: await hashCollectionCredential(
        `rsvp:${wedding.id}:${sourceAddress}`,
      ),
    });
    return response({ id: saved.id, state: "received" }, 201);
  } catch (error) {
    const message =
      error instanceof Error &&
      error.message === "Please wait a few minutes before trying again."
        ? error.message
        : "Your response could not be saved. Please try again.";
    return response({ error: message }, message.startsWith("Please wait") ? 429 : 500);
  }
}
