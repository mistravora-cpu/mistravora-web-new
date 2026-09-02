"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Info,
  DollarSign,
  FileText,
  Briefcase,
  LayoutGrid,
  Factory,
  Users,
  Mail,
  BookOpen,
  Shield,
  Building2,
  Settings,
  Image as ImageIcon,
  Star,
  Megaphone,
  Smartphone,
  Cpu,
  Calculator,
  Send,
  Microscope,
  Layout,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackButtonClick } from "@/lib/track-event";

const navGroups = [
  {
    label: "Content",
    items: [
      { href: "/dashboard", label: "Home", icon: Home },
      { href: "/dashboard/hero", label: "Hero Sections", icon: Layout },
      { href: "/dashboard/about", label: "About", icon: Info },
      { href: "/dashboard/pricing", label: "Pricing", icon: DollarSign },
      { href: "/dashboard/pricing-calculator", label: "Pricing Calculator", icon: Calculator },
      { href: "/dashboard/solutions", label: "Solutions", icon: LayoutGrid },
      { href: "/dashboard/industries", label: "Industries", icon: Factory },
      { href: "/dashboard/case-studies", label: "Projects", icon: Briefcase },
      { href: "/dashboard/demo-apps", label: "Demo Apps", icon: Smartphone },
      { href: "/dashboard/tech-stack", label: "Tech Stack", icon: Cpu },
      { href: "/dashboard/blog", label: "Blog", icon: FileText },
      { href: "/dashboard/research", label: "Research", icon: Microscope },
      { href: "/dashboard/careers", label: "Careers", icon: Users },
    ],
  },
  {
    label: "Engagement",
    items: [
      { href: "/dashboard/contact", label: "Contact", icon: Mail },
      { href: "/dashboard/inquiries", label: "Inquiries", icon: Mail },
      { href: "/dashboard/trusted-companies", label: "Trusted Companies", icon: Building2 },
      { href: "/dashboard/testimonials", label: "Testimonials", icon: Star },
      { href: "/dashboard/newsletter", label: "Newsletter", icon: Send },
      { href: "/dashboard/resources", label: "Resources", icon: BookOpen },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/policies", label: "Policies", icon: Shield },
      { href: "/dashboard/marketing", label: "Marketing & SEO", icon: Megaphone },
      { href: "/dashboard/media", label: "Media", icon: ImageIcon },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-4">
      {navGroups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            {group.label}
          </p>
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => trackButtonClick("nav_" + item.label.toLowerCase().replace(/\s+/g, "_"), "dashboard_nav")}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
