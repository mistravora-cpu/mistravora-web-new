import { applySeoOverrides } from "@/lib/seo-overrides";
import { CalendarCheck2, Clock, Video } from "lucide-react";
import { ContentShell } from "@/components/content-page";
import { MeetingForm } from "@/components/meeting/meeting-form";
import { pageMetadata } from "@/lib/seo";

const baseMetadata = pageMetadata(
  "Book a Free Consultation Meeting",
  "Book a free 30-minute consultation with Mistravora's software team. Choose a preferred date and time to discuss your website, app or custom software project.",
  "/book",
);

const points = [
  { icon: Clock, title: "30 minutes, free", text: "A focused conversation about your goals, with no obligation." },
  { icon: Video, title: "Video, phone or in person", text: "Meet the way that suits you, in Sri Lanka time." },
  { icon: CalendarCheck2, title: "Confirmed by email", text: "We confirm the exact time and send the meeting details." },
];

export default function BookPage() {
  return (
    <ContentShell title="Book a consultation" description="Tell us when suits you and what you'd like to discuss. Our team will confirm the meeting by email.">
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-7"><MeetingForm /></div>
        <ul className="space-y-6">
          {points.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Icon aria-hidden className="h-5 w-5 text-primary" /></span>
              <span><span className="block font-semibold">{title}</span><span className="text-sm leading-6 text-muted-foreground">{text}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </ContentShell>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
