import { createClient } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
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
const MAX_HEIGHT = 1920;
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
    const image = sharp(buffer, { animated: true, limitInputPixels: 40_000_000 }).rotate();

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
    if ((metadata.pages ?? 1) > 1) {
      // Keep GIF as-is to preserve animation
      return { buffer, extension, contentType };
    }

    const optimized = await pipeline
      .webp({ quality: QUALITY, effort: 4 })
      .toBuffer();

    return {
      buffer: optimized,
      extension: "webp",
      contentType: "image/webp",
    };
  } catch {
    throw new Error("Invalid or unsupported image. Try a JPEG, PNG or WebP under 40 megapixels.");
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

  let formData: FormData;
  try { formData = await request.formData(); } catch { return NextResponse.json({error:"Invalid upload form."},{status:400}); }
  const file = formData.get("file");
  const altText = String(formData.get("alt_text") ?? "").slice(0,256);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size === 0 || file.size > MAX_SIZE_BYTES) {
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
  let optimized: Awaited<ReturnType<typeof optimizeImage>>;
  try { optimized = await optimizeImage(originalBuffer, originalExtension, file.type || "application/octet-stream"); }
  catch { return NextResponse.json({error:"Invalid or oversized image. Use a valid image under 40 megapixels."},{status:400}); }
  const {buffer: optimizedBuffer, extension, contentType} = optimized;

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
        CacheControl: "public, max-age=31536000, immutable",
        Metadata: {
          "alt-text": encodeURIComponent(altText),
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

  // Register only after R2 confirms the upload. Never store image bytes in Supabase.
  const url = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  const db = await createClient();
  const {data: item, error: saveError} = await db.from("media_library").insert({
    name: String(formData.get("name") || file.name).slice(0,255),
    alt_text: altText || null,
    note: String(formData.get("note") || "").slice(0,1000) || null,
    url, file_key: key, file_type: contentType, file_size: optimizedBuffer.length,
  }).select().single();
  if (saveError) {
    try { await s3.send(new DeleteObjectCommand({Bucket:R2_BUCKET_NAME,Key:key})); }
    catch { /* Preserve the original database failure; no successful upload is reported. */ }
    return NextResponse.json({error:"Could not register the uploaded file. Please retry."},{status:502});
  }
  revalidatePath("/dashboard/media");
  revalidateTag("public-data", {expire:0});
  return NextResponse.json({key,url,item,contentType,originalSize:originalBuffer.length,optimizedSize:optimizedBuffer.length});
}
