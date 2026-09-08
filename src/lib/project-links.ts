import type { SupabaseClient } from "@supabase/supabase-js";
import type { CaseStudy } from "./types";
import { isPublicMediaUrl } from "./media-url";

/** Read only links belonging to the projects already selected by the caller. */
export async function attachProjectLinks(projects: CaseStudy[], db: SupabaseClient): Promise<CaseStudy[]> {
  if (!projects.length) return projects;
  const {data, error} = await db.from("settings").select("key,value")
    .in("key", projects.map(project => `project_public_link:${project.id}`))
    .abortSignal(AbortSignal.timeout(8000));
  if (error) throw error;
  const links = new Map<string, string>((data ?? []).map(row => [row.key, row.value]));
  return projects.map(project => {
    const key = `project_public_link:${project.id}`;
    const value = links.has(key) ? links.get(key) : project.website_url;
    return {...project, website_url: value && isPublicMediaUrl(value) ? value : null};
  });
}
