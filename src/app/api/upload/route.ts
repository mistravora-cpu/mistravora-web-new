import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return NextResponse.json(
      { error: `File type ".${extension}" is not allowed. permitted: images, PDF, video, audio.` },
      { status: 400 }
    );
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. permitted: images, PDF, video, audio." },
      { status: 400 }
    );
  }

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
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type || "application/octet-stream",
        Metadata: {
          "alt-text": altText.slice(0, 256),
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

  return NextResponse.json({
    key,
    url: `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`,
  });
}
