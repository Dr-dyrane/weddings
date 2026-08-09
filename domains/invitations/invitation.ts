import { z } from "zod";

import {
  getPublishedWedding,
  type PublishedWedding,
} from "@/domains/weddings/published-wedding";

export const DEMO_INVITATION_TOKEN =
  "G4f7kP2vN9mQ6xR3cT8wY1aD5sH0jL4bZ7uE2iC9oV6";

export const invitationProjectionSchema = z.object({
  kind: z.enum(["public", "personalized"]),
  salutation: z.string().min(1).max(64),
  guestDisplayName: z.string().min(1).max(96).nullable(),
  cardEdition: z.number().int().positive(),
  canRespond: z.boolean(),
  allowedEventIds: z.array(z.string().min(1)).nullable(),
});

export type InvitationProjection = z.infer<typeof invitationProjectionSchema>;

const publicProjection = invitationProjectionSchema.parse({
  kind: "public",
  salutation: "Honoured Guest",
  guestDisplayName: null,
  cardEdition: 3,
  canRespond: false,
  allowedEventIds: null,
});

const previewInvitation = invitationProjectionSchema.parse({
  kind: "personalized",
  salutation: "Dr. Dyrane",
  guestDisplayName: "Dr. Dyrane",
  cardEdition: 3,
  canRespond: false,
  allowedEventIds: ["vow", "gathering"],
});

export function getPublicInvitation(): InvitationProjection {
  return publicProjection;
}

export function resolveInvitation(
  weddingSlug: string,
  opaqueToken: string,
): InvitationProjection | null {
  const wedding = getPublishedWedding(weddingSlug);

  if (
    wedding?.status === "preview" &&
    weddingSlug === "the_ogranyas" &&
    opaqueToken === DEMO_INVITATION_TOKEN
  ) {
    return previewInvitation;
  }

  return null;
}

export function projectWeddingForInvitation(
  wedding: PublishedWedding,
  invitation: InvitationProjection,
): PublishedWedding {
  if (invitation.allowedEventIds === null) return wedding;

  const allowedEvents = new Set(invitation.allowedEventIds);
  return {
    ...wedding,
    events: wedding.events.filter((event) => allowedEvents.has(event.id)),
  };
}
