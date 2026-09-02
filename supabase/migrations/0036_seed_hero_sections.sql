-- 0036: seed hero_sections
-- Insert hero/banner sections for each page.
-- Uses ON CONFLICT DO NOTHING so re-running is safe.

-- ─── Home ───────────────────────────────────────────────────────────────
INSERT INTO public.hero_sections (
  page, badge, headline, highlighted_text, description,
  primary_button_text, primary_button_link,
  secondary_button_text, secondary_button_link
) VALUES (
  'home',
  'AI-powered software studio',
  'We build intelligent software that grows your business',
  'intelligent software',
  'Mistravora crafts high-performance web platforms, custom dashboards, and AI-driven tools for ambitious companies in Sri Lanka and worldwide.',
  'Start your project',
  '/contact',
  'Ask our AI',
  '/assistant'
)
ON CONFLICT DO NOTHING;

-- ─── About ──────────────────────────────────────────────────────────────
INSERT INTO public.hero_sections (
  page, badge, headline, highlighted_text, description,
  primary_button_text, primary_button_link,
  secondary_button_text, secondary_button_link
) VALUES (
  'about',
  'About Mistravora',
  'Built different. Built to last.',
  'Built to last',
  'A Sri Lankan software company building fast, accessible, conversion-focused digital products.',
  'Get in touch',
  '/contact',
  'See our work',
  '/case-studies'
)
ON CONFLICT DO NOTHING;

-- ─── Solutions ──────────────────────────────────────────────────────────
INSERT INTO public.hero_sections (
  page, badge, headline, highlighted_text, description,
  primary_button_text, primary_button_link,
  secondary_button_text, secondary_button_link
) VALUES (
  'solutions',
  'Solutions',
  'Software solutions for ambitious businesses',
  'ambitious businesses',
  'Custom web platforms, business software, e-commerce, and AI-powered features.',
  'Start your project',
  '/contact',
  'View pricing',
  '/pricing'
)
ON CONFLICT DO NOTHING;

-- ─── Pricing ────────────────────────────────────────────────────────────
INSERT INTO public.hero_sections (
  page, badge, headline, highlighted_text, description,
  primary_button_text, primary_button_link,
  secondary_button_text, secondary_button_link
) VALUES (
  'pricing',
  'Pricing',
  'Transparent pricing for every stage',
  'every stage',
  'From starter marketing sites to custom enterprise platforms.',
  'Get started',
  '/contact',
  'Talk to us',
  '/contact'
)
ON CONFLICT DO NOTHING;

-- ─── Blog ───────────────────────────────────────────────────────────────
INSERT INTO public.hero_sections (
  page, badge, headline, highlighted_text, description,
  primary_button_text, primary_button_link
) VALUES (
  'blog',
  'Blog',
  'Insights on software and growth',
  'software and growth',
  'Web performance, development, and digital growth from the Mistravora team.',
  'Start your project',
  '/contact'
)
ON CONFLICT DO NOTHING;

-- ─── Case studies ───────────────────────────────────────────────────────
INSERT INTO public.hero_sections (
  page, badge, headline, highlighted_text, description,
  primary_button_text, primary_button_link
) VALUES (
  'case-studies',
  'Projects',
  'Real results, not vanity screenshots',
  'Real results',
  'Measurable outcomes from Mistravora projects.',
  'Start your project',
  '/contact'
)
ON CONFLICT DO NOTHING;

-- ─── Careers ────────────────────────────────────────────────────────────
INSERT INTO public.hero_sections (
  page, badge, headline, highlighted_text, description,
  primary_button_text, primary_button_link
) VALUES (
  'careers',
  'Careers',
  'Build the future with us',
  'with us',
  'Join a Sri Lankan software team building fast, accessible digital products for the world.',
  'Get in touch',
  '/contact'
)
ON CONFLICT DO NOTHING;

-- ─── Contact ────────────────────────────────────────────────────────────
INSERT INTO public.hero_sections (
  page, badge, headline, highlighted_text, description,
  primary_button_text, primary_button_link
) VALUES (
  'contact',
  'Contact',
  'Let''s build something great',
  'something great',
  'Talk to Mistravora about your next project — WhatsApp, phone, or email.',
  'Send a message',
  '#contact-form'
)
ON CONFLICT DO NOTHING;

-- ─── Tools ──────────────────────────────────────────────────────────────
INSERT INTO public.hero_sections (
  page, badge, headline, highlighted_text, description,
  primary_button_text, primary_button_link
) VALUES (
  'tools',
  'Free Tools',
  'Free tools for smarter decisions',
  'smarter decisions',
  'Cost calculator, ROI calculator, and website audit — built to help you plan your next move.',
  'Try the tools',
  '/tools/cost-calculator'
)
ON CONFLICT DO NOTHING;
