-- 0044: posts.sort_order
-- Lets admins control the display order of blog articles from the dashboard,
-- matching the pattern already used by research and other collections.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS posts_sort_order_idx ON public.posts (sort_order);
