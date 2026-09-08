# Hero media

Open **Admin → Hero Sections → Hero images and videos**.

1. Choose the exact public page path: `/` for home, `/about`, or a complete project/article path.
2. Enter a description, then select one or multiple files; alternatively choose the media type and add a direct HTTPS URL.
3. Edit descriptions, move items earlier, or remove items from the list.
4. Click **Save hero media** to publish all edited page lists. An empty list removes that page's media.

Images rotate every 5.5 seconds. Videos play muted while visible and advance when finished; a single video loops. Native playback controls remain available if browser autoplay is blocked. Hidden tabs and offscreen media pause. Reduced-motion preferences disable automatic playback/rotation; navigation remains available.

Uploads use the existing authenticated R2 pipeline, including raster image optimization and Supabase media registration. Each file must be under 4 MB to stay below the deployment request limit. Use MP4/WebM video files; larger videos may use direct hosted HTTPS links. Links must point to media files, not YouTube/watch pages. Browser codec support and external hosting availability still apply.

Media is stored in the `hero_media_config` setting. Public pages read only that setting. No new schema is required. Up to 12 media items are supported per page, with a total configuration limit of 200,000 characters. Media removal from a hero does not delete reusable files from R2.

Existing page headings and robot content remain. Standard hero pages display media within their hero section; other public paths display configured media above their existing page content. No published media is added automatically.
