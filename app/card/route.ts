import { createDyraneShareCard } from "@/domains/invitations/share-card";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const response = await createDyraneShareCard(request.url);
  response.headers.set(
    "Cache-Control",
    "public, max-age=31536000, immutable",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
