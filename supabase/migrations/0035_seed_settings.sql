-- 0035: seed settings
-- Insert all site-wide configuration key/value pairs.
-- Uses ON CONFLICT DO NOTHING so re-running is safe.

-- ─── Site identity ──────────────────────────────────────────────────────
INSERT INTO public.settings (key, value) VALUES
  ('site_name',              'Mistravora'),
  ('site_tagline',           'Software Solutions & Digital Products'),
  ('site_title',             'Mistravora — Software Solutions & Digital Products'),
  ('site_email',             'hello@mistravora.com'),
  ('site_phone',             '+94 77 330 6063'),
  ('site_address',           'Paragahadeniya, Kurunegala, Sri Lanka'),
  ('site_whatsapp',          '94773306063'),
  ('site_geo_lat',           '7.421684'),
  ('site_geo_lng',           '80.466742'),
  ('footer_text',            'Mistravora — Building fast, accessible, conversion-focused digital products.'),
  ('business_hours',         'Mon-Fri 9:00-18:00'),
  ('timezone',               'Asia/Colombo')
ON CONFLICT (key) DO NOTHING;

-- ─── Feature toggles ────────────────────────────────────────────────────
INSERT INTO public.settings (key, value) VALUES
  ('show_business_hours',    'true'),
  ('enable_chat_widget',     'true'),
  ('enable_cookie_consent',  'true'),
  ('enable_newsletter',      'true')
ON CONFLICT (key) DO NOTHING;

-- ─── PWA ────────────────────────────────────────────────────────────────
INSERT INTO public.settings (key, value) VALUES
  ('pwa_theme_color',        '#6366f1'),
  ('pwa_background_color',   '#0a0a0a')
ON CONFLICT (key) DO NOTHING;

-- ─── Analytics & monitoring (empty by default) ──────────────────────────
INSERT INTO public.settings (key, value) VALUES
  ('gtm_container_id',       ''),
  ('ga4_measurement_id',     ''),
  ('clarity_id',             ''),
  ('hotjar_id',              ''),
  ('sentry_dsn',             ''),
  ('logrocket_id',           '')
ON CONFLICT (key) DO NOTHING;

-- ─── Advertising pixels (empty by default) ──────────────────────────────
INSERT INTO public.settings (key, value) VALUES
  ('meta_pixel_id',                  ''),
  ('meta_capi_token',                ''),
  ('facebook_app_id',                ''),
  ('google_ads_conversion_id',       ''),
  ('google_ads_conversion_label',    ''),
  ('google_remarketing_tag_id',      ''),
  ('microsoft_uet_tag_id',           ''),
  ('linkedin_insight_tag_id',        ''),
  ('tiktok_pixel_id',                ''),
  ('pinterest_tag_id',               ''),
  ('reddit_pixel_id',                ''),
  ('snap_pixel_id',                  ''),
  ('x_pixel_id',                     '')
ON CONFLICT (key) DO NOTHING;

-- ─── Search engine verification (empty by default) ──────────────────────
INSERT INTO public.settings (key, value) VALUES
  ('google_search_console_verification', ''),
  ('bing_webmaster_verification',        ''),
  ('yandex_verification',                ''),
  ('baidu_verification',                 ''),
  ('pinterest_verification',             ''),
  ('facebook_domain_verification',       '')
ON CONFLICT (key) DO NOTHING;

-- ─── SEO / social defaults ──────────────────────────────────────────────
INSERT INTO public.settings (key, value) VALUES
  ('default_og_image',       ''),
  ('twitter_handle',         '@mistravora'),
  ('twitter_creator',        '@mistravora'),
  ('telegram_url',           ''),
  ('messenger_url',          '')
ON CONFLICT (key) DO NOTHING;
