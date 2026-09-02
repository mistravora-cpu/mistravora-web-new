import type { Metadata } from "next";
import { getAdminPosts as getPosts } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Blog",
  robots: { index: false, follow: false },
};

const columns: ColumnDef[] = [
  { name: "title", label: "Title" },
  { name: "author", label: "Author" },
  { name: "category", label: "Category" },
  { name: "featured", label: "Featured" },
  { name: "published", label: "Active" },
];

const fields: FieldDef[] = [
  { name: "title", label: "Title", required: true },
  { name: "slug", label: "Slug", required: true, placeholder: "my-post" },
  { name: "excerpt", label: "Excerpt", type: "textarea" },
  { name: "body", label: "Content (Markdown)", type: "textarea" },
  { name: "cover_image", label: "Featured Image", type: "image" },
  { name: "author", label: "Author", placeholder: "Mr.Shakeel" },
  { name: "author_role", label: "Author Role", placeholder: "Founder" },
  { name: "medium_url", label: "Medium Article URL (Optional)", placeholder: "https://medium.com/..." },
  { name: "category", label: "Category", placeholder: "Technical" },
  { name: "read_time", label: "Read Time", placeholder: "6 min read" },
  { name: "tags", label: "Tags (comma-separated)", type: "list", placeholder: "PWA, Mobile Apps" },
  { name: "published_at", label: "Publish Date", placeholder: "2025-07-29" },
  { name: "featured", label: "Featured", type: "boolean" },
  { name: "published", label: "Active", type: "boolean" },
];

export default async function BlogAdminPage() {
  const posts = await getPosts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage your blog posts and content.
        </p>
      </div>
      <CrudManager
        table="posts"
        columns={columns}
        fields={fields}
        rows={posts as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}
