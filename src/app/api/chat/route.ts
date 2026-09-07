import { getBusinessProfile } from "@/lib/business-profile";
import type { BusinessProfile } from "@/lib/business-profile-data";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

type DbContext = {
  profile: BusinessProfile;
  solutions: { title: string; description: string }[];
  caseStudies: { title: string; summary: string | null }[];
  posts: { title: string }[];
  jobs: { title: string; location: string | null; type: string | null }[];
};

const pricingText = "Request a written quotation from our team. No public price or delivery guarantee is confirmed.";

async function loadContext(): Promise<DbContext> {
  const profile = await getBusinessProfile();
  const fallback: DbContext = {
    profile,
    solutions: profile.offering.split("\n").filter(Boolean).map(title => ({title, description: "Built around your requirements."})),
    caseStudies: [],
    posts: [],
    jobs: [],
  };

  try {
    const supabase = await createClient();
    const [solutionsRes, caseStudiesRes, postsRes, jobsRes] =
      await Promise.all([
        supabase.from("services").select("title, description").eq("published", true).limit(30),
        supabase
          .from("case_studies")
          .select("title, summary:outcome")
          .eq("published", true)
          .limit(6),
        supabase.from("posts").select("title").eq("published", true).limit(6),
        supabase
          .from("jobs")
          .select("title, location, type")
          .eq("published", true)
          .limit(6),
      ]);

    return {
      profile,
      solutions: solutionsRes.data?.length
        ? solutionsRes.data
        : fallback.solutions,
      caseStudies: caseStudiesRes.data ?? [],
      posts: postsRes.data ?? [],
      jobs: jobsRes.data ?? [],
    };
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

function localReply(message: string, ctx: DbContext): string {
  const site = ctx.profile;
  const m = message.toLowerCase();

  if (/(^|\b)(hi|hello|hey|ayubowan|good morning|good evening)\b/.test(m)) {
    return "Hello! I'm the Mistravora assistant. I can help with our services, pricing, timelines, free tools, or how to start a project. What would you like to know?";
  }

  if (/(price|pricing|cost|how much|quote|budget|lkr|fee)/.test(m)) {
    return `Here's our current pricing:\n\n${pricingText}\n\nDiscuss your scope through /contact or message us on WhatsApp (${site.phone}).`;
  }

  if (/(service|solution|what do you (do|build|offer)|offer|build|develop)/.test(m)) {
    const list = ctx.solutions
      .map((solution) => `• ${solution.title}: ${solution.description}`)
      .join("\n");
    return `Here's what we build:\n\n${list}\n\nDetails at /solutions — or tell me about your project and I'll point you the right way.`;
  }

  if (/(contact|email|phone|whatsapp|reach|talk|call)/.test(m)) {
    return `You can reach us anytime:\n\n• Email: ${site.email}\n• Phone/WhatsApp: ${site.phone}\n• Contact form: /contact\n\n${site.availability}. ${site.response}.`;
  }

  if (/(where|location|based|address|kurunegala|sri lanka)/.test(m)) {
    return `We're based in ${site.address}, and work with clients worldwide — everything runs smoothly remotely.`;
  }

  if (/(job|career|hiring|vacancy|join)/.test(m)) {
    if (ctx.jobs.length > 0) {
      const list = ctx.jobs
        .map(
          (job) =>
            `• ${job.title}${job.type ? ` (${job.type})` : ""}${job.location ? ` — ${job.location}` : ""}`
        )
        .join("\n");
      return `We're hiring! Open roles:\n\n${list}\n\nApply via /careers.`;
    }
    return `No open roles right now, but we're always happy to meet talented people — send your portfolio to ${site.email} and keep an eye on /careers.`;
  }

  if (/(portfolio|case stud|previous work|clients|examples|past project)/.test(m)) {
    if (ctx.caseStudies.length > 0) {
      const list = ctx.caseStudies
        .map((caseStudy) => `• ${caseStudy.title}`)
        .join("\n");
      return `Recent work:\n\n${list}\n\nSee /projects for the full stories.`;
    }
    return "Our case studies are being prepared — meanwhile, everything on this site (the calculators, the audit tool, this chat) is built by us and shows how we work. Ask us on WhatsApp for a walkthrough.";
  }

  if (/(how long|timeline|delivery|deadline|duration)/.test(m)) {
    return "Delivery dates depend on the agreed scope, inputs and integrations. Request a written schedule via /contact.";
  }

  if (/(tool|calculator|audit|roi|free)/.test(m)) {
    return "We have free tools at /tools:\n\n• Cost planning — contact the team for a quotation\n• ROI planning — discuss assumptions; no returns are guaranteed\n• Website audit — free Lighthouse scores for your current site\n\nNo sign-up needed.";
  }

  if (/(blog|article|news|insight)/.test(m)) {
    if (ctx.posts.length > 0) {
      const list = ctx.posts.map((post) => `• ${post.title}`).join("\n");
      return `Latest from our blog:\n\n${list}\n\nRead more at /blog.`;
    }
    return "Our blog launches soon — check /blog for upcoming articles on web performance and digital growth.";
  }

  if (/(thank|great|awesome|nice)/.test(m)) {
    return "You're welcome! Anything else — services, pricing, or starting a project?";
  }

  return "I can help with:\n\n• Services & solutions — what we build\n• Pricing — tiers and estimates\n• Process & timelines\n• Free tools — cost calculator, ROI, website audit\n• Contact — how to reach the team\n\nWhat would you like to know?";
}

export async function POST(request: Request) {
  const limited = checkRateLimit(request, RATE_LIMITS.chat);
  if (limited) return limited;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ctx = await loadContext();
  const lastMessage = parsed.data.messages[parsed.data.messages.length - 1];
  // External AI delivery is paused pending provider/data-processing review.
  return NextResponse.json({ reply: localReply(lastMessage.content, ctx) }, { headers: { "Cache-Control": "no-store" } });
}
