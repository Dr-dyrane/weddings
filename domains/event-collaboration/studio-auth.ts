import { notFound } from "next/navigation";

import {
  getChatGPTUser,
  requireChatGPTUser,
} from "@/app/chatgpt-auth";
import { getConfiguredStudioOwnerEmails } from "@/domains/event-collaboration/event-store";

export type StudioIdentity = {
  displayName: string;
  email: string;
};

const LOCAL_STUDIO_IDENTITY: StudioIdentity = {
  displayName: "Local Dyrane Studio",
  email: "local-studio@dyrane.test",
};

function isLocalDevelopment() {
  return process.env.NODE_ENV !== "production";
}

export function isTrustedStudioMutation(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return isLocalDevelopment();
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function isAuthorizedEmail(email: string) {
  if (isLocalDevelopment() && email === LOCAL_STUDIO_IDENTITY.email) {
    return true;
  }
  return getConfiguredStudioOwnerEmails().has(email.toLowerCase());
}

export async function getStudioIdentity(): Promise<StudioIdentity | null> {
  const user = await getChatGPTUser();
  if (!user && isLocalDevelopment()) return LOCAL_STUDIO_IDENTITY;
  if (!user || !isAuthorizedEmail(user.email)) return null;
  return { displayName: user.displayName, email: user.email };
}

export async function requireStudioPageIdentity(
  returnTo: string,
): Promise<StudioIdentity> {
  const localOrAuthorized = await getStudioIdentity();
  if (localOrAuthorized) return localOrAuthorized;

  const user = await requireChatGPTUser(returnTo);
  if (!isAuthorizedEmail(user.email)) notFound();
  return { displayName: user.displayName, email: user.email };
}
