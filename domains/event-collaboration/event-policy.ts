export const PHOTO_CONSENT_VERSION = "guest-photo-v1";
export const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

export type ValidatedPhoto = {
  bytes: ArrayBuffer;
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/heic";
  extension: "jpg" | "png" | "webp" | "heic";
};

export async function validatePhoto(file: File): Promise<ValidatedPhoto> {
  if (file.size <= 0 || file.size > MAX_PHOTO_BYTES) {
    throw new Error("Choose one photo smaller than 12 MB.");
  }
  const bytes = await file.arrayBuffer();
  const header = new Uint8Array(bytes.slice(0, 16));
  const ascii = new TextDecoder("ascii").decode(header);
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return { bytes, mediaType: "image/jpeg", extension: "jpg" };
  }
  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47
  ) {
    return { bytes, mediaType: "image/png", extension: "png" };
  }
  if (ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP") {
    return { bytes, mediaType: "image/webp", extension: "webp" };
  }
  if (ascii.slice(4, 12).match(/^ftyp(heic|heix|hevc|hevx|mif1|msf1)$/)) {
    return { bytes, mediaType: "image/heic", extension: "heic" };
  }
  throw new Error("Use a JPEG, PNG, WebP, or HEIC photo.");
}
