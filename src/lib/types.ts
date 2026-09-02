export type PricingPackage = {
  package_name: string;
  timeline: string;
  package_features: string[];
};

export type Solution = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  icon: string | null;
  category: string | null;
  short_description: string | null;
  long_description: string | null;
  technologies: string[];
  image: string | null;
  sort_order: number;
  features: string[];
  services: string[];
  process_steps: string[];
  pricing_packages: PricingPackage[];
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  industry: string | null;
  location: string | null;
  date: string | null;
  problem_statement: string | null;
  solution: string | null;
  outcome: string | null;
  body: string | null;
  cover_image: string | null;
  results: string[];
  technologies: string[];
  sort_order: number;
  status: 'active' | 'draft' | 'archived';
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  cover_image: string | null;
  author: string | null;
  author_role: string | null;
  medium_url: string | null;
  category: string | null;
  read_time: string | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
};

export type Job = {
  id: string;
  title: string;
  location: string | null;
  type: string | null;
  description: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Setting = {
  key: string;
  value: string | null;
};

export type HeroSection = {
  id: string;
  page: string;
  badge: string | null;
  headline: string;
  highlighted_text: string | null;
  description: string | null;
  primary_button_text: string | null;
  primary_button_link: string | null;
  secondary_button_text: string | null;
  secondary_button_link: string | null;
  created_at: string;
  updated_at: string;
};

export type ValueCard = {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Statistic = {
  id: string;
  value: string;
  label: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type CoreValue = {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo: string | null;
  linkedin: string | null;
  x_handle: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type PricingTier = {
  id: string;
  name: string;
  tagline: string | null;
  price: string | null;
  description: string | null;
  icon: string | null;
  button_text: string | null;
  features: string[];
  sort_order: number;
  popular: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type PricingNote = {
  id: string;
  text: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type PricingAddon = {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Industry = {
  id: string;
  icon: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  image: string | null;
  challenges: string[];
  solutions: string[];
  archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Resource = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  featured: boolean;
  downloads: number;
  file_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type TrustedCompany = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  featured: boolean;
  logo: string | null;
  website_url: string | null;
  demo_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Policy = {
  id: string;
  title: string;
  slug: string;
  version: string;
  status: "active" | "draft" | "archived";
  body: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ContactInfo = {
  id: string;
  headline: string;
  description: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialMedia = {
  id: string;
  platform: string;
  url: string;
  icon: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Faq = {
  id: string;
  page: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type DemoApp = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  url: string | null;
  screenshot: string | null;
  image: string | null;
  industry: string | null;
  solution_id: string | null;
  features: string[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Benefit = {
  id: string;
  icon: string;
  title: string;
  description: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string | null;
  rating: number;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type MarketingSettings = {
  ga4_measurement_id: string;
  gtm_container_id: string;
  clarity_id: string;
  hotjar_id: string;
  sentry_dsn: string;
  logrocket_id: string;
  meta_pixel_id: string;
  meta_capi_token: string;
  google_ads_conversion_id: string;
  google_ads_conversion_label: string;
  google_remarketing_tag_id: string;
  microsoft_uet_tag_id: string;
  linkedin_insight_tag_id: string;
  tiktok_pixel_id: string;
  pinterest_tag_id: string;
  reddit_pixel_id: string;
  snap_pixel_id: string;
  x_pixel_id: string;
  google_search_console_verification: string;
  bing_webmaster_verification: string;
  yandex_verification: string;
  baidu_verification: string;
  pinterest_verification: string;
  facebook_domain_verification: string;
  default_og_image: string;
  twitter_handle: string;
  twitter_creator: string;
  facebook_app_id: string;
  telegram_url: string;
  messenger_url: string;
  pwa_theme_color: string;
  pwa_background_color: string;
};

export type TechStack = {
  id: string;
  name: string;
  category: string | null;
  logo: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type MediaItem = {
  id: string;
  name: string;
  alt_text: string | null;
  note: string | null;
  url: string;
  file_key: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: "active" | "unsubscribed" | "bounced";
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type Research = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string | null;
  category: string | null;
  tags: string[];
  cover_image: string | null;
  author: string | null;
  published: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// ─── AI Discovery Specification types ──────────────────────────────────

export type Author = {
  id: string;
  name: string;
  slug: string;
  role: string | null;
  bio: string | null;
  photo: string | null;
  linkedin: string | null;
  x_handle: string | null;
  github: string | null;
  expertise: string | null;
  created_at: string;
  updated_at: string;
};

export type GlossaryTerm = {
  id: string;
  term: string;
  slug: string;
  definition: string;
  explanation: string | null;
  examples: string | null;
  related_concepts: string | null;
  mistravora_service_relationship: string | null;
  category: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type KnowledgeBaseArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string | null;
  category: string | null;
  author_id: string | null;
  cover_image: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  body: string | null;
  icon: string | null;
  category: string | null;
  cover_image: string | null;
  features: string[];
  technologies: string[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};
