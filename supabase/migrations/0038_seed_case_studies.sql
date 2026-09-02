-- 0038: seed case_studies
-- Insert 7 case studies with child rows for results and technologies.
-- Uses ON CONFLICT DO NOTHING so re-running is safe.
-- Child rows are linked to parents via the slug column using subqueries.

-- ════════════════════════════════════════════════════════════════════════
-- 1. ShopMate — E-commerce platform for retail
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.case_studies (
  title, slug, client, industry, location, date,
  problem_statement, solution, outcome, body, cover_image,
  published, sort_order, status
) VALUES (
  'ShopMate — E-commerce Platform',
  'shopmate-ecommerce-platform',
  'ShopMate',
  'Retail',
  'Colombo, Sri Lanka',
  '2024-01-15',
  'ShopMate managed orders manually across spreadsheets, leading to stockouts, missed orders, and no online sales channel.',
  'We built a custom e-commerce platform with real-time inventory sync, integrated POS, and automated reorder alerts.',
  '65% increase in online orders within the first quarter of launch.',
  'ShopMate needed a unified commerce platform that could handle both online and in-store sales without double entry. We delivered a custom Next.js storefront with a Supabase-backed admin dashboard, real-time inventory syncing, and a POS integration that keeps stock levels accurate across every channel. Automated reorder alerts ensure popular products never run out.',
  '',
  true,
  1,
  'active'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.case_study_results (case_study_id, result, sort_order)
SELECT c.id, r.result, r.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('65% increase in online orders',         1),
  ('Real-time inventory accuracy',          2),
  ('40% reduction in stockouts',            3),
  ('2x faster order fulfillment',           4)
) AS r(result, sort_order)
WHERE c.slug = 'shopmate-ecommerce-platform'
ON CONFLICT DO NOTHING;

INSERT INTO public.case_study_technologies (case_study_id, technology, sort_order)
SELECT c.id, t.technology, t.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('Next.js',     1),
  ('Supabase',    2),
  ('PostgreSQL',  3),
  ('Stripe',      4),
  ('Tailwind CSS',5)
) AS t(technology, sort_order)
WHERE c.slug = 'shopmate-ecommerce-platform'
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 2. Unic Motors & Services — Automotive service management
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.case_studies (
  title, slug, client, industry, location, date,
  problem_statement, solution, outcome, body, cover_image,
  published, sort_order, status
) VALUES (
  'Unic Motors & Services — Service Management',
  'unic-motors-service-management',
  'Unic Motors & Services',
  'Automotive',
  'Kurunegala, Sri Lanka',
  '2023-09-10',
  'Unic Motors tracked service appointments and vehicle history on paper, causing missed appointments and lost records.',
  'We built a service management system with appointment scheduling, vehicle history tracking, and automated SMS reminders.',
  '50% reduction in missed appointments and faster service turnaround.',
  'Unic Motors needed a reliable way to manage service bookings and keep vehicle history accessible. We delivered a custom dashboard with appointment scheduling, digital vehicle service records, and automated SMS reminders to customers. The system reduced no-shows and improved customer satisfaction.',
  '',
  true,
  2,
  'active'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.case_study_results (case_study_id, result, sort_order)
SELECT c.id, r.result, r.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('50% reduction in missed appointments',  1),
  ('Faster service turnaround',             2),
  ('Digital vehicle history records',       3)
) AS r(result, sort_order)
WHERE c.slug = 'unic-motors-service-management'
ON CONFLICT DO NOTHING;

INSERT INTO public.case_study_technologies (case_study_id, technology, sort_order)
SELECT c.id, t.technology, t.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('Next.js',     1),
  ('Node.js',     2),
  ('Supabase',    3),
  ('Resend',      4)
) AS t(technology, sort_order)
WHERE c.slug = 'unic-motors-service-management'
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 3. Dubai Store — Online store for Dubai-based retailer
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.case_studies (
  title, slug, client, industry, location, date,
  problem_statement, solution, outcome, body, cover_image,
  published, sort_order, status
) VALUES (
  'Dubai Store — Online Store',
  'dubai-store-online-store',
  'Dubai Store',
  'Retail',
  'Dubai, UAE',
  '2023-11-20',
  'Dubai Store had no online presence and relied entirely on foot traffic, limiting growth beyond their physical location.',
  'We launched a full-featured online store with multi-currency support, AI-powered product search, and integrated payments.',
  'Online sales matched 30% of in-store revenue within two months.',
  'Dubai Store wanted to expand beyond their physical storefront. We built a fast, mobile-first e-commerce site with multi-currency support for their international customers, AI-powered product search, and seamless Stripe checkout. Within two months, online sales accounted for 30% of total revenue.',
  '',
  true,
  3,
  'active'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.case_study_results (case_study_id, result, sort_order)
SELECT c.id, r.result, r.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('Online sales matched 30% of in-store revenue', 1),
  ('AI-powered search increased conversions',      2),
  ('Multi-currency checkout for global customers', 3),
  ('2x average order value from upsells',          4)
) AS r(result, sort_order)
WHERE c.slug = 'dubai-store-online-store'
ON CONFLICT DO NOTHING;

INSERT INTO public.case_study_technologies (case_study_id, technology, sort_order)
SELECT c.id, t.technology, t.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('Next.js',          1),
  ('Supabase',         2),
  ('Stripe',           3),
  ('Anthropic Claude', 4),
  ('Vercel',           5)
) AS t(technology, sort_order)
WHERE c.slug = 'dubai-store-online-store'
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 4. Assalafiya Book Shop — Bookstore management system
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.case_studies (
  title, slug, client, industry, location, date,
  problem_statement, solution, outcome, body, cover_image,
  published, sort_order, status
) VALUES (
  'Assalafiya Book Shop — Bookstore Management',
  'assalafiya-book-shop-management',
  'Assalafiya Book Shop',
  'Retail',
  'Kurunegala, Sri Lanka',
  '2023-06-05',
  'Assalafiya Book Shop managed inventory and sales manually, making it hard to track stock and bestsellers.',
  'We built a bookstore management system with barcode scanning, inventory tracking, and sales analytics.',
  'Inventory errors reduced by 80% and bestseller identification became instant.',
  'Assalafiya Book Shop needed a modern way to manage their growing inventory. We delivered a bookstore management system with barcode scanning for fast checkout, real-time inventory tracking, and a sales analytics dashboard that highlights bestsellers and slow-moving stock.',
  '',
  true,
  4,
  'active'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.case_study_results (case_study_id, result, sort_order)
SELECT c.id, r.result, r.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('80% reduction in inventory errors',      1),
  ('Instant bestseller identification',      2),
  ('3x faster checkout with barcode scanning',3)
) AS r(result, sort_order)
WHERE c.slug = 'assalafiya-book-shop-management'
ON CONFLICT DO NOTHING;

INSERT INTO public.case_study_technologies (case_study_id, technology, sort_order)
SELECT c.id, t.technology, t.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('React',       1),
  ('Node.js',     2),
  ('PostgreSQL',  3),
  ('Tailwind CSS',4)
) AS t(technology, sort_order)
WHERE c.slug = 'assalafiya-book-shop-management'
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 5. TamDrill — Drilling services management
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.case_studies (
  title, slug, client, industry, location, date,
  problem_statement, solution, outcome, body, cover_image,
  published, sort_order, status
) VALUES (
  'TamDrill — Drilling Services Management',
  'tamdrill-drilling-services-management',
  'TamDrill',
  'Industrial',
  'Kurunegala, Sri Lanka',
  '2023-03-18',
  'TamDrill tracked drilling projects and equipment on paper, leading to scheduling conflicts and equipment downtime.',
  'We built a project and equipment management system with scheduling, maintenance tracking, and reporting.',
  'Equipment downtime reduced by 45% and project scheduling became conflict-free.',
  'TamDrill needed better visibility into their drilling projects and equipment maintenance. We built a management system that tracks project schedules, equipment usage, and maintenance cycles. Automated maintenance alerts reduced downtime, and the scheduling module eliminated booking conflicts.',
  '',
  true,
  5,
  'active'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.case_study_results (case_study_id, result, sort_order)
SELECT c.id, r.result, r.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('45% reduction in equipment downtime',    1),
  ('Conflict-free project scheduling',       2),
  ('Automated maintenance alerts',           3),
  ('Real-time equipment utilization reports',4)
) AS r(result, sort_order)
WHERE c.slug = 'tamdrill-drilling-services-management'
ON CONFLICT DO NOTHING;

INSERT INTO public.case_study_technologies (case_study_id, technology, sort_order)
SELECT c.id, t.technology, t.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('Next.js',     1),
  ('Supabase',    2),
  ('PostgreSQL',  3),
  ('Docker',      4)
) AS t(technology, sort_order)
WHERE c.slug = 'tamdrill-drilling-services-management'
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 6. Amaluna Resorts — Hospitality booking system
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.case_studies (
  title, slug, client, industry, location, date,
  problem_statement, solution, outcome, body, cover_image,
  published, sort_order, status
) VALUES (
  'Amaluna Resorts — Booking System',
  'amaluna-resorts-booking-system',
  'Amaluna Resorts',
  'Hospitality',
  'Kurunegala, Sri Lanka',
  '2024-02-01',
  'Amaluna Resorts handled bookings by phone and email, resulting in double bookings and a poor guest experience.',
  'We built a real-time online booking system with automated confirmations, a guest portal, and channel management.',
  'Direct bookings increased by 70% and double bookings were eliminated entirely.',
  'Amaluna Resorts wanted to move away from manual booking management. We delivered a real-time online booking system with a guest portal for self-service reservations, automated email confirmations and reminders, and channel management to sync availability across platforms. Direct bookings surged and double bookings became a thing of the past.',
  '',
  true,
  6,
  'active'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.case_study_results (case_study_id, result, sort_order)
SELECT c.id, r.result, r.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('70% increase in direct bookings',          1),
  ('Double bookings eliminated',               2),
  ('Guest self-service portal',                3),
  ('Automated confirmation and reminders',     4)
) AS r(result, sort_order)
WHERE c.slug = 'amaluna-resorts-booking-system'
ON CONFLICT DO NOTHING;

INSERT INTO public.case_study_technologies (case_study_id, technology, sort_order)
SELECT c.id, t.technology, t.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('Next.js',     1),
  ('Supabase',    2),
  ('Resend',      3),
  ('Stripe',      4),
  ('Redis',       5)
) AS t(technology, sort_order)
WHERE c.slug = 'amaluna-resorts-booking-system'
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- 7. Wijesinghe Jewellers — Jewellery inventory and POS
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.case_studies (
  title, slug, client, industry, location, date,
  problem_statement, solution, outcome, body, cover_image,
  published, sort_order, status
) VALUES (
  'Wijesinghe Jewellers — Inventory & POS',
  'wijesinghe-jewellers-inventory-pos',
  'Wijesinghe Jewellers',
  'Retail',
  'Kurunegala, Sri Lanka',
  '2023-12-12',
  'Wijesinghe Jewellers tracked high-value inventory manually, risking errors, loss, and slow customer service.',
  'We built a jewellery inventory and POS system with gold rate tracking, item-level barcoding, and sales reporting.',
  'Inventory accuracy reached 99% and checkout time dropped by 60%.',
  'Wijesinghe Jewellers needed precise control over their high-value inventory. We built a POS and inventory system with live gold rate tracking, item-level barcoding for every piece, and detailed sales reporting. Inventory accuracy hit 99% and checkout became dramatically faster, improving the in-store experience.',
  '',
  true,
  7,
  'active'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.case_study_results (case_study_id, result, sort_order)
SELECT c.id, r.result, r.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('99% inventory accuracy',              1),
  ('60% faster checkout time',            2),
  ('Live gold rate tracking',             3),
  ('Detailed sales and stock reporting',  4)
) AS r(result, sort_order)
WHERE c.slug = 'wijesinghe-jewellers-inventory-pos'
ON CONFLICT DO NOTHING;

INSERT INTO public.case_study_technologies (case_study_id, technology, sort_order)
SELECT c.id, t.technology, t.sort_order
FROM public.case_studies c
CROSS JOIN (VALUES
  ('React',       1),
  ('Node.js',     2),
  ('PostgreSQL',  3),
  ('Tailwind CSS',4)
) AS t(technology, sort_order)
WHERE c.slug = 'wijesinghe-jewellers-inventory-pos'
ON CONFLICT DO NOTHING;
