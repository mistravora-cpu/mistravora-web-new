import { z } from "zod";


const projectTypes = [
  { id: "website", label: "Marketing website", base: 150_000 },
  { id: "ecommerce", label: "E-commerce store", base: 350_000 },
  { id: "webapp", label: "Web app / portal", base: 600_000 },
  { id: "custom", label: "Custom software", base: 800_000 },
];

const features = [
  { id: "cms", label: "CMS-managed content", price: 50_000 },
  { id: "blog", label: "Blog + SEO content system", price: 30_000 },
  { id: "portal", label: "Client portal / dashboard", price: 150_000 },
  { id: "ai", label: "AI assistant / AI features", price: 200_000 },
  { id: "i18n", label: "Multilingual (Sinhala/Tamil)", price: 80_000 },
  { id: "pwa", label: "Offline-ready PWA", price: 60_000 },
  { id: "integrations", label: "Integrations (CRM, payments, email)", price: 100_000 },
];

const timelines = [
  { id: "standard", label: "Standard", multiplier: 1 },
  { id: "fast", label: "Fast-track (+25%)", multiplier: 1.25 },
  { id: "flexible", label: "Flexible (−10%)", multiplier: 0.9 },
];

export const calculatorDefaults = { usdRate: 300, projectTypes, features, timelines };
const item = z.object({id:z.string().min(1),label:z.string().min(1)});
export const calculatorSchema = z.object({
 usdRate:z.number().positive(),
 projectTypes:z.array(item.extend({base:z.number().nonnegative()})).min(1),
 features:z.array(item.extend({price:z.number().nonnegative()})),
 timelines:z.array(item.extend({multiplier:z.number().positive()})).min(1),
}).refine(config => [config.projectTypes, config.features, config.timelines].every(items => new Set(items.map(item => item.id)).size === items.length), "IDs must be unique within each list");
export type CalculatorConfig = z.infer<typeof calculatorSchema>;
