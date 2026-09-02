import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const insertSchema = z.object({
  name: z.string().min(1).max(255),
  alt_text: z.string().max(256).optional(),
  note: z.string().max(1000).optional(),
  url: z.string().url(),
  file_key: z.string().max(500).optional(),
  file_type: z.string().max(100).nullable().optional(),
  file_size: z.number().int().nonnegative().nullable().optional(),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export async function POST(request: Request) {
  const limited = checkRateLimit(request, RATE_LIMITS.media);
  if (limited) return limited;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: z.infer<typeof insertSchema>;
  try {
    body = insertSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid request — name and URL are required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_library")
    .insert({
      name: body.name,
      alt_text: body.alt_text || null,
      note: body.note || null,
      url: body.url,
      file_key: body.file_key || "",
      file_type: body.file_type || null,
      file_size: body.file_size || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/dashboard/media");
  revalidateTag("public-data", { expire: 0 });
  return NextResponse.json({ item: data });
}

export async function DELETE(request: Request) {
  const limited = checkRateLimit(request, RATE_LIMITS.media);
  if (limited) return limited;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: z.infer<typeof deleteSchema>;
  try {
    body = deleteSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Valid ID is required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("media_library")
    .delete()
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/dashboard/media");
  revalidateTag("public-data", { expire: 0 });
  return NextResponse.json({ success: true });
}
