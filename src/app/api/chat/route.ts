import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { pricingTiers, site, solutions } from "@/lib/site";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { serverEnv } from "@/lib/env";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

type DbContext = {
  solutions: { title: string; description: string }[];
  caseStudies: { title: string; summary: string | null }[];
  posts: { title: string }[];
  jobs: { title: string; location: string | null; type: string | null }[];
};

const pricingText = pricingTiers
  .map((tier) => `${tier.name}: ${tier.price} — ${tier.description}`)
  .join("\n");

async function loadContext(): Promise<DbContext> {
  const fallback: DbContext = {
    solutions: [...solutions],
    caseStudies: [],
    posts: [],
    jobs: [],
  };

  try {
    const supabase = await createClient();
    const [solutionsRes, caseStudiesRes, postsRes, jobsRes] =
      await Promise.all([
        supabase.from("solutions").select("title, description").limit(12),
        supabase
          .from("case_studies")
          .select("title, summary")
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
  const m = message.toLowerCase();

  if (/(^|\b)(hi|hello|hey|ayubowan|good morning|good evening)\b/.test(m)) {
    return "Hello! I'm the Mistravora assistant. I can help with our services, pricing, timelines, free tools, or how to start a project. What would you like to know?";
  }

  if (/(price|pricing|cost|how much|quote|budget|lkr|fee)/.test(m)) {
    return `Here's our current pricing:\n\n${pricingText}\n\nEvery project is scoped after a free consultation. Try the cost calculator at /tools/cost-calculator for an instant estimate, or message us on WhatsApp (${site.phone}).`;
  }

  if (/(service|solution|what do you (do|build|offer)|offer|build|develop)/.test(m)) {
    const list = ctx.solutions
      .map((solution) => `• ${solution.title}: ${solution.description}`)
      .join("\n");
    return `Here's what we build:\n\n${list}\n\nDetails at /solutions — or tell me about your project and I'll point you the right way.`;
  }

  if (/(contact|email|phone|whatsapp|reach|talk|call)/.test(m)) {
    return `You can reach us anytime:\n\n• Email: ${site.email}\n• Phone/WhatsApp: ${site.phone}\n• Contact form: /contact\n\nWe reply within one business day.`;
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
    return "Typical timelines: a marketing website takes 2–4 weeks, e-commerce 4–8 weeks, and custom platforms 6–12 weeks. We agree milestones before we start — and we hit them. Share your deadline via /contact.";
  }

  if (/(tool|calculator|audit|roi|free)/.test(m)) {
    return "We have free tools at /tools:\n\n• Cost calculator — instant project estimate\n• ROI calculator — payback period for a new site\n• Website audit — free Lighthouse scores for your current site\n\nNo sign-up needed.";
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

const SYSTEM_PROMPT = `You are Mistravora's AI assistant on mistravora.com. Mistravora is a Sri Lankan software company that builds high-performance websites, web platforms, e-commerce stores, business software, and AI-powered features.

Rules you must follow:
- Answer only questions about Mistravora's services, pricing, process, technologies, and general web/software topics.
- Keep replies concise — under 150 words.
- Never invent client names, case studies, or prices beyond the live data provided below.
- When a user shows buying intent or asks for a quote, point them to WhatsApp (+94 77 330 6063), the contact page (/contact), or the cost calculator (/tools/cost-calculator).
- If asked something unrelated to Mistravora or web/software, politely decline and redirect to how Mistravora can help.
- Key contact info: hello@mistravora.com, +94 77 330 6063, based in Paragahadeniya, Kurunegala, Sri Lanka, working worldwide.

Live site data:
`;

export async function POST(request: Request) {
  const limited = checkRateLimit(request, RATE_LIMITS.chat);
  if (limited) return limited;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ctx = await loadContext();
  const lastMessage = parsed.data.messages[parsed.data.messages.length - 1];
  const apiKey = serverEnv.ANTHROPIC_API_KEY;

  // Keyless mode — answers assembled from live Supabase content.
  if (!apiKey) {
    return NextResponse.json({ reply: localReply(lastMessage.content, ctx) });
  }

  const contextText = [
    `Solutions: ${ctx.solutions.map((solution) => `${solution.title} — ${solution.description}`).join("; ")}`,
    ctx.caseStudies.length > 0
      ? `Case studies: ${ctx.caseStudies.map((caseStudy) => caseStudy.title).join("; ")}`
      : "",
    ctx.posts.length > 0
      ? `Blog posts: ${ctx.posts.map((post) => post.title).join("; ")}`
      : "",
    ctx.jobs.length > 0
      ? `Open roles: ${ctx.jobs.map((job) => job.title).join("; ")}`
      : "",
    `Pricing:\n${pricingText}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 600,
        system: SYSTEM_PROMPT + contextText,
        messages: parsed.data.messages,
      }),
    });

    if (!response.ok) {
      console.error(await response.text());
      return NextResponse.json(
        { reply: localReply(lastMessage.content, ctx) },
        { status: 200 }
      );
    }

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const reply =
      data.content
        ?.filter((block) => block.type === "text")
        .map((block) => block.text ?? "")
        .join("") ?? "";

    return NextResponse.json({
      reply: reply || localReply(lastMessage.content, ctx),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: localReply(lastMessage.content, ctx) });
  }
}

