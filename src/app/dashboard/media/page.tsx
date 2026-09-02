import type { Metadata } from "next";
import { getMediaLibrary } from "@/lib/services";
import { MediaUpload } from "./media-upload";

export const metadata: Metadata = {
  title: "Media",
  robots: { index: false, follow: false },
};

export default async function MediaAdminPage() {
  const items = await getMediaLibrary();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Media Library</h1>
        <p className="text-sm text-muted-foreground">
          Upload images to Cloudflare R2 — give each file a name and note so you
          can find it later. Copy the public URL into any content field.
        </p>
      </div>
      <MediaUpload initialItems={items} />
    </div>
  );
}
