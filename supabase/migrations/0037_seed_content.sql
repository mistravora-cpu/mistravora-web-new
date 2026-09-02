-- 0037: seed content
-- Insert seed data for value cards, statistics, core values, team members,
-- pricing tiers (+ features), pricing notes, pricing addons, industries
-- (+ challenges + solutions), trusted companies, policies, contact info,
-- social media, FAQs, benefits, testimonials, and tech stack.
-- Uses ON CONFLICT DO NOTHING so re-running is safe.

-- ════════════════════════════════════════════════════════════════════════
-- 1. value_cards
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.value_cards (icon, title, description, sort_order, published) VALUES
  ('Gauge',        'Performance-first', 'Sub-second load times and Core Web Vitals in the green, every time.',                       1, true),
  ('ShieldCheck',  'Privacy-first',     'GDPR-aware defaults and data ownership you can actually trust.',                            2, true),
  ('MousePointerClick', 'Built to convert', 'Every section is engineered around a clear, measurable conversion goal.',             3, true),
  ('Smartphone',   'Mobile-ready',      'Touch-first layouts that look sharp on every screen size.',                                 4, true),
  ('Search',       'SEO-optimized',     'Semantic markup, structured data, and clean URLs that search engines love.',              5, true),
  ('Sparkles',     'AI-powered',        'AI assistants and automation baked in where they create real leverage.',                   6, true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 2. statistics
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.statistics (value, label, sort_order, published) VALUES
  ('50+',   'Projects Delivered',      1, true),
  ('7',     'Years Experience',        2, true),
  ('100%',  'Client Satisfaction',     3, true),
  ('24/7',  'Support',                 4, true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 3. core_values
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.core_values (icon, title, description, sort_order, published) VALUES
  ('Target',    'Craftsmanship', 'We sweat the details that users feel but rarely notice.',                    1, true),
  ('Gauge',     'Performance',   'Speed is a feature. We treat it like one, from day one.',                   2, true),
  ('Eye',       'Transparency',  'Clear scope, honest timelines, and no surprise invoices.',                  3, true),
  ('Handshake', 'Partnership',   'We act like an extension of your team, not an outside vendor.',             4, true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 4. team_members
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.team_members (name, role, bio, photo, linkedin, x_handle, sort_order, published) VALUES
  ('Shakeel', 'Founder & CEO',     'Leads product strategy and engineering at Mistravora.', '', '', '', 1, true),
  ('Sarah',   'Lead Designer',     'Crafts accessible, conversion-focused interfaces.',      '', '', '', 2, true),
  ('Ahmed',   'Senior Developer',  'Builds fast, reliable web platforms and APIs.',          '', '', '', 3, true),
  ('Fatima',  'AI Engineer',       'Designs and ships AI-powered features and assistants.',  '', '', '', 4, true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 5. pricing_tiers + pricing_tier_features
--    Insert tiers first, then features referencing each tier by name.
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.pricing_tiers (name, tagline, price, description, icon, button_text, sort_order, popular, active) VALUES
  ('Starter', 'For small businesses getting online', 'LKR 150k+',   'A fast, SEO-ready marketing site to establish your presence.',  'Rocket',        'Get started', 1, false, true),
  ('Growth',  'For growing companies that need more', 'LKR 400k+',   'Custom web platform with CMS, integrations, and automation.',   'TrendingUp',    'Get started', 2, true,  true),
  ('Custom',  'For complex, enterprise-grade builds', 'Let''s talk', 'Tailored software, dashboards, and AI features built to spec.', 'Settings',      'Talk to us',  3, false, true)
ON CONFLICT DO NOTHING;

-- Starter features
INSERT INTO public.pricing_tier_features (pricing_tier_id, feature, sort_order)
SELECT id, feature, sort_order FROM (
  SELECT t.id, f.feature, f.sort_order
  FROM public.pricing_tiers t
  CROSS JOIN (VALUES
    ('Up to 5 pages',                  1),
    ('Mobile-responsive design',       2),
    ('Basic SEO setup',                3),
    ('Contact form',                   4),
    ('1 round of revisions',           5)
  ) AS f(feature, sort_order)
  WHERE t.name = 'Starter'
) s
ON CONFLICT DO NOTHING;

-- Growth features
INSERT INTO public.pricing_tier_features (pricing_tier_id, feature, sort_order)
SELECT id, feature, sort_order FROM (
  SELECT t.id, f.feature, f.sort_order
  FROM public.pricing_tiers t
  CROSS JOIN (VALUES
    ('Up to 15 pages',                 1),
    ('Custom CMS',                     2),
    ('Advanced SEO & analytics',       3),
    ('Third-party integrations',       4),
    ('AI chat widget',                 5),
    ('3 rounds of revisions',          6)
  ) AS f(feature, sort_order)
  WHERE t.name = 'Growth'
) s
ON CONFLICT DO NOTHING;

-- Custom features
INSERT INTO public.pricing_tier_features (pricing_tier_id, feature, sort_order)
SELECT id, feature, sort_order FROM (
  SELECT t.id, f.feature, f.sort_order
  FROM public.pricing_tiers t
  CROSS JOIN (VALUES
    ('Unlimited pages',                1),
    ('Custom software & dashboards',   2),
    ('AI-powered features',            3),
    ('Dedicated team',                 4),
    ('Priority support',               5),
    ('Ongoing maintenance',            6)
  ) AS f(feature, sort_order)
  WHERE t.name = 'Custom'
) s
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 6. pricing_notes
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.pricing_notes (text, sort_order, active) VALUES
  ('Prices are starting points and may vary based on scope and complexity.',                 1, true),
  ('All projects include a free discovery call and written proposal.',                       2, true),
  ('Payment is typically split into milestones.',                                            3, true),
  ('Hosting and domain costs are not included unless stated.',                               4, true),
  ('Maintenance plans are available separately.',                                            5, true),
  ('Prices are quoted in LKR; other currencies available on request.',                       6, true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 7. pricing_addons
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.pricing_addons (name, sort_order, active) VALUES
  ('AI chat widget integration',     1, true),
  ('Advanced analytics dashboard',   2, true),
  ('Multi-language support',         3, true),
  ('Performance optimization audit', 4, true),
  ('Monthly maintenance retainer',   5, true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 8. industries + industry_challenges + industry_solutions
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.industries (icon, title, slug, summary, description, image, archived, sort_order) VALUES
  ('ShoppingBag', 'Retail',         'retail',       'E-commerce and point-of-sale solutions for retailers.',          'Custom e-commerce platforms, POS integrations, and inventory management for retail businesses.', '', false, 1),
  ('Hotel',       'Hospitality',    'hospitality',  'Booking and management systems for hotels and resorts.',         'Reservation systems, guest experience tools, and operations management for the hospitality sector.', '', false, 2),
  ('HeartPulse',  'Healthcare',     'healthcare',   'Secure, compliant software for clinics and providers.',          'Patient portals, appointment scheduling, and secure records management for healthcare providers.', '', false, 3),
  ('Factory',     'Manufacturing',  'manufacturing','Production tracking and ERP tools for manufacturers.',           'Production monitoring, supply chain tools, and custom ERP modules for manufacturing operations.', '', false, 4)
ON CONFLICT (slug) DO NOTHING;

-- Retail challenges
INSERT INTO public.industry_challenges (industry_id, challenge, sort_order)
SELECT i.id, c.challenge, c.sort_order
FROM public.industries i
CROSS JOIN (VALUES
  ('Manual inventory tracking leads to stockouts',        1),
  ('No online sales channel',                             2),
  ('Disconnected POS and e-commerce systems',             3)
) AS c(challenge, sort_order)
WHERE i.slug = 'retail'
ON CONFLICT DO NOTHING;

-- Retail solutions
INSERT INTO public.industry_solutions (industry_id, solution, sort_order)
SELECT i.id, s.solution, s.sort_order
FROM public.industries i
CROSS JOIN (VALUES
  ('Unified e-commerce and inventory platform',           1),
  ('Integrated POS syncing in real time',                 2),
  ('Automated reorder alerts',                           3)
) AS s(solution, sort_order)
WHERE i.slug = 'retail'
ON CONFLICT DO NOTHING;

-- Hospitality challenges
INSERT INTO public.industry_challenges (industry_id, challenge, sort_order)
SELECT i.id, c.challenge, c.sort_order
FROM public.industries i
CROSS JOIN (VALUES
  ('Manual booking processes and double bookings',        1),
  ('No online reservation channel',                       2),
  ('Guest experience gaps',                               3)
) AS c(challenge, sort_order)
WHERE i.slug = 'hospitality'
ON CONFLICT DO NOTHING;

-- Hospitality solutions
INSERT INTO public.industry_solutions (industry_id, solution, sort_order)
SELECT i.id, s.solution, s.sort_order
FROM public.industries i
CROSS JOIN (VALUES
  ('Real-time online booking system',                    1),
  ('Automated confirmation and reminders',               2),
  ('Guest experience dashboard',                         3)
) AS s(solution, sort_order)
WHERE i.slug = 'hospitality'
ON CONFLICT DO NOTHING;

-- Healthcare challenges
INSERT INTO public.industry_challenges (industry_id, challenge, sort_order)
SELECT i.id, c.challenge, c.sort_order
FROM public.industries i
CROSS JOIN (VALUES
  ('Paper-based patient records',                        1),
  ('Inefficient appointment scheduling',                 2),
  ('Data privacy and compliance concerns',               3)
) AS c(challenge, sort_order)
WHERE i.slug = 'healthcare'
ON CONFLICT DO NOTHING;

-- Healthcare solutions
INSERT INTO public.industry_solutions (industry_id, solution, sort_order)
SELECT i.id, s.solution, s.sort_order
FROM public.industries i
CROSS JOIN (VALUES
  ('Secure digital patient records',                     1),
  ('Online appointment scheduling',                      2),
  ('Compliance-first architecture',                      3)
) AS s(solution, sort_order)
WHERE i.slug = 'healthcare'
ON CONFLICT DO NOTHING;

-- Manufacturing challenges
INSERT INTO public.industry_challenges (industry_id, challenge, sort_order)
SELECT i.id, c.challenge, c.sort_order
FROM public.industries i
CROSS JOIN (VALUES
  ('No real-time production visibility',                 1),
  ('Manual supply chain tracking',                       2),
  ('Siloed systems across departments',                  3)
) AS c(challenge, sort_order)
WHERE i.slug = 'manufacturing'
ON CONFLICT DO NOTHING;

-- Manufacturing solutions
INSERT INTO public.industry_solutions (industry_id, solution, sort_order)
SELECT i.id, s.solution, s.sort_order
FROM public.industries i
CROSS JOIN (VALUES
  ('Real-time production monitoring dashboard',          1),
  ('Supply chain tracking system',                       2),
  ('Integrated ERP modules',                             3)
) AS s(solution, sort_order)
WHERE i.slug = 'manufacturing'
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 9. trusted_companies
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.trusted_companies (name, category, description, featured, logo, website_url, demo_url, sort_order, published) VALUES
  ('ShopMate',              'Retail',        'E-commerce platform for retail.',         true,  '', '', '', 1, true),
  ('Unic Motors & Services','Automotive',    'Automotive service management.',          true,  '', '', '', 2, true),
  ('Dubai Store',           'Retail',        'Online store for Dubai-based retailer.',   false, '', '', '', 3, true),
  ('Assalafiya Book Shop',  'Retail',        'Bookstore management system.',             false, '', '', '', 4, true),
  ('TamDrill',              'Industrial',    'Drilling services management.',            false, '', '', '', 5, true),
  ('Amaluna Resorts',       'Hospitality',   'Hospitality booking system.',              true,  '', '', '', 6, true),
  ('Wijesinghe Jewellers',  'Retail',        'Jewellery inventory and POS.',             false, '', '', '', 7, true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 10. policies
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.policies (title, slug, version, status, body, sort_order) VALUES
  ('Privacy Policy',  'privacy-policy',  '1.0', 'active', 'This Privacy Policy describes how Mistravora collects, uses, and protects your data. [Full body to be expanded.]', 1),
  ('Terms of Service','terms-of-service','1.0', 'active', 'These Terms of Service govern your use of Mistravora websites and services. [Full body to be expanded.]',          2),
  ('Cookie Policy',   'cookie-policy',   '1.0', 'active', 'This Cookie Policy explains how Mistravora uses cookies and similar technologies. [Full body to be expanded.]',   3),
  ('Refund Policy',   'refund-policy',   '1.0', 'active', 'This Refund Policy outlines the conditions for refunds on Mistravora projects. [Full body to be expanded.]',      4)
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 11. contact_info
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.contact_info (headline, description, address, email, phone, whatsapp) VALUES
  ('Get in Touch',
   'Talk to Mistravora about your next project — we reply within one business day.',
   'Paragahadeniya, Kurunegala, Sri Lanka',
   'hello@mistravora.com',
   '+94 77 330 6063',
   '94773306063')
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 12. social_media
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.social_media (platform, url, icon, sort_order, published) VALUES
  ('LinkedIn',   'https://www.linkedin.com/company/mistravora', 'Linkedin',   1, true),
  ('X (Twitter)','https://x.com/mistravora',                    'Twitter',    2, true),
  ('Facebook',   'https://facebook.com/mistravora',             'Facebook',   3, true),
  ('Instagram',  'https://instagram.com/mistravora',            'Instagram',  4, true),
  ('WhatsApp',   'https://wa.me/94773306063',                   'MessageCircle', 5, true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 13. faqs
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.faqs (page, question, answer, sort_order, published) VALUES
  ('general',  'What services does Mistravora offer?',                'We build web platforms, custom dashboards, e-commerce sites, and AI-powered tools for businesses of all sizes.', 1, true),
  ('general',  'How much does a project cost?',                       'Projects start at LKR 150,000 for a marketing site and scale based on scope. Custom builds are quoted individually.', 2, true),
  ('general',  'How long does a typical project take?',               'A marketing site takes 2-4 weeks. Custom platforms typically take 6-12 weeks depending on complexity.', 3, true),
  ('general',  'Do you work with clients outside Sri Lanka?',         'Yes. We work with clients worldwide and communicate via WhatsApp, email, and video calls.', 4, true),
  ('general',  'What is your development process?',                   'Discovery, design, development, review, and launch — with clear milestones and regular check-ins throughout.', 5, true),
  ('general',  'Do you provide ongoing maintenance?',                 'Yes. We offer monthly maintenance retainers for updates, monitoring, and support.', 6, true),
  ('general',  'Can you integrate AI features into my product?',      'Absolutely. We build AI assistants, automation, and analytics features using models like Anthropic Claude.', 7, true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 14. benefits
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.benefits (icon, title, description, sort_order, published) VALUES
  ('Gauge',        'Fast by default',       'We engineer for speed from the first line of code, not as an afterthought.', 1, true),
  ('ShieldCheck',  'Secure & private',      'Security and privacy best practices baked into every project.',            2, true),
  ('Search',       'SEO-ready',             'Structured data and semantic markup help you rank from day one.',          3, true),
  ('Smartphone',   'Mobile-first',          'Every build is designed mobile-first and tested across devices.',          4, true),
  ('Sparkles',     'AI leverage',           'We use AI internally to ship faster and externally to add real value.',    5, true),
  ('Headset',      'Real support',          'You talk to the people who build your product, not a ticket queue.',       6, true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 15. testimonials
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.testimonials (quote, name, role, avatar, rating, sort_order, published) VALUES
  ('Mistravora delivered our e-commerce platform ahead of schedule and it converted from day one.', 'Rashid', 'Owner, ShopMate', '', 5, 1, true),
  ('The booking system they built transformed how we manage reservations. No more double bookings.', 'Manager', 'Operations, Amaluna Resorts', '', 5, 2, true),
  ('Fast, professional, and genuinely invested in our success. Highly recommended.', 'Nimal', 'Director, Unic Motors', '', 5, 3, true),
  ('Their AI assistant saved our support team hours every week. Real impact, real fast.', 'Aisha', 'CEO, Dubai Store', '', 5, 4, true)
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 16. tech_stack
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.tech_stack (name, category, logo, sort_order, published) VALUES
  ('React',             'Frontend',  '', 1,  true),
  ('Next.js',           'Frontend',  '', 2,  true),
  ('TypeScript',        'Language',  '', 3,  true),
  ('Tailwind CSS',      'Frontend',  '', 4,  true),
  ('Node.js',           'Backend',   '', 5,  true),
  ('Supabase',          'Backend',   '', 6,  true),
  ('PostgreSQL',        'Database',  '', 7,  true),
  ('Three.js',          'Frontend',  '', 8,  true),
  ('Anthropic Claude',  'AI',        '', 9,  true),
  ('AWS S3',            'Cloud',     '', 10, true),
  ('Cloudflare',        'Cloud',     '', 11, true),
  ('Vercel',            'Cloud',     '', 12, true),
  ('Framer Motion',     'Frontend',  '', 13, true),
  ('React Query',       'Frontend',  '', 14, true),
  ('Zod',               'Backend',   '', 15, true),
  ('Drizzle ORM',       'Backend',   '', 16, true),
  ('OpenAI',            'AI',        '', 17, true),
  ('Stripe',            'Payments',  '', 18, true),
  ('Resend',            'Email',     '', 19, true),
  ('Redis',             'Database',  '', 20, true),
  ('Docker',            'DevOps',    '', 21, true),
  ('GitHub Actions',    'DevOps',    '', 22, true),
  ('Sentry',            'Monitoring','', 23, true),
  ('PostHog',           'Analytics', '', 24, true)
ON CONFLICT DO NOTHING;
