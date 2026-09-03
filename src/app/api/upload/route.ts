import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { requireAdmin } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { serverEnv } from "@/lib/env";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
  "image/bmp",
  "image/x-icon",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
];

const ALLOWED_EXTENSIONS = [
  "jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "bmp", "ico",
  "pdf", "mp4", "webm", "mp3", "ogg", "wav",
];

// Image types that should be compressed/optimized
const IMAGE_TYPES_TO_OPTIMIZE = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/avif",
]);

const IMAGE_EXTENSIONS_TO_OPTIMIZE = new Set([
  "jpg", "jpeg", "png", "gif", "bmp", "webp", "avif",
]);

// Max dimensions for optimized images
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
// Quality for JPEG/WebP (1-100)
const QUALITY = 82;

/**
 * Optimize an image buffer using sharp.
 * - Resizes to max dimensions (preserving aspect ratio)
 * - Converts to WebP for smaller file size
 * - Returns the optimized buffer and new content type
 *
 * SVGs and non-image files are returned as-is.
 */
async function optimizeImage(
  buffer: Buffer,
  extension: string,
  contentType: string
): Promise<{ buffer: Buffer; extension: string; contentType: string }> {
  // Skip SVGs — they're already vector and tiny
  if (extension === "svg" || contentType === "image/svg+xml") {
    return { buffer, extension, contentType: "image/svg+xml" };
  }

  // Skip non-images
  if (!IMAGE_EXTENSIONS_TO_OPTIMIZE.has(extension) && !IMAGE_TYPES_TO_OPTIMIZE.has(contentType)) {
    return { buffer, extension, contentType };
  }

  try {
    const image = sharp(buffer, { animated: extension === "gif" });

    // Get metadata to decide if resizing is needed
    const metadata = await image.metadata();
    const needsResize =
      (metadata.width && metadata.width > MAX_WIDTH) ||
      (metadata.height && metadata.height > MAX_HEIGHT);

    let pipeline = image;
    if (needsResize) {
      pipeline = pipeline.resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Convert to WebP for optimal compression (except GIF which stays animated)
    if (extension === "gif") {
      // Keep GIF as-is to preserve animation
      return { buffer, extension, contentType: "image/gif" };
    }

    const optimized = await pipeline
      .webp({ quality: QUALITY, effort: 4 })
      .toBuffer();

    return {
      buffer: optimized,
      extension: "webp",
      contentType: "image/webp",
    };
  } catch (error) {
    console.error("Image optimization failed, using original:", error);
    return { buffer, extension, contentType };
  }
}

export async function POST(request: Request) {
  const limited = checkRateLimit(request, RATE_LIMITS.upload);
  if (limited) return limited;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden — admin access required." }, { status: 403 });
  }

  let R2_ENDPOINT: string;
  let R2_ACCESS_KEY_ID: string;
  let R2_SECRET_ACCESS_KEY: string;
  let R2_BUCKET_NAME: string;
  let R2_PUBLIC_URL: string;

  try {
    R2_ENDPOINT = serverEnv.R2_ENDPOINT;
    R2_ACCESS_KEY_ID = serverEnv.R2_ACCESS_KEY_ID;
    R2_SECRET_ACCESS_KEY = serverEnv.R2_SECRET_ACCESS_KEY;
    R2_BUCKET_NAME = serverEnv.R2_BUCKET_NAME;
    R2_PUBLIC_URL = serverEnv.R2_PUBLIC_URL;
  } catch {
    return NextResponse.json(
      { error: "R2 isn't configured yet — add the R2 keys to .env." },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const altText = (formData.get("alt_text") as string | null) ?? "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 10 MB)." },
      { status: 400 }
    );
  }

  const originalExtension = file.name.split(".").pop()?.toLowerCase() ?? "bin";

  if (!ALLOWED_EXTENSIONS.includes(originalExtension)) {
    return NextResponse.json(
      { error: `File type ".${originalExtension}" is not allowed. permitted: images, PDF, video, audio.` },
      { status: 400 }
    );
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. permitted: images, PDF, video, audio." },
      { status: 400 }
    );
  }

  // Read the file buffer
  const originalBuffer = Buffer.from(await file.arrayBuffer());

  // Optimize images (compress, resize, convert to WebP)
  const { buffer: optimizedBuffer, extension, contentType } = await optimizeImage(
    originalBuffer,
    originalExtension,
    file.type || "application/octet-stream"
  );

  const key = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;

  const s3 = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: optimizedBuffer,
        ContentType: contentType,
        Metadata: {
          "alt-text": altText.slice(0, 256),
          "original-size": String(originalBuffer.length),
          "optimized-size": String(optimizedBuffer.length),
        },
      })
    );
  } catch (error) {
    console.error(error);
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg.includes("NoSuchBucket")) {
      return NextResponse.json(
        { error: `R2 bucket "${R2_BUCKET_NAME}" does not exist. Create it in your Cloudflare R2 dashboard first.` },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Upload failed — check the R2 credentials and bucket configuration." },
      { status: 502 }
    );
  }

  const compressionRatio = originalBuffer.length > 0
    ? Math.round((1 - optimizedBuffer.length / originalBuffer.length) * 100)
    : 0;

  return NextResponse.json({
    key,
    url: `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`,
    optimized: extension !== originalExtension,
    originalSize: originalBuffer.length,
    optimizedSize: optimizedBuffer.length,
    compressionRatio: `${compressionRatio}% smaller`,
    contentType,
  });
}
